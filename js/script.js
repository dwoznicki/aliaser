$('body').on('keydown', 'input', function(e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 9) {
    var input = $(this).val();
    if(replaceInput(input)) {
      e.preventDefault();
      $(this).val(replaceInput(input))
    };
  };
});

chrome.storage.local.get(null, function(items) {
  aliases = items
});

function replaceInput(input) {
  if(input in aliases) {
    return aliases[input]
  } else {
    return false
  };
};