/* Author: b0n3Z

*/

function Newpost(element) { // listens textarea and adds some methods to it
    this.textarea = element;
    this.insert = function(text) {
        var textarea = this.textarea;
    	if (textarea) {
    		if (textarea.createTextRange && textarea.caretPos) { // IE
    			var caretPos = textarea.caretPos;
    			caretPos.text = caretPos.text.charAt(caretPos.text.length-1) == " " ? text + " " : text;
    		} else if (textarea.setSelectionRange) { // Firefox
    			var start = textarea.selectionStart,
    			    end = textarea.selectionEnd;
    			textarea.value = textarea.value.substr(0, start) + text + textarea.value.substr(end);
    			textarea.setSelectionRange(start + text.length, start + text.length);
    		} else {
    			textarea.value += text+" ";
    		}
    		textarea.focus();
    	}
    }

    this.wrap = function(code) {
        var textarea = this.textarea,
            tagStart = "["+code+"]",
            tagEnd = "[/"+code+"]", 
            size = (tagStart+tagEnd).length;

        if (typeof textarea.selectionStart != "undefined") {
            var begin = textarea.value.substr(0, textarea.selectionStart),
                selection = textarea.value.substr(textarea.selectionStart, textarea.selectionEnd - textarea.selectionStart),
                end = textarea.value.substr(textarea.selectionEnd);
            textarea.selectionEnd = textarea.selectionEnd+size;
            textarea.value = begin+tagStart+selection+tagEnd+end;
        }
        textarea.focus();
    }
}

function getSelText() {
    document.aform.selectedtext.value =  window.getSelection();
}

