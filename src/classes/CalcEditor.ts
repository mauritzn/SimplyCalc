import { AceEditor } from "./AceEditor";

export default class CalcEditor {
  readonly aceEditor: AceEditor;

  public scrolling: boolean = false;

  public resultContainer: HTMLElement | null = null;
  //public editorPlaceholder: HTMLElement | null = null;

  //public mathResultHandler: MathResultHandler;

  private _currentTextareaLine: number = 0;

  public onChange: (textLines: string[]) => void = () => {};
  public onScrollTop: (scrollTop: number) => void = () => {};

  get currentTextareaLine(): number {
    return this._currentTextareaLine;
  }
  set currentTextareaLine(newValue: number) {
    this._currentTextareaLine = newValue;

    /* if (this.resultContainer) {
      if (newValue > 0 && this.aceEditor.isFocused()) {
        this.resultContainer.classList.add("showActiveLine");
        this.mathResultHandler.highlightResult(newValue);
      } else {
        this.resultContainer.classList.remove("showActiveLine");
      }
    } */
  }

  constructor() {
    this.resultContainer = document.querySelector(".mathResult");
    //this.mathResultHandler = new MathResultHandler(this.resultContainer);

    this.aceEditor = new AceEditor("calcEditor", { readOnly: false });
    this.aceEditor.focus();

    this.aceEditor.on("change", (event) => {
      //console.log(event);
      this.onChange(this.getParsedValues());
    });

    this.aceEditor.on("changeSelection", () => {
      this.setCurrentTextAreaLine();
    });

    this.aceEditor.on("blur", () => {
      this.currentTextareaLine = 0;
    });
    this.aceEditor.on("focus", () => {
      this.setCurrentTextAreaLine();
    });

    this.aceEditor.getSession().on("changeScrollTop", (scrollTop) => {
      this.onScrollTop(scrollTop);
    });
  }

  setCurrentTextAreaLine() {
    if (this.aceEditor) {
      const currentSelection = this.aceEditor.getSelectionRange();
      const startRow = currentSelection.start.row;
      const endRow = currentSelection.end.row;
      //console.log(currentSelection.start.row, currentSelection.end.row);

      if (startRow !== endRow) {
        this.currentTextareaLine = 0;
      } else {
        /* if (this.mathResultHandler.isResultLineEmpty(startRow + 1)) {
          this.currentTextareaLine = 0;
        } else {
          this.currentTextareaLine = startRow + 1;
        } */
      }
    }
  }

  getParsedValues() {
    const values = this.aceEditor.getValues();
    return this.parseMathInput(values);
  }

  parseMathInput(inputs: string[]): string[] {
    //const formattedMathInput = input; //.toLowerCase(); // .replace(",", ".")

    return inputs.map((input: string) => {
      input = input.trim();
      input = input.replace(/[ ]+(plus|PLUS)[ ]+/g, " + ");
      input = input.replace(/[ ]+(minus|MINUS)[ ]+/g, " - ");
      input = input.replace(/[ ]+(divide|DIVIDE)[ ]+/g, " / ");
      input = input.replace(/[ ]+(multiply|MULTIPLY)[ ]+/g, " * ");
      input = input.replace(/[ ]+(modulo|MODULO)[ ]+/g, " % ");

      // check if expression contains list (e.g. [1,2,3])
      if (!new RegExp("\\[.*?\\]").test(input)) {
        // TODO: implement a more complex parser of number grouping,
        // since this currently ignores any line with a list in it (e.g. "[1,2,3] + 2,000", get ignored)
        // and the current one also incorrectly parses function arguments (e.g. test(12,345))

        //console.log("ran number grouping replace!", expression);
        input = input.replace(/([0-9]),([0-9]{3}),?([. \n]?)/g, "$1$2$3");
      }

      return input;
    });
  }
}
