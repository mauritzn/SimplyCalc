import { evaluate as evaluateMath } from "mathjs";
import { formatNumber } from "./Functions";
import { AceEditor } from "./AceEditor";

export default class ResultViewer {
  readonly aceEditor: AceEditor;

  public scrolling: boolean = false;

  public onScrollTop: (scrollTop: number) => void = () => {};

  private _currentTextareaLine: number = 0;

  /* get currentTextareaLine(): number {
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
  } */

  constructor() {
    //this.resultContainer = document.querySelector(".mathResult");
    //this.mathResultHandler = new MathResultHandler(this.resultContainer);

    this.aceEditor = new AceEditor("resultViewer", {
      readOnly: true,
      placeholder: "",
    });

    this.aceEditor.getSession().on("changeScrollTop", (scrollTop) => {
      this.onScrollTop(scrollTop);
    });

    /* this.calcEditor.on("change", (event) => {
      //console.log(event);
      const value = this.calcEditor.getValue();
      this.mathInputs = this.parseMathInput(value);
    });

    this.calcEditor.on("changeSelection", () => {
      this.setCurrentTextAreaLine();
    });

    this.calcEditor.on("blur", () => {
      this.currentTextareaLine = 0;
    });
    this.calcEditor.on("focus", () => {
      this.setCurrentTextAreaLine();
    }); */
  }

  handleMath(textLines: string[]) {
    let mathScope = {};
    const results = textLines.map((input: string, index: number) => {
      let result: string | null = null;

      // catch mathjs errors
      try {
        result = evaluateMath(input, mathScope);
        if (new RegExp("^function", "i").test(result)) {
          if (new RegExp("^[ ]*([A-Za-z]+[ ]*(.*?))[ ]*=", "i").test(input)) {
            const match = new RegExp(
              "^[ ]*([A-Za-z]+[ ]*(.*?))[ ]*=",
              "i"
            ).exec(input);
            if (match) {
              result = match[1];
            }
          } else {
            result = "Function";
          }
        }

        result = [null, undefined].includes(result) ? "" : String(result);

        // Add comments to result
        if (new RegExp("[ ]*#.*?$", "i").test(input)) {
          const match = new RegExp("[ ]*#.*?$", "i").exec(input);
          result = (result ? result : "") + (match ? match[0] : "");
        }

        // Add number grouping to result
        if (
          new RegExp("[0-9]+", "i").test(result) &&
          !new RegExp("^[ ]*#.*?$", "i").test(result)
        ) {
          if (Number.isInteger(result)) {
            result = formatNumber(result);
          } else {
            const match = new RegExp("[0-9]+", "i").exec(result);
            if (match && result) {
              const formattedNumber = formatNumber(Number(match[0]));
              result = String(result).replace(match[0], formattedNumber);
            }
          }
        }
      } catch (err) {}

      // TODO: add something if output is input?
      // (to make it easier for the user to see, or just fade it out a bit?)
      //return [null, undefined, ""].includes(result) ? input : result;
      return [null, undefined, ""].includes(result) ? "" : result;
    });

    //console.log(results);

    this.aceEditor.getSession().setValue(results.join("\n"));
  }

  /* get editorInFocus(): boolean {
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
  } */
}
