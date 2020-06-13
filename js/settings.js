populateReplacerKey();

var button = document.querySelector("#replacer-key-button");
var isListeningForNewKey = false;

function assignAliasKey(e) {
    e.preventDefault();
    e.stopPropagation();
    var aliasKey = e.keyCode || e.which;
    if (availableKeys[aliasKey]) {
        chrome.storage.local.set({aliasKey});
    } else if (aliasKey === 27) { // ESC
        // Safely ignore ESCAPE key presses and allow to reset.
    } else {
        var keyName = String.fromCharCode(aliasKey);
        // TODO show error
    }
    reset();
}

function reset() {
    document.removeEventListener("keydown", assignAliasKey);
    populateReplacerKey();
    isListeningForNewKey = false;
}


button.addEventListener("click", function() {
    if (!isListeningForNewKey) {
        button.textContent = "Press key to set";
        document.addEventListener("keydown", assignAliasKey);
        isListeningForNewKey = true;
    } else {
        reset();
    }
});

// Helpers
function populateReplacerKey() {
    var button = document.querySelector("#replacer-key-button");
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
        button.textContent = buttonText;
    });
}
