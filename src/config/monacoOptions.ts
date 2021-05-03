import { editor as monacoEditor } from "monaco-editor";

export default {
  value: ``,
  language: "customCalcLang",
  theme: "customCalcTheme",
  fontFamily: "Ubuntu Mono",
  fontSize: 18,
  fontWeight: "bold",
  lineHeight: 32,
  autoClosingBrackets: "languageDefined",
  scrollBeyondLastLine: false,
  lineNumbers: "off",
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  minimap: {
    enabled: false,
  },
  matchBrackets: "never",
  wordWrap: "on",
  scrollbar: {
    vertical: "visible",
    horizontal: "hidden",
    useShadows: false,
    verticalScrollbarSize: 5,
  },
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: "never",
  },
  colorDecorators: false,
} as monacoEditor.IStandaloneEditorConstructionOptions;
