var elements = {
    replacerKeyButton: document.querySelector("#replacer-key-button"),
    replacerKeyMessage: document.querySelector("#replacer-key-field-message"),
    availableKeysToggle: document.querySelector("#toggle-available-keys"),
    availableKeys: document.querySelector("#available-keys"),
    aliasesTable: document.querySelector("#aliases-table"),
    aliasTableMessage: document.querySelector("#alias-table-message"),
    newGroupOpener: document.querySelector("#open-new-alias-group"),
    newGroupForm: document.querySelector("#new-alias-group-form"),
    newGroupNameInput: document.querySelector("input[name='group-name']"),
    newGroupCancelButton: document.querySelector("#cancel-new-alias-group"),
    newAliasGroupMessage: document.querySelector("#group-name-field-message"),
    inspectV1AliasesButton: document.querySelector("#inspect-v1-aliases-button"),
    rawV1AliasesCodeBlock: document.querySelector("#raw-v1-aliases"),
};

var state = {
    isListeningForNewKey: false,
    isAvailableKeysVisible: false,
    selectedAliasGroup: null,
    draggedState: null,
};

populateReplacerKey();
populateAvailableKeysToggle();
populateAvailableKeys();
populateAliasGroups();

// Listeners
elements.replacerKeyButton.addEventListener("click", function() {
    if (!state.isListeningForNewKey) {
        resetReplacerKeyValidation();
        elements.replacerKeyButton.textContent = "Press key to set";
        document.addEventListener("keydown", assignAliasKey);
        state.isListeningForNewKey = true;
    } else {
        resetReplacerKey();
    }
});

elements.availableKeysToggle.addEventListener("click", function() {
    state.isAvailableKeysVisible = !state.isAvailableKeysVisible;
    if (state.isAvailableKeysVisible) {
        elements.availableKeys.style.display = "flex";
    } else {
        elements.availableKeys.style.display = "none";
    }
    populateAvailableKeysToggle();
});

elements.newGroupForm.addEventListener("submit", function(e) {
    e.preventDefault();
    var groupName = elements.newGroupNameInput.value;

    // Validate new alias group name.
    resetAliasGroupValidation();
    if (!validateAliasGroup(groupName)) {
        return;
    }

    // Save alias group.
    API.storeAliasGroup(groupName).then(function() {
        // Alias groups table will automatically repopulate.
        resetNewGroupForm();
    });
});

elements.newGroupOpener.addEventListener("click", function() {
    elements.newGroupForm.style.display = "block";
    elements.newGroupOpener.style.display = "none";
    elements.newGroupNameInput.focus();
});

elements.newGroupCancelButton.addEventListener("click", function() {
    resetNewGroupForm();
    resetAliasGroupValidation();
});

elements.inspectV1AliasesButton.addEventListener("click", function() {
    API.getV1Aliases().then(function(aliases) {
        elements.rawV1AliasesCodeBlock.textContent = JSON.stringify(aliases, null, 2);
    });
});

// Drag & drop
document.addEventListener("dragenter", function(e) {
    var closestRow = e.target.closest(".alias-group-row");
    if (!closestRow) {
        return;
    }
    if (closestRow.classList.contains("selected")) {
        return;
    }
    if (!closestRow.classList.contains("drag-hovered")) {
        closestRow.classList.add("drag-hovered");
    }
});

document.addEventListener("dragleave", function(e) {
    var closestRow = e.target.closest(".alias-group-row.drag-hovered");

    if (!closestRow) {
        // Ignore random drag events.
        return;
    }

    if (closestRow && !closestRow.contains(e.relatedTarget)) {
        closestRow.classList.remove("drag-hovered");
    }
});

document.addEventListener("dragover", function(e) {
    e.preventDefault();
});

document.addEventListener("drop", function(e) {
    e.preventDefault();
    var row = e.target.closest(".alias-group-row");

    // Ignore random drop events.
    if (!row) {
        return;
    }

    // Ignore if the alias is being dropped onto the group that already contains it.
    if (state.draggedState.groupName === row.dataset.groupName) {
        return;
    }

    try {
        API.moveAlias(state.draggedState.alias, state.draggedState.groupName, row.dataset.groupName).then(function() {
            // populateAliases(state.draggedState.groupName);
        });
    } catch (e) {
        console.error("Error moving alias to new group", e);
    }
    row.classList.remove("drag-hovered");
    state.draggedRow = null;
});

// Available since Chrome v73
if (chrome.storage.local.onChanged) {
    // Listen for updates to storage in real time.
    chrome.storage.local.onChanged.addListener(function(changes, namespace) {
        // console.log("change!", changes, namespace);
        populateAliasGroups().then(function() {
            if (state.selectedAliasGroup) {
                selectAliasGroup(state.selectedAliasGroup);
            } else {
                clearAliases();
            }
        });
    });
}

