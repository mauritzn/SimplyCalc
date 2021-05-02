import * as monaco from "monaco-editor";
import MathResultHandler from "./MathResultHandler";
import calcLanguage from "../monaco/calcLang";
import { completionItemProvider } from "../monaco/calcLangAutocomplete";
import calcTheme from "../monaco/calcTheme";
import monacoOptions from "../config/monacoOptions";

type mEditor = monaco.editor.IStandaloneCodeEditor;

export default class CalcEditor {
  public calcEditor: mEditor | null = null;

  public scrollingTimeout: any = null;
  public scrolling: string | null = null;
  public scrollTimeoutDuration = 250;

  public resultContainer: HTMLElement | null = null;
  public editorPlaceholder: HTMLElement | null = null;

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

    const calcEditorContainer = document.querySelector(
      "#calcEditor"
    ) as HTMLElement | null;
    if (calcEditorContainer) {
      monaco.languages.register({ id: "customCalcLang" });
      monaco.languages.setMonarchTokensProvider("customCalcLang", calcLanguage);
      monaco.languages.setLanguageConfiguration("customCalcLang", {
        autoClosingPairs: [{ open: "(", close: ")" }],
      });
      monaco.languages.registerCompletionItemProvider(
        "customCalcLang",
        completionItemProvider
      );
      monaco.editor.defineTheme("customCalcTheme", calcTheme);

      this.calcEditor = monaco.editor.create(
        calcEditorContainer,
        monacoOptions
      );
      if (this.calcEditor) {
        this.mathInputs = this.parseMathInput(
          (this.calcEditor as mEditor).getValue()
        );

        window.addEventListener("resize", () => {
          (this.calcEditor as mEditor).layout();
        });

        this.calcEditor.onDidChangeModelContent(() => {
          const value = (this.calcEditor as mEditor).getValue();
          this.mathInputs = this.parseMathInput(value);

          if (this.editorPlaceholder) {
            if (value && value.length > 0) {
              this.editorPlaceholder.style.display = "none";
            } else {
              this.editorPlaceholder.style.display = "block";
            }
          }
        });

        this.calcEditor.onDidChangeCursorPosition((event) => {
          //console.log("cursor change");
          const lineNumber = event.position.lineNumber;
          if (this.mathResultHandler.isResultLineEmpty(lineNumber)) {
            this.currentTextareaLine = 0;
          } else {
            this.currentTextareaLine = event.position.lineNumber;
          }
        });

        this.calcEditor.onDidScrollChange((event) => {
          if (this.calcEditor && this.resultContainer) {
            if (this.scrolling !== "result") {
              this.scrolling = "editor";
              this.resultContainer.scrollTop = event.scrollTop;

              clearTimeout(this.scrollingTimeout);
              this.scrollingTimeout = setTimeout(() => {
                if (this.calcEditor && this.resultContainer) {
                  this.resultContainer.scrollTop = this.calcEditor.getScrollTop();
                }
                this.scrolling = null;
              }, this.scrollTimeoutDuration);
              return false;
            }
          }
          return;
        });

        this.calcEditor.focus();
      }
    }

    if (this.resultContainer) {
      this.resultContainer.addEventListener(
        "scroll",
        this.handleMathResultScroll
      );
    }

    this.editorPlaceholder = document.querySelector(
      "#calcEditor > .placeholder"
    );
    if (this.editorPlaceholder) {
      this.editorPlaceholder.addEventListener("click", () => {
        if (this.calcEditor) {
          this.calcEditor.focus();
        }
      });
    }
  }

  get editorInFocus(): boolean {
    return this.calcEditor ? this.calcEditor.hasTextFocus() : false;
  }

  handleMathResultScroll(): void {
    if (this.calcEditor && this.resultContainer) {
      if (this.scrolling !== "editor") {
        this.scrolling = "result";
        this.calcEditor.setScrollTop(this.resultContainer.scrollTop);

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

/*
5 * 7.5415241
round(5 * 7.5415241)
round(5 * 7.5415241, 2)

floor(2.324)
ceil(2.324)

f(x) = x ^ 2 - 5
f(2)
f(3)

g(x, y) = x ^ y
g(2, 3)

a = 3.4
b = 5 / 2
a * b

8 * 2
8.5 / 2
8 xor 5

12.7 cm to inch
sin(45 deg)^2
9 / 3 + 2i
1.2 * (2 + 4.5)
cos(45 deg)
sqrt(-4)
sqrt(3^2 + 4^2)
*/
