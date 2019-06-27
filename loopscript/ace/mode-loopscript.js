define('ace/mode/loopscript', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextMode = require("ace/mode/text").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
var LoopScriptHighlightRules = require("ace/mode/loopscript_highlight_rules").LoopScriptHighlightRules;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new LoopScriptHighlightRules().getRules());
};
oop.inherits(Mode, TextMode);

(function() {
    this.prevIndentRegex = /^(\s*)/;
    this.addIndentRegex = /^\s*(tone|loop|track|sample)/;
    this.getNextLineIndent = function(state, line, tab) {
        prevIndent = line.match(this.prevIndentRegex)[1];
        if(this.addIndentRegex.test(line))
        {
            return prevIndent + "  ";
        }
        return prevIndent;
    }
}).call(Mode.prototype);

exports.Mode = Mode;
});

define('ace/mode/loopscript_highlight_rules', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var LoopScriptHighlightRules = function() {

    this.$rules = { //new TextHighlightRules().getRules();
        start: [
            {
                token: "comment",
                regex: "#.*$"
            },
            {
                token: "keyword",
                regex: "\\b(tone|loop|track|sample|section)\\b"
            },
            {
                token: "keyword.operator",
                regex: "->"
            },
            {
                token: "keyword.operator",
                regex: ";"
            },
            {
                token: "support.function",
                regex: "\\b(pattern|adsr|reverb|bpm|freq|duration|src|octave|note|volume|clip|srcnote|srcoctave|wave)\\b"
            },
            {
                token: "variable.string",
                regex: "([\\.a-lA-LxX]{16})+"
            }
        ]
    };
}

oop.inherits(LoopScriptHighlightRules, TextHighlightRules);

exports.LoopScriptHighlightRules = LoopScriptHighlightRules;
});