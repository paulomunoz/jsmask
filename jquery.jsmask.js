// Set caret position easily in jQuery
// Written by and Copyright of Luke Morton, 2011
// Licensed under MIT
(function ($) {
    // Behind the scenes method deals with browser
    // idiosyncrasies and such
    $.caretTo = function (el, index) {
        if (el.createTextRange) { 
            var range = el.createTextRange(); 
            range.move("character", index); 
            range.select(); 
        } else if (el.selectionStart != null) { 
            el.focus(); 
            el.setSelectionRange(index, index); 
        }
    };

    // The following methods are queued under fx for more
    // flexibility when combining with $.fn.delay() and
    // jQuery effects.

    // Set caret to a particular index
    $.fn.caretTo = function (index, offset) {
        return this.queue(function (next) {
            if (isNaN(index)) {
                var i = $(this).val().indexOf(index);
                
                if (offset === true) {
                    i += index.length;
                } else if (offset) {
                    i += offset;
                }
                
                $.caretTo(this, i);
            } else {
                $.caretTo(this, index);
            }
            
            next();
        });
    };
	
	$.fn.getCaretPosition = function () {
	  // Initialize
	  var iCaretPos = 0;
	
	  // IE Support
	  if (document.selection) {
		// To get cursor position, get empty selection range
		var oSel = document.selection.createRange ();
	
		// Move selection start to 0 position
		oSel.moveStart ('character', -this.value.length);
	
		// The caret position is selection length
		iCaretPos = oSel.text.length;
	  }
	
	  // Firefox support
	  else if (this.selectionStart || this.selectionStart == '0')
		iCaretPos = this.selectionStart;
	
	  // Return results
	  return (iCaretPos);
	}

    // Set caret to beginning of an element
    $.fn.caretToStart = function () {
        return this.caretTo(0);
    };

    // Set caret to the end of an element
    $.fn.caretToEnd = function () {
        return this.queue(function (next) {
            $.caretTo(this, $(this).val().length);
            next();
        });
    };
}(jQuery));


 /**
 * jquery.jsmask.js
 * @author: Paulo Muñoz
 *
 * Created by Paulo Muñoz on 2012-08-20. 
 *
 * Copyright (c) 2012 Paulo Muñoz http://wwww.paulomunoz.com/
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
(function($) {
  "use strict";

  var Mask = function(element, mask, options) {

    var defaults = {};

    var plugin = this;

    plugin.settings = {}

    var $element = $(element),
         element = element;

    plugin.init = function(){
      plugin.settings = $.extend({}, defaults, options);
        
      options = options || {};
      $element.each(function() {
		  var el = $(this);
		  
		  el.data('mask', mask);
		  
		  el.focus(function() {
		    clearInterval(el.data('interval'));
			el.data('interval', setInterval(function(){ObserveInputValue(el);}, 50));
		  });
			
		  el.blur(function() {
			clearInterval(el.data('interval'));
		  });
		  
      });

    }
	
	plugin.setMask = function(mask) {
		$element.data('mask', mask);
	}
	
	plugin.getText = function() {
		var txt = $element.val();
		return txt.replace(/[^0-9A-z]|\s/gi, '');
	}
	
	plugin.getFullText = function() {
		return $element.val();
	}
	
    // public methods
    plugin.unmask = function() {
      //destroyEvents();
      //$element.val(onlyNumbers($element.val()));
    };
	
    // private methods
	var ObserveInputValue = function(obj) {
		var txt = obj.val();
		
		// If the value has changed
		if (obj.data('lastValue') != txt) {
			if (options.beforeChangeHandler != undefined && typeof options.beforeChangeHandler === 'function') {
				options.beforeChangeHandler(obj);
			}
			
			var mask = obj.data('mask');
			
			/*
			* Removing all characters that doesn't match with his corresponding
			* mask char.
			*/
			var pattern = mask;
			// The string inside text input filtered with just the letters and numbers
			var stripped = txt.replace(/[^0-9A-z]/gi, '');
			// The string of the MASK, with just the reserved chacacters (0, 9, A and S).
			var strippedMask = mask.replace(/[^09AS]/gi, '');
			var typed = '';
			
			var i;
			var len = strippedMask.length;
			
			// For each MASK character
			for (i = 0; i < len; i++) {
				
				// The current MASK character
				var maskChar = strippedMask.charAt(i);
				
				inner: while (stripped.length > 0) {
					// Returns the fist character of the stripped string
					var txtChar = stripped.substr(0,1);
					// Returns all the characters after the first one
					stripped = stripped.substr(1);
					
					// If the character corresponds to its mask char
					if (charMatch(txtChar, maskChar)) {
						// Add to the final str
						typed += txtChar;
						// And go to the next Mask Character
						break inner;
					}
				}
				
				// If the while was finished by the stripped.length > 0 condition
				if (stripped.length == 0) {
					// We don't have more inputed characters available, so, stop.
					break;
				}
			}
			
			/*
			* Formatting the final text with the informed mask
			*/
			len = pattern.length;
			var typedCounter = 0;
			var finalText = '';
			var caretTo;
			
			for (i = 0; i < len; i++) {
				// Current character of the mask
				var pChar = pattern.charAt(i);
				
				// If the current mask character is none of 
				// the following reserved chars:
				// 0 or 9: Only Numbers
				// A: Numbers and Letters
				// S: Only A-Z and a-z characters
				if (pChar != '0' && pChar != '9' && pChar != 'A' && pChar != 'S') {
					// Place the custom mask's current position char
					finalText += pChar;
				// If the typedcounter current value is still lesser than the typed length
				} else if (typedCounter < typed.length){
					// Add the typed character
					finalText += typed.charAt(typedCounter);
					// Increments the counter
					typedCounter++;
					
					// This line is to position the caret in the last valid character
					if (typedCounter == typed.length) {
						caretTo = i+1;
					}
					
				} else {
					// If we dont have any valid characters, we use the place holder
					finalText += ' ';
				}
			}
			
			obj.data('lastValue', finalText);
			
			obj.val(finalText);
			if (caretTo == undefined) {
				if (typed.length == 0) caretTo = 0;
				else caretTo = len;
			}
			obj.caretTo(caretTo);	
		}
	}
	
	var charMatch = function (char, maskChar) {
		switch (maskChar) {
			case '0':
			case '9':
				return char.match(/[0-9]/i) ? true : false;
			case 'A':
				return char.match(/[0-9a-z]/i) ? true : false;
			case 'S':
				return char.match(/[a-z]/i) ? true : false;
			default:
				return false;
		}
	}

    plugin.init();

  };

  $.fn.jsMask = function(mask, options) {
    return this.each(function() {
      $(this).data('jsMask', new Mask(this, mask, options));
    });
  }

})(jQuery);