/**
 * Simple color container class.
 * 
 * Copyright (c) 2011, Paul Bagwell <about.me/b0n3Z>.
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
function ColorContainer(red, green, blue, alpha) {
    if (!red) red = 0;
    if (!green) green = 0;
    if (!blue) blue = 0;
    if (!alpha) alpha = 1;
    this.data = [red, green, blue, alpha];
}

ColorContainer.prototype = {
    data : [0, 0, 0, 1],
    get red() {return this.data[0]},
    get green() {return this.data[1]},
    get blue() {return this.data[2]},
    get alpha() {return this.data[3]},
    set red(value) {this.data[0] = value},
    set green(value) {this.data[1] = value},
    set blue(value) {this.data[2] = value},
    set alpha(value) {this.data[3] = value},
    get rgb() {return this.torgb(this.data)},
    get rgba() {return this.torgba(this.data)},
    get hex() {return this.tohex(this.data.slice(0,3))},
    get hsl() {return this.tohsl(this.data.slice(0,3))},
    
    torgba : function(arr) {
        arr = this.unpack(arguments);
        return 'rgba(' + arr.join(',') + ')';
    },
    
    torgb : function(arr) {
        arr = this.unpack(arguments);
        return 'rgb(' + arr.slice(0,3).join(',') + ')';
    },
    
    tohex : function(arr) {
        arr = this.unpack(arguments);
        function hex(number) {
            if (number instanceof Array) {
                var tmp = '';
                for (var i=0; i < number.length; i++) {
                    tmp += hex(number[i])
                }
                return tmp;
            }
            var char = '0123456789abcdef';
            if (number == null) {
                return '00';
            }
            number = parseInt(number);
            if (number == 0 || isNaN(number)) {
                return '00'
            }
            number = Math.round(Math.min(Math.max(0, number), 255));
            return char.charAt((number - number % 16) / 16) + char.charAt(number % 16);
        }
        return '#'+hex(arr);
    },
    
    tohsl : function(arr) {
        var r = arr[0], g = arr[1], b = arr[2];
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
    },
    
    unpack : function(arr) {
        return (arr[0] instanceof Array) ? arr[0] : arr;
    },
}

function previewPost(selector) {
    $(selector).hover(function(e) {
        var d = $('<div/>');
        e.preventDefault();
    });
}

// For klipton style
function labelsToPlaceholders(list) {
    for (var i=0; i < list.length; i++) {
        var x = list[i],
            t = $('label[for="'+x+'"]').text(),
            dd = $('#'+x);
        dd.attr('placeholder', t);
    }
    if ($('.bbcode').css('display') === 'none') {
        $('.captcha-d').css({marginTop : 1})
    }
}

function manipulator(arr) { // manipulates elements. Used for custom user styles.
    var cases = {
        after : function(from, to) {
            $(from).remove().insertAfter(to)
        },
        before : function(from, to) {
            $(from).remove().insertBefore(to)
        },
    };
    
    for (var i in arr) {
        for (var e=0; e < arr[i].length; e++) {
            cases[i](arr[i][e][0], arr[i][e][1])
        }
    }
}

// make page changes, that can't be afforded through CSS
function styleDOM(style) {
    if (style === 'klipton') {
        var styleInfo = {
            after : [
                ['.new-post input[type="submit"]', '#captcha'],
                ['.password-d', '.topic-d'],
                ['.file-d', '.password-d'],
            ],
        };
        
        labelsToPlaceholders(['username', 'email', 'topic', 'message', 'captcha']);
        manipulator(styleInfo);
    }
}

function parseQs(key) { // query string parser
    var d = location.href.split('?').pop().split('&'),
        parsed = {}, tmp;
        
    for (var i=0; i < d.length; i++) {
        var tmp = d[i].split('='); 
        parsed[tmp[0]] = tmp[1];
    }
    
    if (!key) {
        return parsed;
    }
    if (key in parsed) {
        return parsed[key];
    }
    return false;
}

function regChangeEvent(id, func) {
    $('#'+id).change(function(e) {
        //console.log(this.value, func)
        func(this.value)
    });
}

function resetSettings() {
    // TODO
}

function init() {
    var textArea = new Newpost($('.message')[0]),
        set = $.settings('hideSectGroup');
    
    $('.bbcode a').click(function(e) {
        e.preventDefault();
        textArea.wrap(this.className);
    });
    
    $('.thread').delegate('.edit', 'click', function(event) {
        event.preventDefault();
        var c = new Canvas;
    });
    
    // sidebar-related
    if (!set) {
        return false;
    }
    set = set.split(',');
    for (var i = 0; i < set.length; i++) {
        $('#list-group' + set[i]).slideToggle(0);
    }
}

function initSettings() {
    // those things depend on cookie settings
    var s = parseQs(), 
        settings = $('.settings dd').find('select, input'),
        changes;
        
    for (var x in s) {
        $.settings(x, s[x]);
    }
    
    settings.each(function(x) {
        var s = $.settings(this.id), t;
        if (!!(t = parseQs(this.id))) {
            $.settings(this.id, t);
            s = t;
        }
        if (s !== null) {
            if (s === 'false') {
                s = false;
            }
            
            if (this.checked == null) {
                this.value = s;
            } else {
                this.checked = s
            }
        }
    })
    
    
    settings.change(function(event) {
        var value = this.value;
        if (this.checked === null) {
            value = (this.checked === 'false') ? '' : this.checked;
        }
        console.log('Setting "' + this.id + '" changed to ', value);
        $.settings(this.id, value);
    });
    
    $('#sidebar h4').click(function(e) {
        var num = this.id.split('group').pop(),
            key = 'hideSectGroup',
            set = $.settings(key),
            ul = $('#list-group' + num),
            hidden = (ul.css('display') == 'none');
        set = set ? set.split(',') : [];
        
        if (hidden && set.indexOf(num) !== -1) {
            set.splice(set.indexOf(num), 1);
        } else {
            set.push(num);
        }
        
        $.settings(key, set);
        ul.slideToggle(500);
    });
    
    $('.thread').delegate('.post .number', 'click', function(e) {
        e.preventDefault();
        textArea.insert('>>' + e.srcElement.innerHTML)
        
        if (!$.settings('oldInsert')) {
            var n = $('#post'+$(this).text()),
                f = $('.new-post').remove();
            f.insertAfter(n);
        }
    });
    
    // description of all functions on settings pages
    changes = [
        ['hideSidebar', function(x) {
            var margin = (x) ? '10px' : '200px';
            
            $('#sidebar').toggle(0, null, function(x) {
                $('#container-wrap > div').css({'marginLeft' : margin});
            });
        }],
        
        ['hideNav', function(x) {
            $('nav').toggle();
        }],
        
        ['hideGroups', function(x) {
            //x.split(',') // 1:y
            //hideSectGroup()
        }],
        
        ['hideSectBanner', function(x) {
            $('.section-banner').toggle();
        }],
    ];
    
    for (var i=0; i < changes.length; i++) {
        var t = changes[i], 
            id = t[0],
            func = t[1];
        
        regChangeEvent(id, func);
            
        if (!!(t = $.settings(id))) {
            console.log($('#'+id))
            func(t);
        }
    }
}

function initStyle() {
    var key = 'ustyle',
        cookie = $.settings(key),
        styles = $('.'+key),
        re = /(?:.*\/)(.+)(?:\.css.*)/, // get stylesheet name
        found = false;
    
    if (!cookie) {
        return false;
    }
    
    function disableStylesExcept(styles, style) {
        var s;
        for (var i=0; i < styles.length; i++) {
            s = styles[i];
            if (s.href.indexOf(style) === -1) {
                s.disabled = true;
            }
        }
    }
    
    // check if selected style is valid one
    for (var i=0; i < styles.length; i++) {
        if (styles[i].href.indexOf(cookie) !== -1) {
            found = true;
            break;
        }
    }
    
    if (found) {
        for (var i=0; i < styles.length; i++) {
            style = styles[i]
            if (style.href.indexOf(cookie) !== -1 && style.disabled) {
                style.disabled = false;
                disableStylesExcept(styles, cookie);
                styleDOM(cookie);
            }
        };
    }
    
    return true;
}

$(init);
$(initSettings);
$(initStyle);