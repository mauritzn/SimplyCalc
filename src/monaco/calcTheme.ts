import { editor as monacoEditor } from "monaco-editor";

export default {
  base: "vs-dark",
  inherit: true,
  rules: [
    { background: "202646" },
    { foreground: "ffd631" },
    { token: "operator", foreground: "00ff75", fontStyle: "bold" },
    { token: "keyword", foreground: "00ff75" },
    { token: "type", foreground: "44dcc1" },
    { token: "delimiter", foreground: "00ff76" },
    { token: "number", foreground: "ffd631" },
  ],
  colors: {
    "editor.foreground": "#ffd631",
    "editor.background": "#202646",
    "editorCursor.foreground": "#ffd631",
    "editor.lineHighlightBackground": "#202646",
    "editor.selectionHighlightBackground": "#202646",

    "textSeparator.foreground": "#ffd631",
    "textLink.foreground": "#ffd631",
    "textLink.activeForeground": "#ffd631",
    "textPreformat.foreground": "#ffd631",
    "textBlockQuote.background": "#ffd631",
    "textBlockQuote.border": "#ffd631",
    "textCodeBlock.background": "#ffd631",

    "scrollbarSlider.background": "#1a203f",
    "scrollbarSlider.hoverBackground": "#38427c",
    "scrollbarSlider.activeBackground": "#38427c",
  },
} as monacoEditor.IStandaloneThemeData;