// Storage
function assignAliasKey(e) {
    e.preventDefault();
    e.stopPropagation();

    var aliasKey = e.keyCode || e.which;

    // Validate new replacer key.
    if (aliasKey === 27 || !validateReplacerKey(aliasKey)) {
        resetReplacerKey();
        return;
    } 

    chrome.storage.local.set({aliasKey});
    resetReplacerKey();
}

// DOM
function resetReplacerKey() {
    document.removeEventListener("keydown", assignAliasKey);
    populateReplacerKey();
    state.isListeningForNewKey = false;
}

function populateReplacerKey() {
    chrome.storage.local.get("aliasKey", function(items) {
        var aliasKey = items.aliasKey;
        var buttonText = "";
        if (aliasKey) {
            buttonText = availableKeys[aliasKey];
            if (!buttonText) {
                buttonText = "Unrecognized key code: " + aliasKey;
            }
        } else {
            buttonText = "Click to set";
        }
        elements.replacerKeyButton.textContent = buttonText;
    });
}

function populateAvailableKeysToggle() {
    if (state.isAvailableKeysVisible) {
        elements.availableKeysToggle.innerHTML = "Hide available keys &#9650;";
    } else {
        elements.availableKeysToggle.innerHTML = "See available keys &#9660;";
    }
}

function populateAvailableKeys() {
    var keys = Object.values(availableKeys);

    for (var i = 0; i < keys.length; i++) {
        var kbd = document.createElement("kbd");
        kbd.textContent = keys[i];
        elements.availableKeys.appendChild(kbd);
    }
}

function populateAliasGroups() {
    return new Promise(function(resolve, reject) {
        var list = document.querySelector("#alias-groups-mount");

        chrome.storage.local.get("aliasesByGroup", function(items) {
            var aliasesByGroup = items.aliasesByGroup || {};

            var listClone = list.cloneNode(false);

            Object.keys(aliasesByGroup).forEach(function(groupName) {
                var aliases = aliasesByGroup[groupName];
                var count = Object.keys(aliases).length;

                var row = createAliasGroupRow(groupName, count);
                listClone.appendChild(row);
            });

            list.parentNode.replaceChild(listClone, list);
            resolve();
        });
    });
}

function populateAliases(groupName) {
    var list = document.querySelector("#aliases-mount");

    chrome.storage.local.get("aliasesByGroup", function(items) {
        var aliasesByGroup = items.aliasesByGroup || {};
        var aliases = aliasesByGroup[groupName] || {};

        var listClone = list.cloneNode(false);

        Object.keys(aliases).forEach(function(alias) {
            var fullText = aliases[alias];
            var row = createAliasRow(alias, fullText, groupName);
            listClone.appendChild(row);
        });

        list.parentNode.replaceChild(listClone, list);
    });

    elements.aliasesTable.classList.remove("hidden");
}

function clearAliases() {
    elements.aliasesTable.classList.add("hidden");
    removeAllChildren(document.querySelector("#aliases-mount"));
    // elements.nothingSelectedMessage.classList.remove("hidden");
    showNothingSelectedMessage();
}

function selectAliasGroup(groupName, row) {
    if (!row) {
        row = document.querySelector(`#alias-groups-table tr[data-group-name='${groupName}']`);
    }
    state.selectedAliasGroup = groupName;
    // Unselect any previously selected group.
    var currentlySelected = document.querySelectorAll("#alias-groups-table tr.selected");
    for (var i = 0; i < currentlySelected.length; i++) {
        var selectedRow = currentlySelected[i];
        if (!selectedRow) {
            continue;
        }
        selectedRow.classList.remove("selected");
    }
    // Add class selected to group user clicked on.
    row.classList.add("selected");
    // elements.nothingSelectedMessage.classList.add("hidden");
    showAliasDragAndDropMessage();
    populateAliases(groupName);
}

function unselectAliasGroup(row) {
    if (!row) {
        row = document.querySelector("#alias-groups-table tr.selected");
    }
    state.selectedAliasGroup = null;
    row.classList.remove("selected");
    clearAliases();
}

