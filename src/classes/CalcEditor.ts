// https://github.com/ajaxorg/ace/blob/master/demo/webpack/demo.js
// https://github.com/ajaxorg/ace/blob/ca4148/lib/ace/commands/default_commands.js
import ace, { Ace } from "ace-builds";
import "ace-builds/src-noconflict/ext-searchbox";
//import "ace-builds/src-noconflict/ext-settings_menu";
//import "ace-builds/webpack-resolver";
import "../config/aceMode";
import MathResultHandler from "./MathResultHandler";

export default class CalcEditor {
  public calcEditor: Ace.Editor;

  public scrollingTimeout: any = null;
  public scrolling: string | null = null;
  public scrollTimeoutDuration = 250;

  public resultContainer: HTMLElement | null = null;
  //public editorPlaceholder: HTMLElement | null = null;

  public mathResultHandler: MathResultHandler;

  private _currentTextareaLine: number = 0;
  private _mathInputs: any[] = [];

  get currentTextareaLine(): number {
    return this._currentTextareaLine;
  }
  set currentTextareaLine(newValue: number) {
    this._currentTextareaLine = newValue;

    if (this.resultContainer) {
      if (newValue > 0 && this.editorInFocus) {
        this.resultContainer.classList.add("showActiveLine");
        this.mathResultHandler.highlightResult(newValue);
      } else {
        this.resultContainer.classList.remove("showActiveLine");
      }
    }
  }

  get mathInputs(): any[] {
    return this._mathInputs;
  }
  set mathInputs(newValue: any[]) {
    this._mathInputs = newValue;
    this.mathResultHandler.mathInputs = newValue;
  }

  constructor() {
    this.resultContainer = document.querySelector(".mathResult");
    this.mathResultHandler = new MathResultHandler(this.resultContainer);

    this.calcEditor = ace.edit("calcEditor", {
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
    });

    // https://github.com/ajaxorg/ace/blob/ca4148/lib/ace/commands/default_commands.js
    this.calcEditor.commands.removeCommand("showSettingsMenu");
    this.calcEditor.commands.removeCommand("goToNextError");
    this.calcEditor.commands.removeCommand("goToPreviousError");
    this.calcEditor.commands.removeCommand("gotoline");
    this.calcEditor.commands.removeCommand("fold");
    this.calcEditor.commands.removeCommand("unfold");
    this.calcEditor.commands.removeCommand("toggleFoldWidget");
    this.calcEditor.commands.removeCommand("toggleParentFoldWidget");
    this.calcEditor.commands.removeCommand("foldall");
    this.calcEditor.commands.removeCommand("foldOther");
    this.calcEditor.commands.removeCommand("unfoldall");
    this.calcEditor.commands.removeCommand("sortlines");
    this.calcEditor.commands.removeCommand("togglecomment");
    this.calcEditor.commands.removeCommand("toggleBlockComment");

    this.calcEditor.focus();

    this.calcEditor.on("change", (event) => {
      //console.log(event);
      const value = this.calcEditor.getValue();
      this.mathInputs = this.parseMathInput(value);
    });

    (this.calcEditor as any).on("changeSelection", () => {
      this.setCurrentTextAreaLine();
    });

    this.calcEditor.on("blur", () => {
      this.currentTextareaLine = 0;
    });
    this.calcEditor.on("focus", () => {
      this.setCurrentTextAreaLine();
    });

    this.calcEditor.getSession().on("changeScrollTop", (scrollTop) => {
      if (this.calcEditor && this.resultContainer) {
        if (this.scrolling !== "result") {
          this.scrolling = "editor";
          this.resultContainer.scrollTop = scrollTop;

          clearTimeout(this.scrollingTimeout);
          this.scrollingTimeout = setTimeout(() => {
            if (this.calcEditor && this.resultContainer) {
              this.resultContainer.scrollTop = this.calcEditor
                .getSession()
                .getScrollTop();
            }
            this.scrolling = null;
          }, this.scrollTimeoutDuration);
          return false;
        }
      }
    });

    if (this.resultContainer) {
      this.resultContainer.addEventListener("scroll", () =>
        this.handleMathResultScroll()
      );
    }
  }

  get editorInFocus(): boolean {
    return this.calcEditor ? this.calcEditor.isFocused() : false;
  }

  setCurrentTextAreaLine() {
    if (this.calcEditor) {
      const currentSelection = this.calcEditor.getSelectionRange();
      const startRow = currentSelection.start.row;
      const endRow = currentSelection.end.row;
      //console.log(currentSelection.start.row, currentSelection.end.row);

      if (startRow !== endRow) {
        this.currentTextareaLine = 0;
      } else {
        if (this.mathResultHandler.isResultLineEmpty(startRow + 1)) {
          this.currentTextareaLine = 0;
        } else {
          this.currentTextareaLine = startRow + 1;
        }
      }
    }
  }

  handleMathResultScroll(): void {
    if (this.calcEditor && this.resultContainer) {
      if (this.scrolling !== "editor") {
        this.scrolling = "result";
        this.calcEditor
          .getSession()
          .setScrollTop(this.resultContainer.scrollTop);

        clearTimeout(this.scrollingTimeout);
        this.scrollingTimeout = setTimeout(() => {
          this.scrolling = null;
        }, this.scrollTimeoutDuration);
      }
    }
  }

  parseMathInput(input: string): any[] {
    //const formattedMathInput = input; //.toLowerCase(); // .replace(",", ".")
    let mathExpressions = input.split("\n");

    return mathExpressions.map((expression: string) => {
      expression = expression.trim();
      expression = expression.replace(/[ ]+(plus|PLUS)[ ]+/g, " + ");
      expression = expression.replace(/[ ]+(minus|MINUS)[ ]+/g, " - ");
      expression = expression.replace(/[ ]+(divide|DIVIDE)[ ]+/g, " / ");
      expression = expression.replace(/[ ]+(multiply|MULTIPLY)[ ]+/g, " * ");
      expression = expression.replace(/[ ]+(modulo|MODULO)[ ]+/g, " % ");

      // check if expression contains list (e.g. [1,2,3])
      if (!new RegExp("\\[.*?\\]").test(expression)) {
        // TODO: implement a more complex parser of number grouping,
        // since this currently ignores any line with a list in it(e.g. "[1,2,3] + 2,000", get ignored)

        //console.log("ran number grouping replace!", expression);
        expression = expression.replace(
          /([0-9]),([0-9]{3}),?([. \n]?)/g,
          "$1$2$3"
        );
      }

      return {
        expression: expression,
      };
    });
  }
}
