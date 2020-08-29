var _aliaserState = {
    currentAliasGroup: null,
    aliases: [],
    aliasKey: null,
};

_loadAliases();

document.body.addEventListener("keydown", function(e) {
    if (e.target.nodeName !== "INPUT" && e.target.nodeName !== "TEXTAREA") {
        return;
    }

    var keyCode = e.keyCode || e.which;
    if (keyCode === _aliaserState.aliasKey) {

        // Track whether the element text contained at least one alias.
        var hasAlias = false;

        // Iterate over node text tokens replacing any recognized aliases with full text.
        var valueTokens = e.target.value.split(" ");
        for (var i = 0; i < valueTokens.length; i++) {
            var token = valueTokens[i];
            if (_aliaserState.aliases[token]) {
                valueTokens[i] = _aliaserState.aliases[token];
                hasAlias = true;
            }
        }

        if (hasAlias) {
            e.preventDefault();
            // Replace current input value.
            e.target.value = valueTokens.join(" ");
        }
    }
});

// Available since Chrome v73
if (chrome.storage.local.onChanged) {
    // Listen for updates to storage in real time.
    // When anything is changed, reload our state so the user always has up to date aliases.
    chrome.storage.local.onChanged.addListener(function(changes, namespace) {
        _loadAliases();
    });
}


function _loadAliases() {
    chrome.storage.local.get(null, function(items) {
        _aliaserState.currentAliasGroup = items.currentAliasGroup;
        // These are key value pairs of aliases to full text.
        _aliaserState.aliases = items.aliasesByGroup[items.currentAliasGroup] || [];
        // The key which, when pressed, will cause aliases to be replaced with full text.
        _aliaserState.aliasKey = items.aliasKey;
    });
}

console.log("Aliaser loaded");