function createAliasGroupRow(groupName, count) {
    var tr = document.createElement("tr");
    tr.classList.add("alias-group-row");
    tr.dataset.groupName = groupName;

    // Group name.
    var nameTd = document.createElement("td");
    nameTd.textContent = groupName;
    tr.appendChild(nameTd);

    // Number of aliases in this group.
    var countTd = document.createElement("td");
    countTd.textContent = count;
    tr.appendChild(countTd);

    // X to delete.
    var controlsTd = document.createElement("td");
    controlsTd.appendChild(createDeleteAliasGroupControl(groupName, count, tr));
    tr.appendChild(controlsTd);

    tr.addEventListener("click", function() {
        if (state.selectedAliasGroup === groupName) {
            // When the user clicks on an alias group row, if it's already selected, unselect it.
            unselectAliasGroup(tr);
        } else {
            // When a user clicks on an alias group, populate the aliases table with this group's aliases.
            selectAliasGroup(groupName, tr);
        }
    });

    return tr;
}

function createDeleteAliasControl(alias, row) {
    var span = document.createElement("span");
    span.classList.add("delete-alias");
    span.innerHTML = "&#10005;"; // X
    span.addEventListener("click", function() {
        API.deleteAlias(alias).then(function() {
            row.parentNode.removeChild(row);
        });
    });

    return span;
}

function createDeleteAliasGroupControl(groupName, count, row) {
    var span = document.createElement("span");
    span.classList.add("delete-alias-group");
    span.innerHTML = "&#10005;"; // X
    span.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        // If there are aliases for this group, ask user to confirm the deletion.
        if (count && count > 0) {
            var ok = window.confirm(`Alias group "${groupName}" has ${count} aliases. These aliases will be lost if you delete it. Do you wish to continue?`);
            if (!ok) {
                return;
            }
        }

        // If the group being deleted is currently selected, reset state first.
        if (state.selectedAliasGroup === groupName) {
            state.selectedAliasGroup = null;
        }
        API.deleteAliasGroup(groupName).then(function() {
            row.parentNode.removeChild(row);
        });
    });
    return span;
}

function createAliasRow(alias, fullText, groupName) {
    var tr = document.createElement("tr");

    // ⤭ to drag and drop.
    var draggableTd = document.createElement("td");
    draggableTd.appendChild(createDraggableControl());
    tr.appendChild(draggableTd);

    var aliasTd = document.createElement("td");
    aliasTd.textContent = alias;
    tr.appendChild(aliasTd);

    var fullTextTd = document.createElement("td");
    fullTextTd.textContent = fullText;
    tr.appendChild(fullTextTd);

    // X to delete.
    var controlsTd = document.createElement("td");
    controlsTd.appendChild(createDeleteAliasControl(alias, tr));
    tr.appendChild(controlsTd);

    tr.addEventListener("dragstart", function(e) {
        state.draggedState = { alias, groupName };
    });

    return tr;
}

function createDraggableControl() {
    var span = document.createElement("span");
    span.classList.add("drag-handle", "flip-arrows");
    span.innerHTML = "&#10541;";

    span.addEventListener("mousedown", function() {
        var row = span.closest("tr");
        row.setAttribute("draggable", "true");

        row.addEventListener("dragend", function() {
            row.removeAttribute("draggable");
        });
    });

    span.addEventListener("mouseup", function() {
        var row = span.closest("tr");
        row.removeAttribute("draggable");
    });

    return span;
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}

function resetNewGroupForm() {
    elements.newGroupNameInput.value = "";
    elements.newGroupForm.style.display = "none";
    elements.newGroupOpener.style.display = "block";
}

function showNothingSelectedMessage() {
    elements.aliasTableMessage.textContent = "Nothing selected. Click an alias group to view aliases.";
}

function showAliasDragAndDropMessage() {
    var text1 = document.createTextNode("Hint: grab the ");
    var arrows = document.createElement("span");
    arrows.classList.add("flip-arrows");
    arrows.innerHTML = "&#10541;";
    arrows.style.marginLeft = "5px";
    arrows.style.marginRight = "5px";
    var text2 = document.createTextNode(" to move aliases from one group to another.");

    elements.aliasTableMessage.innerHTML = "";
    elements.aliasTableMessage.appendChild(text1);
    elements.aliasTableMessage.appendChild(arrows);
    elements.aliasTableMessage.appendChild(text2);
}

// Validation
function validateReplacerKey(key) {
    if (!availableKeys[key]) {
        var keyName = String.fromCharCode(key);
        elements.replacerKeyMessage.textContent = `Invalid replacer key: "${keyName}".`;
        return false;
    }
    return true;
}

function resetReplacerKeyValidation() {
    elements.replacerKeyMessage.textContent = "";
}

function validateAliasGroup(groupName) {
    if (!groupName) {
        elements.newAliasGroupMessage.textContent = "Alias group names cannot be empty.";
        return false;
    }
    if (/^\s*$/.test(groupName)) {
        elements.newAliasGroupMessage.textContent = "Alias group names cannot be blank.";
        return false;
    }
    return true;
}

function resetAliasGroupValidation() {
    elements.newAliasGroupMessage.textContent = "";
}

