var API = (function() {
    // Aliases
    function storeAlias(alias, fullText) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get(["currentAliasGroup", "aliasesByGroup"], function(items) {
                var currentAliasGroup = items.currentAliasGroup;
                if (!currentAliasGroup) {
                    // TODO reject
                }
                var aliasesByGroup = items.aliasesByGroup;
                var aliases = aliasesByGroup[currentAliasGroup]
                // temp fix?
                if (Array.isArray(aliases)) {
                    aliases = {};
                }

                aliases[alias] = fullText;
                aliasesByGroup[currentAliasGroup] = aliases;

                chrome.storage.local.set({aliasesByGroup}, function() {
                    console.debug("Alias saved", alias, fullText);
                    resolve(aliases);
                });
            });
        });
    }

    function deleteAlias(alias) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get(["currentAliasGroup", "aliasesByGroup"], function(items) {
                var currentAliasGroup = items.currentAliasGroup;
                if (!currentAliasGroup) {
                    // TODO reject
                }
                var aliasesByGroup = items.aliasesByGroup;
                var aliases = aliasesByGroup[currentAliasGroup]

                delete aliases[alias];

                chrome.storage.local.set({aliasesByGroup}, function() {
                    console.debug("Alias deleted", alias);
                    resolve(alias);
                });
            });
        });
    }

    function moveAlias(alias, oldGroupName, newGroupName) {
        return new Promise(function(resolve) {
            chrome.storage.local.get(null, function(items) {
                var aliasesByGroup = items.aliasesByGroup || {};

                var oldGroup = aliasesByGroup[oldGroupName];
                var fullText = oldGroup[alias];

                var newGroup = aliasesByGroup[newGroupName];
                var existingFullText = newGroup[alias];

                if (existingFullText) {
                // var ok = window.confirm(`Alias group "${groupName}" has ${count} aliases. These aliases will be lost if you delete it. Do you wish to continue?`);
                    var ok = window.confirm(`Alias group "${newGroupName}" already has an alias "${alias}" = "${existingFullText}". Do you want to overwrite it?`);
                    if (!ok) {
                        return resolve();
                    }
                }

                // Remove alias from the old group.
                delete oldGroup[alias];

                // Add alias to the new group.
                newGroup[alias] = fullText;

                chrome.storage.local.set({aliasesByGroup}, function() {
                    resolve();
                });
            });
        });
    }

    // Alias groups
    function storeAliasGroup(groupName) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get("aliasesByGroup", function(items) {
                var aliasesByGroup = items.aliasesByGroup || {};
                // Ignore groups that already exist.
                if (aliasesByGroup[groupName]) {
                    resolve();
                    return;
                }
                aliasesByGroup[groupName] = {};
                chrome.storage.local.set({aliasesByGroup}, function() {
                    console.debug("Alias group saved", groupName);
                    resolve(aliasesByGroup);
                });
            });
        });
    }

    function changeCurrentAliasGroup(currentAliasGroup) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.set({currentAliasGroup}, function() {
                console.debug("Current alias group changed", currentAliasGroup);
                resolve();
            });
        });
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

    function initializeAliasGroupsV1ToV2() {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get(null, function(items) {
                // Already initialized.
                if (items.aliasesByGroup && items.currentAliasGroup) {
                    // Make sure the currently selected alias group exists. If not, fall back on a different option.
                    if (!items.aliasesByGroup[items.currentAliasGroup]) {
                        var aliasGroups = Object.keys(items.aliasesByGroup);
                        changeCurrentAliasGroup(aliasGroups[0]).then(function() {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                    return;
                }

                // Try to initialize base group with previous aliases, if present.
                var currentAliasGroup = MY_ALIASES;
                var aliasesByGroup = {};
                aliasesByGroup[currentAliasGroup] = items.aliases || {};
                chrome.storage.local.set({currentAliasGroup, aliasesByGroup}, function() {
                    console.debug("Aliases groups initialized", currentAliasGroup, aliasesByGroup);
                    resolve();
                });
            });
        });
    }

    return {
        storeAlias: storeAlias,
        deleteAlias: deleteAlias,
        moveAlias: moveAlias,
        storeAliasGroup: storeAliasGroup,
        changeCurrentAliasGroup: changeCurrentAliasGroup,
        deleteAliasGroup: deleteAliasGroup,
        initializeAliasGroupsV1ToV2: initializeAliasGroupsV1ToV2,
    };
})();

