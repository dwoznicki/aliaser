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

var availableKeys = {
	9: "TAB",
	13: "ENTER",
	16: "SHIFT",
	17: "CTRL",
	18: "ALT",
	19: "PAUSE",
	32: "SPACE",
	33: "PAGE UP",
	34: "PAGE DOWN",
	35: "END",
	36: "HOME",
	37: "LEFT",
	38: "UP",
	39: "RIGHT",
	40: "DOWN",
	45: "INSERT",
	46: "DELETE",
	91: "COMMAND",
	92: "WINDOW",
	93: "SELECT",
	96: "NUM 0",
	97: "NUM 1",
	98: "NUM 2",
	99: "NUM 3",
	100: "NUM 4",
	101: "NUM 5",
	102: "NUM 6",
	103: "NUM 7",
	104: "NUM 8",
	105: "NUM 9",
	112: "F1",
	113: "F2",
	114: "F3",
	115: "F4",
	116: "F5",
	117: "F6",
	118: "F7",
	119: "F8",
	120: "F9",
	121: "F10",
	122: "F11",
	123: "F12",
	186: ";",
	187: "=",
	188: ",",
	189: "-",
	190: ".",
	191: "/",
	192: "`",
	219: "[",
	220: "\\",
	221: "]",
	222: "'",
};

