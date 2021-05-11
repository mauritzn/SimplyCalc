import ace from "ace-builds/src-noconflict/ace";

// https://medium.com/@jackub/writing-custom-ace-editor-mode-5a7aa83dbe50

// https://stackoverflow.com/questions/55156601/how-to-write-custom-mode-in-ace-editor
// https://github.com/YellowAfterlife/GMEdit/blob/master/bin/resources/app/plugins/ini-editor/ini-editor.js

ace.define(
  "ace/mode/custom",
  [
    "require",
    "exports",
    "ace/lib/oop",
    "ace/mode/text",
    "ace/mode/custom_highlight_rules",
  ],
  (acequire: any, exports: any) => {
    const oop = acequire("ace/lib/oop");
    const TextMode = acequire("ace/mode/text").Mode;
    const CustomHighlightRules = acequire("ace/mode/custom_highlight_rules")
      .CustomHighlightRules;

    var Mode = function () {
      this.HighlightRules = CustomHighlightRules;
      //this.foldingRules = new IniFoldMode();
      this.$behaviour = this.$defaultBehaviour;
    };

    oop.inherits(Mode, TextMode); // ACE's way of doing inheritance
    exports.Mode = Mode; // eslint-disable-line no-param-reassign
  }
);

// This is where we really create the highlighting rules
ace.define(
  "ace/mode/custom_highlight_rules",
  ["require", "exports", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (acequire: any, exports: any) => {
    const oop = acequire("ace/lib/oop");
    const TextHighlightRules = acequire("ace/mode/text_highlight_rules")
      .TextHighlightRules;

    const keywords = ["and", "not", "or", "xor", "in", "to", "pi"];

    const CustomHighlightRules = function CustomHighlightRules() {
      this.$rules = {
        start: [
          {
            token: "comment",
            regex: /#.*?$/,
          },
          {
            // custom functions
            token: "entity.name.function",
            regex: /[a-z0-9]+[ ]*\(/,
            caseInsensitive: true,
          },
          {
            // custom variables
            token: "variable",
            regex: /[a-z0-9]+[ ]*=/,
            caseInsensitive: true,
          },

          {
            // "caseInsensitive" doesn't seem to work
            token: "keyword",
            regex: "(^|[^A-Za-z])(" + keywords.join("|") + ")([^A-Za-z]|$)",
            caseInsensitive: false,
          },

          {
            token: "keyword.operator",
            regex: /[{}()\[\]]/,
          },
          {
            token: "keyword.operator",
            regex: /[ ]+(plus|minus|divide|multiply|modulo)[ ]+/,
            caseInsensitive: true,
          },
          {
            // TODO: improve? (incorrectly marks invalid operators like: !====, >>>>>)
            token: "keyword.operator",
            regex: /[=><!?:+\-*/&~|^%]/,
          },

          {
            // TODO: improve? (incorrectly colors test32 separately)
            token: "constant.numeric",
            regex: /\d*\.\d+([eE][\-+]?\d+)?/,
          },
          {
            token: "constant.numeric",
            regex: /\d+/,
          },
          {
            token: "delimiter",
            regex: /[;,. ]/,
          },

          {
            defaultToken: "text",
          },
        ],
      };
    };

    oop.inherits(CustomHighlightRules, TextHighlightRules);
    exports.CustomHighlightRules = CustomHighlightRules;
  }
);
