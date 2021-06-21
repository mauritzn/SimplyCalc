// https://github.com/ajaxorg/ace/blob/master/demo/webpack/demo.js
// https://github.com/ajaxorg/ace/blob/ca4148/lib/ace/commands/default_commands.js
import ace, { Ace } from "ace-builds";
import "ace-builds/src-noconflict/ext-searchbox";
//import "ace-builds/src-noconflict/ext-settings_menu";
//import "ace-builds/webpack-resolver";
import "../config/customAceMode";

// https://github.com/ajaxorg/ace/blob/ca4148/lib/ace/commands/default_commands.js
const commandsToRemove = [
  "showSettingsMenu",
  "goToNextError",
  "goToPreviousError",
  "gotoline",
  "fold",
  "unfold",
  "toggleFoldWidget",
  "toggleParentFoldWidget",
  "foldall",
  "foldOther",
  "unfoldall",
  "sortlines",
  "togglecomment",
  "toggleBlockComment",
];

type EditorEventNames =
  | "blur"
  | "input"
  | "change"
  | "changeSelection" // missing from ace.d.ts (even though it's valid)
  | "changeSelectionStyle"
  | "changeSession"
  | "copy"
  | "focus"
  | "paste";

export class AceEditor {
  public editor: Ace.Editor;

  get container(): HTMLElement {
    return this.editor.container;
  }
  get renderer(): Ace.VirtualRenderer {
    return this.editor.renderer;
  }
  get commands(): Ace.CommandManager {
    return this.editor.commands;
  }

  constructor(
    elementId: string,
    options: Partial<Ace.EditorOptions> = { readOnly: false }
  ) {
    this.editor = ace.edit(
      elementId,
      Object.assign(
        {
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
        },
        options
      )
    );

    let aceTextarea = this.container.querySelector("textarea");
    if (aceTextarea) aceTextarea.id = `${elementId}Textarea`;

    commandsToRemove.map((command) => {
      this.commands.removeCommand(command);
    });
  }

  blur() {
    this.editor.blur();
  }
  focus() {
    this.editor.focus();
  }
  isFocused(): boolean {
    return this.editor.isFocused();
  }

  getSession(): Ace.EditSession {
    return this.editor.getSession();
  }
  getSelectionRange(): Ace.Range {
    return this.editor.getSelectionRange();
  }
  getValue(): string {
    return this.editor.getValue();
  }
  getValues(): string[] {
    return this.getSession().getLines(0, this.getSession().getLength() - 1);
  }

  on(name: EditorEventNames, callback: (e: any) => void): Function {
    return this.editor.on(name as any, callback);
  }
}
