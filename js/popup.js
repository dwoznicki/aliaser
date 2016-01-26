$(document).ready(function() {
	bindListeners()
	getAliases();
});

function bindListeners() {
	$('#new-alias').on('submit', function(e) {
	  e.preventDefault();
	  var alias = $('#alias-text').val()
	  var full = $('#full-text').val()	
	  setAlias(alias, full);
	});
	$('#aliases').on('click', '.remove-alias', function(e) {
		var element = $(this).parent();
		var alias = element.text().split(":")[0]
		removeAlias(alias);
	});
};

function setAlias(alias, full) {
	var save = {};
	save[alias] = full;

	chrome.storage.local.set(save, function() {
	  console.log('Shortcut saved');
	  var alias = $('#alias-text').val("");
	  var full = $('#full-text').val("");
	  getAliases();
	});
};

function removeAlias(alias) {
	chrome.storage.local.remove(alias);
	getAliases();
};

function getAliases() {
	$('#aliases').children().remove()
	chrome.storage.local.get(null, function(items) {
		$.each(items, function(alias, full) {
			$('#aliases').append("<div class='alias'>" + alias + ": " + full + " <a href='#' class='remove-alias'>&times;</a></div>");
		});
	});
};
