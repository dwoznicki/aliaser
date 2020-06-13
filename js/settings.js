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

