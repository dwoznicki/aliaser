// DOM elements reference
var elements = {
    replacerKey: document.querySelector("#replacer-key"),
    aliasInput: document.querySelector("input[name='alias']"),
    fullTextInput: document.querySelector("input[name='full-text']"),
    aliasMessage: document.querySelector("#alias-field-message"),
    fullTextMessage: document.querySelector("#full-text-field-message"),
    settings: document.querySelector("#open-settings"),
};

populateList();
populateReplaceKey();

document.querySelector("#new-alias-form").addEventListener("submit", function(e) {
    e.preventDefault();
    var alias = elements.aliasInput.value;
    var fullText = elements.fullTextInput.value;

    // Validate input.
    resetValidation();
    var isAliasValid = validateAlias(alias);
    var isFullTextValid = validateFullText(fullText);
    if (!isAliasValid || !isFullTextValid) {
        return;
    }

    // Save alias.
    putAlias(alias, fullText).then(function() {
        elements.aliasInput.value = "";
        elements.fullTextInput.value = "";
        elements.aliasInput.focus();
        populateList();
    });

});

elements.settings.addEventListener("click", openOptionsPage);

elements.replacerKey.addEventListener("click", openOptionsPage);

// Storage
function putAlias(alias, fullText) {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get("aliases", function(items) {
            var aliases = items.aliases || {};
            aliases[alias] = fullText;
            chrome.storage.local.set({aliases}, function() {
                console.log("Alias saved", alias, fullText);
                resolve(aliases);
            });
        });
    });
}

function deleteAlias(alias) {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get("aliases", function(items) {
            var aliases = items.aliases || {};
            delete aliases[alias];
            chrome.storage.local.set({aliases}, function() {
                console.log("Alias deleted", alias);
                resolve(alias);
            });
        });
    });
}

// DOM
function populateList() {
    var list = document.querySelector("#aliases-mount");

    chrome.storage.local.get("aliases", function(items) {
        var aliases = items.aliases || {};

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
    span.innerHTML = "&#10005;";
    span.addEventListener("click", function() {
        deleteAlias(alias).then(function() {
            row.parentNode.removeChild(row);
        });
    });
    return span;
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
        elements.fullTextMessage.textContent = "Full text cannot be blank.";
        return false;
    }
    return true;
}

function resetValidation() {
    elements.aliasMessage.textContent = "";
    elements.fullTextMessage.textContent = "";
}

// Other helpers
function openOptionsPage() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL("settings.html"));
    }
}



/*
$(document).ready(function() {
	bindListeners();
	getAliasKey();
	update();
});

function bindListeners() {
	$('#new-alias').on('submit', function(e) {
	  e.preventDefault();	
	  setAlias();
	});
	$('#aliases').on('click', '.remove-alias', function(e) {
		var alias = $(this).siblings('.alias').text()
		removeAlias(alias);
	});
	$('.alias-key').on('click', function(e) {
		e.preventDefault();
		$('.new-key-listener').removeClass('hidden');
		$('.new-key-listener-help').removeClass('hidden');
		$('.new-key-listener-text').removeClass('hidden');
		$('.new-key-listener-text').css('font-size', '2em').text("Press a key")
		$(document).on('keydown', function(e) {
			e.preventDefault()
			var code = (e.keyCode ? e.keyCode : e.which);
		  setAliasKey(code);
		});
	});
	$('#upload-file').on('click', function(e) {
		chrome.fileBrowserHandler.on
	});
}

function setAlias() {
	chrome.storage.local.get('aliases', function(items) {
		var aliases = items.aliases
		var alias = $('#alias-text').val()
	  var full = $('#full-text').val()
	  aliases[alias] = full
		chrome.storage.local.set({aliases: aliases}, function() {
		  console.log("Alias saved");
		  $('#alias-text, #full-text').val("");
		  $('#alias-text').focus()
		  update();
		});
	});
}

function removeAlias(alias) {
	chrome.storage.local.get('aliases', function(items) {
		var aliases = items.aliases
		delete aliases[alias]
		chrome.storage.local.set({aliases: aliases}, function() {
			console.log("Alias removed")
			update();
		});
	});
}

function getAliases() {
	var dfd = $.Deferred();
	chrome.storage.local.get('aliases', function(items) {
		if(items.aliases) {
			dfd.resolve(items.aliases)
			appendItems(items);
		} else {
			dfd.reject("No aliases found")
			chrome.storage.local.set({ 'aliases': {} }, function() {
				console.log('Created aliases object')
			});
		};
	});
	return dfd.promise();
}

function appendItems(items) {
	$('#aliases').children().remove();
	$.each(items.aliases, function(alias, full) {
		$('#aliases').append("<li><span class='alias'>" + alias + "</span> <i class='fa fa-arrow-right'></i> <span class='full'>" + full + "</span> <a href='#' class='remove-alias'><i class='fa fa-times-circle'></i></a></li>");
	});
}

var possibleKeys = {
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
}

function getAliasKey() {
	chrome.storage.local.get("aliasKey", function(items) {
		var codeString = possibleKeys[items.aliasKey]
		codeString ? $('.alias-key').text(codeString) : $('.alias-key').text("Click to set!");
	});
}

function setAliasKey(code) {
	if(possibleKeys[code]) {
		chrome.storage.local.set({"aliasKey": code});
		getAliasKey();
		$(document).off('keydown');
		$('.new-key-listener').addClass('hidden');
		$('.new-key-listener-help').addClass('hidden');
		$('.new-key-listener-text').addClass('hidden');
	} else if(code === 27) {
		$(document).off('keydown');
		$('.new-key-listener').addClass('hidden');
		$('.new-key-listener-help').addClass('hidden');
		$('.new-key-listener-text').addClass('hidden');
	} else {
		var invalidCodeString = '"' + String.fromCharCode(code) + '" is not a valid key.\nPlease choose another.';
		$('.new-key-listener-text').css('font-size', '1em').text(invalidCodeString);
	}
}

function update() {
	var saveButton = $('#save-file');
	getCsv().done(function(csv) {
		saveButton.attr('download', 'alias.csv');
		saveButton.attr('href', 'data:application/octet-sream,' + csv);
	});
}

function getCsv() {
	var dfd = $.Deferred();
	var output = "";
	getAliases().done(function(aliases) {
		$.each(aliases, function(alias, full) {
			output += alias + "%2C" + full + "%0A";
		});
		dfd.resolve(output);
	});
	return dfd.promise();
}
*/
