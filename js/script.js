$('body').on('keydown', 'input, textarea', function(e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if(code == 9) {
    var input = $(this).val().split(" ");
    for(var i = 0; i < input.length; i++) {
      if(replaceInput(input[i])) {
        e.preventDefault();
        input[i] = replaceInput(input[i])
      };
    };
    $(this).val(input.join(" "))
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