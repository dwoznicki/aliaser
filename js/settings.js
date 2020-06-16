var elements = {
    replacerKeyButton: document.querySelector("#replacer-key-button"),
    replacerKeyMessage: document.querySelector("#replacer-key-field-message"),
    availableKeysToggle: document.querySelector("#toggle-available-keys"),
    availableKeys: document.querySelector("#available-keys"),
};

var state = {
    isListeningForNewKey: false,
    isAvailableKeysVisible: false,
};

populateReplacerKey();
populateAvailableKeysToggle();
populateAvailableKeys();
populateAliasGroups();

// Listeners
elements.replacerKeyButton.addEventListener("click", function() {
    if (!state.isListeningForNewKey) {
        resetValidation();
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

// Available since Chrome v73
if (chrome.storage.local.onChanged) {
    // Listen for updates to storage in real time.
    chrome.storage.local.onChanged.addListener(function(changes, namespace) {
        console.log("change!", changes, namespace);
        populateAliasGroups();
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

function deleteAliasGroup(groupName) {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get("aliasesByGroup", function(items) {
            var aliasesByGroup = items.aliasesByGroup || {};
            delete aliasesByGroup[groupName];

            chrome.storage.local.set({aliasesByGroup}, function() {
                resolve();
            });
        });
    });
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
    });
}

function createAliasGroupRow(groupName, count) {
    var tr = document.createElement("tr");

    var nameTd = document.createElement("td");
    nameTd.textContent = groupName;
    tr.appendChild(nameTd);

    var countTd = document.createElement("td");
    countTd.textContent = count;
    tr.appendChild(countTd);

    var controlsTd = document.createElement("td");
    controlsTd.appendChild(createDeleteControl(groupName, count, tr));
    tr.appendChild(controlsTd);

    return tr;
}

function createDeleteControl(groupName, count, row) {
    var span = document.createElement("span");
    span.classList.add("delete-alias-group");
    span.innerHTML = "&#10005;"; // X
    span.addEventListener("click", function() {
        // If there are aliases for this group, ask user to confirm the deletion.
        if (count && count > 0) {
            var ok = window.confirm(`Alias group "${groupName}" has ${count} aliases. These aliases will be lost if you delete it. Do you wish to continue?`);
            if (!ok) {
                return;
            }
        }

        deleteAliasGroup(groupName).then(function() {
            row.parentNode.removeChild(row);
        });
    });
    return span;
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

function resetValidation() {
    elements.replacerKeyMessage.textContent = "";
}

