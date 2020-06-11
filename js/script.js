chrome.storage.local.get(null, function(items) {
    // These are key value pairs of aliases to full text.
    var aliases = items.aliases;
    // The key which, when pressed, will cause aliases to be replaced with full text.
    var aliasKey = items.aliasKey;

    document.body.addEventListener("keydown", function(e) {
        if (e.target.nodeName !== "INPUT" && e.target.nodeName !== "TEXTAREA") {
            return;
        }

        var keyCode = e.keyCode || e.which;
        if (keyCode === aliasKey) {

            // Track whether the element text contained at least one alias.
            var hasAlias = false;

            // Iterate over node text tokens replacing any recognized aliases with full text.
            var valueTokens = e.target.value.split(" ");
            for (var i = 0; i < valueTokens.length; i++) {
                var token = valueTokens[i];
                if (aliases[token]) {
                    valueTokens[i] = aliases[token];
                    hasAlias = true;
                }
            }

            if (hasAlias) {
                e.preventDefault();
                // Replace current input value.
                e.target.value = valueTokens.join(" ");
            }
        }

    });

    console.log("Aliaser loaded");
});

// chrome.storage.local.get(null, function(items) {
//   var aliases = items.aliases;
//   var aliasKey = items.aliasKey;
//   $('body').on('keydown', 'input, textarea', function(e) {
//     var code = (e.keyCode ? e.keyCode : e.which);
//     if(code == aliasKey) {
//       var input = this.value.split(" ");
//       for(var i = 0; i < input.length; i++) {
//         if(replaceInput(input[i])) {
//           e.preventDefault();
//           input[i] = replaceInput(input[i]);
//         }
//       }
//       this.value = input.join(" ");
//       // Add this check to prevent event from triggering for react dropdowns
//       if (this.value) {
//         var event = new Event('input', {bubbles: true});
//         this.dispatchEvent(event);
//       }
//     }
//   });
//   function replaceInput(input) {
//     if(input in aliases) {
//       return aliases[input];
//     } else {
//       return false;
//     }
//   }
// });

