<template>
  <div id="app">
    <header>
      <h1>SimplyCalc</h1>
    </header>

    <div class="container">
      <div id="calcEditor">
        <span class="placeholder">Math goes here</span>
      </div>
      <div class="separator"></div>
      <div
        class="mathResult"
        :class="(currentTextareaLine > 0 && editorInFocus ? 'showActiveLine' : '')"
      >
        <p
          v-for="(result, index) in mathResult"
          :key="index"
          :class="((currentTextareaLine - 1) === index ? 'active' : '')"
        >{{ (result !== null ? result : "") }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#calcEditor {
  > .placeholder {
    position: absolute;
    letter-spacing: 0.1rem;
    font-weight: var(--weight-bold);
    line-height: var(--input-lh);
    opacity: 0.5;
    z-index: 10;
  }

  /* .mtkb {
    padding: 0 5px;
  } */

  .view-lines {
    letter-spacing: 0.1rem !important;
  }

  canvas.decorationsOverviewRuler {
    display: none !important;
  }

  .monaco-scrollable-element > .visible {
    background: #1a203f !important;
    border-radius: 10px !important;
  }

  .vs-dark .monaco-scrollable-element > .scrollbar > .slider {
    background: var(--scrollbar-main-color) !important;
    border-radius: 10px !important;
  }
}
</style>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import * as mathjs from "mathjs";
import * as monaco from "monaco-editor";
import calcLanguage from "@/monaco/calcLang";
import { completionItemProvider } from "@/monaco/calcLangAutocomplete";
import calcTheme from "@/monaco/calcTheme";

type mEditor = monaco.editor.IStandaloneCodeEditor;

function formatNumber(toFormat: number, separator = ",") {
  return toFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

@Component
export default class App extends Vue {
  calcEditor: mEditor | null = null;
  mathInputs: any[] = [];
  currentTextareaLine: number = 0;
  scrollingTimeout: any = null;
  scrolling: string | null = null;
  scrollTimeoutDuration = 250;
  resultElement: HTMLElement | null = null;
  editorPlaceholder: HTMLElement | null = null;
  mathScope: any = {};

  get editorInFocus(): boolean {
    return this.calcEditor ? this.calcEditor.hasTextFocus() : false;
  }

  get mathResult(): any[] {
    return this.mathInputs.map((input: any, index: number) => {
      let result: any = null;

      try {
        result = mathjs.evaluate(input.expression, this.mathScope);
        if (new RegExp("^function", "i").test(result)) {
          if (
            new RegExp("^[ ]*([A-Za-z]+[ ]*(.*?))[ ]*=", "i").test(
              input.expression
            )
          ) {
            const match = new RegExp(
              "^[ ]*([A-Za-z]+[ ]*(.*?))[ ]*=",
              "i"
            ).exec(input.expression);
            if (match) {
              result = match[1];
            }
          } else {
            result = "Function";
          }
        }

        // Add comments to result
        if (new RegExp("[ ]*#.*?$", "i").test(input.expression)) {
          const match = new RegExp("[ ]*#.*?$", "i").exec(input.expression);
          result = `${result ? result : ""}${match ? match : ""}`;
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
              result = result.toString().replace(match[0], formattedNumber);
            }
          }
        }
      } catch (err) {}

      return result !== null && result !== undefined ? result : null;
    });
  }

  handleMathResultScroll(event: Event) {
    if (this.calcEditor && this.resultElement) {
      if (this.scrolling !== "editor") {
        this.scrolling = "result";
        this.calcEditor.setScrollTop(this.resultElement.scrollTop);

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

      return {
        expression: expression
      };
    });
  }

  mounted() {
    this.resultElement = document.querySelector(".mathResult");

    const calcEditorContainer = document.getElementById("calcEditor");
    if (calcEditorContainer) {
      monaco.languages.register({ id: "customCalcLang" });
      monaco.languages.setMonarchTokensProvider("customCalcLang", calcLanguage);
      monaco.languages.setLanguageConfiguration("customCalcLang", {
        autoClosingPairs: [{ open: "(", close: ")" }]
      });
      monaco.languages.registerCompletionItemProvider(
        "customCalcLang",
        completionItemProvider
      );
      monaco.editor.defineTheme("customCalcTheme", calcTheme);

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

      this.calcEditor = monaco.editor.create(calcEditorContainer, {
        value: ``,
        language: "customCalcLang",
        theme: "customCalcTheme",
        fontFamily: "Open Sans",
        fontSize: 16,
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
          enabled: false
        },
        matchBrackets: "never",
        wordWrap: "on",
        scrollbar: {
          vertical: "visible",
          horizontal: "hidden",
          useShadows: false,
          verticalScrollbarSize: 5
        },
        find: {
          addExtraSpaceOnTop: false,
          autoFindInSelection: "never"
        },
        colorDecorators: false
      });

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

        this.calcEditor.onDidChangeCursorPosition(event => {
          const lineNumber = event.position.lineNumber;
          if (this.mathResult[lineNumber - 1] === null) {
            this.currentTextareaLine = 0;
          } else {
            this.currentTextareaLine = event.position.lineNumber;
          }
        });

        this.calcEditor.onDidScrollChange(event => {
          if (this.calcEditor && this.resultElement) {
            if (this.scrolling !== "result") {
              this.scrolling = "editor";
              this.resultElement.scrollTop = event.scrollTop;

              clearTimeout(this.scrollingTimeout);
              this.scrollingTimeout = setTimeout(() => {
                if (this.calcEditor && this.resultElement) {
                  this.resultElement.scrollTop = this.calcEditor.getScrollTop();
                }
                this.scrolling = null;
              }, this.scrollTimeoutDuration);
              return false;
            }
          }
        });

        this.calcEditor.focus();
      }
    }

    if (this.resultElement) {
      this.resultElement.addEventListener(
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
}
</script>