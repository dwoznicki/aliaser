var MY_ALIASES = "my aliases";

// DOM elements reference
var elements = {
    replacerKey: document.querySelector("#replacer-key"),
    aliasInput: document.querySelector("input[name='alias']"),
    fullTextInput: document.querySelector("input[name='full-text']"),
    aliasMessage: document.querySelector("#alias-field-message"),
    fullTextMessage: document.querySelector("#full-text-field-message"),
    settings: document.querySelector("#open-settings"),
    groupSelect: document.querySelector("#alias-group-select"),
    newGroupOpener: document.querySelector("#open-new-alias-group"),
    newGroupForm: document.querySelector("#new-alias-group-form"),
    newGroupNameInput: document.querySelector("input[name='group-name']"),
    newAliasGroupMessage: document.querySelector("#group-name-field-message"),
    newGroupCancelButton: document.querySelector("#cancel-new-alias-group"),
};

API.initializeAliasGroupsV1ToV2().then(function() {
    populateAliasGroups();
    populateAliases();
});
populateReplaceKey();

// Listeners
document.querySelector("#new-alias-form").addEventListener("submit", function(e) {
    e.preventDefault();
    var alias = elements.aliasInput.value;
    var fullText = elements.fullTextInput.value;

    // Validate input.
    resetAliasValidation();
    var isAliasValid = validateAlias(alias);
    var isFullTextValid = validateFullText(fullText);
    if (!isAliasValid || !isFullTextValid) {
        return;
    }

    // Save alias.
    API.storeAlias(alias, fullText).then(function() {
        elements.aliasInput.value = "";
        elements.fullTextInput.value = "";
        elements.aliasInput.focus();
        populateAliases();
    });
});


elements.settings.addEventListener("click", openOptionsPage);

elements.replacerKey.addEventListener("click", openOptionsPage);

elements.newGroupOpener.addEventListener("click", function() {
    elements.newGroupForm.style.display = "block";
    elements.newGroupOpener.style.display = "none";
    elements.newGroupNameInput.focus();
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
        API.changeCurrentAliasGroup(groupName).then(function() {
            populateAliasGroups();
            populateAliases();
        });
        resetNewGroupForm();
    });
});

elements.newGroupCancelButton.addEventListener("click", function() {
    resetNewGroupForm();
    resetAliasGroupValidation();
});

elements.groupSelect.addEventListener("change", function(e) {
    var newGroupName = e.target.value;
    API.changeCurrentAliasGroup(newGroupName).then(function() {
        populateAliases();
    });
});

// DOM
function populateAliases() {
    var list = document.querySelector("#aliases-mount");

    chrome.storage.local.get(["currentAliasGroup", "aliasesByGroup"], function(items) {
        var currentAliasGroup = items.currentAliasGroup || MY_ALIASES;
        var aliasesByGroup = items.aliasesByGroup || {};
        var aliases = aliasesByGroup[currentAliasGroup] || {};

        var listClone = list.cloneNode(false);

        Object.keys(aliases).forEach(function(alias) {
            var fullText = aliases[alias];
            var row = createAliasRow(alias, fullText);
            listClone.appendChild(row);
        });

        list.parentNode.replaceChild(listClone, list);
    });
}

function populateReplaceKey() {
    chrome.storage.local.get("aliasKey", function(items) {
        var aliasKey = items.aliasKey;
        var text = "";
        if (aliasKey) {
            text = availableKeys[aliasKey];
            if (!text) {
                text = "unkown";
            }
        } else {
            text = "none";
        }
        elements.replacerKey.textContent = text;
    });
}

function populateAliasGroups() {
    chrome.storage.local.get(["currentAliasGroup", "aliasesByGroup"], function(items) {
        var currentAliasGroup = items.currentAliasGroup || MY_ALIASES;
        var aliasesByGroup = items.aliasesByGroup || {};
        var aliasGroups = Object.keys(aliasesByGroup) || [];

        var aliasGroupOptions = aliasGroups.map(function(group) {
            return createAliasGroupOption(group);
        });

        removeAllChildren(elements.groupSelect);
        for (var option of aliasGroupOptions) {
            elements.groupSelect.appendChild(option);
        }

        elements.groupSelect.value = currentAliasGroup;
    });
}

function createAliasRow(alias, fullText) {
    var tr = document.createElement("tr");

    var aliasTd = document.createElement("td");
    aliasTd.textContent = alias;
    tr.appendChild(aliasTd);

    var fullTextTd = document.createElement("td");
    fullTextTd.textContent = fullText;
    tr.appendChild(fullTextTd);

    var controlsTd = document.createElement("td");
    controlsTd.appendChild(createDeleteControl(alias, tr));
    tr.appendChild(controlsTd);

    return tr;
}

function createDeleteControl(alias, row) {
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

function resetNewGroupForm() {
    elements.newGroupNameInput.value = "";
    elements.newGroupForm.style.display = "none";
    elements.newGroupOpener.style.display = "block";
}

function createAliasGroupOption(groupName) {
    var option = document.createElement("option");
    option.value = groupName;
    option.textContent = groupName;
    return option;
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}

// Validation
function validateAlias(alias) {
    if (!alias) {
        elements.aliasMessage.textContent = "Alias cannot be blank.";
        return false;
    } else if (/\s+/.test(alias)) {
        elements.aliasMessage.textContent = "Alias cannot contain whitespace.";
        return false;
    }
    return true;
}

function validateFullText(fullText) {
    if (!fullText) {
        elements.fullTextMessage.textContent = "Full text cannot be empty.";
        return false;
    }
    return true;
}

function resetAliasValidation() {
    elements.aliasMessage.textContent = "";
    elements.fullTextMessage.textContent = "";
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

// Other helpers
function openOptionsPage() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL("settings.html"));
    }
}

