$(document).ready(function() {
	bindListeners();
	getAliases();
	getAliasKey();
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
		$('.new-key-listener-text').css('font-size', '2em').text("Press a key")
		$(document).on('keydown', function(e) {
			e.preventDefault()
			var code = (e.keyCode ? e.keyCode : e.which);
		  setAliasKey(code);
		});
	});
};

function setAlias() {
	chrome.storage.local.get('aliases', function(items) {
		var aliases = items.aliases
		var alias = $('#alias-text').val()
	  var full = $('#full-text').val()
	  aliases[alias] = full
		chrome.storage.local.set({aliases: aliases}, function() {
		  console.log("Shortcut saved");
		  $('#alias-text, #full-text').val("");
		  $('#alias-text').focus()
		  getAliases();
		});
	});
};

function removeAlias(alias) {
	chrome.storage.local.get('aliases', function(items) {
		var aliases = items.aliases
		delete aliases[alias]
		chrome.storage.local.set({aliases: aliases}, function() {
			console.log("Alias removed")
			getAliases();
		});
	});
};

function getAliases() {
	$('#aliases').children().remove()
	chrome.storage.local.get('aliases', function(items) {
		if(items.aliases) {
			appendItems(items);
		} else {
			chrome.storage.local.set({ 'aliases': {} }, function() {
				console.log('Created aliases object')
			});
		};
	});
};

function appendItems(items) {
	$.each(items.aliases, function(alias, full) {
		$('#aliases').append("<li><span class='alias'>" + alias + "</span> <i class='fa fa-arrow-right'></i> <span class='full'>" + full + "</span> <a href='#' class='remove-alias'><i class='fa fa-times-circle'></i></a></li>");
	});
};

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
};

function getAliasKey() {
	chrome.storage.local.get("aliasKey", function(items) {
		var codeString = possibleKeys[items.aliasKey]
		codeString ? $('.alias-key').text(codeString) : $('.alias-key').text("Click to set!");
	});
};

function setAliasKey(code) {
	if(possibleKeys[code]) {
		chrome.storage.local.set({"aliasKey": code});
		getAliasKey();
		$(document).off('keydown');
		$('.new-key-listener').addClass('hidden');
	} else if(code === 27) {
		$(document).off('keydown');
		$('.new-key-listener').addClass('hidden');
	} else {
		var invalidCodeString = '"' + String.fromCharCode(code) + '" is not a valid key.\nPlease choose another.'
		$('.new-key-listener-text').css('font-size', '1em').text(invalidCodeString);
	};
};