$(document).ready(function() {
	bindListeners()
	getShortcuts();
});

function bindListeners() {
	$('#new-shortcut').on('submit', function(e) {
	  e.preventDefault();
	  var shortcut = $('#shortcut-text').val()
	  var replacement = $('#replacement-text').val()	
	  setShortcut(shortcut, replacement);
	});
	$('#shortcuts').on('click', '.remove-shortcut', function(e) {
		var element = $(this).parent();
		removeShortcut(element);
	});
};

function setShortcut(shortcut, replacement) {
	var save = {};
	save[shortcut] = replacement;

	chrome.storage.local.set(save, function() {
	  console.log('Shortcut saved');
	  var shortcut = $('#shortcut-text').val("");
	  var replacement = $('#replacement-text').val("");
	});
};

function removeShortcut(element) {
	chrome.storage.local.remove()
}

function getShortcuts() {
	chrome.storage.local.get(null, function(items) {
		$.each(items, function(shortcut, replacement) {
			$('#shortcuts').append("<div class='shortcut'>" + shortcut + ": " + replacement + " <a href='#' class='remove-shortcut'>&times;</a></div>");
		});
	});
};
