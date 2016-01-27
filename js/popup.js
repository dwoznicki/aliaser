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
		var element = $(this).parent();
		var alias = element.text().split(":")[0]
		removeAlias(alias);
	});
	$('.alias-key').on('click', function(e) {
		$('.alias-key').text('_');
		var background = $('.alias-key').css('background-color')
		blink($('.alias-key'), background);
		$(document).on('keydown', function(e) {
			e.preventDefault()
		  var code = (e.keyCode ? e.keyCode : e.which);
			chrome.storage.local.set({"aliasKey": code});
			getAliasKey();
		})
	});
};

function setAlias() {
	chrome.storage.local.get('aliases', function(items) {
		var aliases = items.aliases
		var alias = $('#alias-text').val()
	  var full = $('#full-text').val()
	  aliases[alias] = full
		chrome.storage.local.set({aliases: aliases}, function() {
		  console.log('Shortcut saved');
		  $('#alias-text, #full-text').val("");
		  getAliases();
		});
	});
};

function removeAlias(alias) {
	chrome.storage.local.remove(alias);
	getAliases();
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

function blink(text, background) {
	setInterval(function() {    
		if(text.css('color') == background) {
			text.css('color', 'white')
		} else {
			text.css('color', background)
		}
	}, 500);
};

function getAliasKey() {
	chrome.storage.local.get("aliasKey", function(items) {
		$('.alias-key').text(String.fromCharCode(items.aliasKey));
	});
};