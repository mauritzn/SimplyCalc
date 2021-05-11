import { Ace } from "ace-builds";

export default {
  placeholder: "Math goes here",
  value: "",
  fontFamily: "Ubuntu Mono",
  fontSize: 18,
  tabSize: 2,
  mode: "ace/mode/custom",
  printMargin: false,
  displayIndentGuides: false,
  showFoldWidgets: false,
  showLineNumbers: false,
  showGutter: false,
  showPrintMargin: false,
  showInvisibles: false,
  highlightGutterLine: false,
  highlightActiveLine: false,
  enableAutoIndent: false,
  behavioursEnabled: true, // auto closing brackets, etc.
} as Partial<Ace.EditorOptions>;
