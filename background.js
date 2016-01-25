$('input').on('keydown', function(e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 9) {
    e.preventDefault();
    var input = $(this).val();
    $(this).val(replaceInput(input))
  };
});

chrome.storage.local.get(null, function(items) {
  shortcuts = items
});

function replaceInput(input) {
  if(input in shortcuts) {
    return shortcuts[input]
  } else {
    return input
  };
};