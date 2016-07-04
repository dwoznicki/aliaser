chrome.storage.local.get(null, function(items) {
  var aliases = items.aliases;
  var aliasKey = items.aliasKey;
  $('body').on('keydown', 'input, textarea', function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == aliasKey) {
      var input = this.value.split(" ");
      for(var i = 0; i < input.length; i++) {
        if(replaceInput(input[i])) {
          e.preventDefault();
          input[i] = replaceInput(input[i]);
        }
      }
      this.value = input.join(" ");
      // Add this check to prevent event from triggering for react dropdowns
      if (this.value) {
        var event = new Event('input', {bubbles: true});
        this.dispatchEvent(event);
      }
    }
  });


  function replaceInput(input) {
    if(input in aliases) {
      return aliases[input];
    } else {
      return false;
    }
  }
});

