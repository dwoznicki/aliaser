chrome.storage.local.get(null, function(items) {
  var aliases = items.aliases
  var aliasKey = items.aliasKey
  $('body').on('keydown', 'input, textarea', function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == aliasKey) {
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


  function replaceInput(input) {
    if(input in aliases) {
      return aliases[input]
    } else {
      return false
    };
  };
});
