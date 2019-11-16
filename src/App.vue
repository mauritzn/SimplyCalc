<template>
  <div id="app">
    <header>
      <h1>Electron Calc</h1>
    </header>

    <div class="container">
      <textarea name="mathInput" placeholder="Math goes here" v-model="mathInput"></textarea>
      <div class="separator"></div>
      <div class="mathResult" :class="(currentTextareaLine > 0 ? 'showActiveLine' : '')">
        <p
          v-for="(result, index) in mathResult"
          :key="index"
          :class="((currentTextareaLine - 1) === index ? 'active' : '')"
        >{{ (result !== null ? result : "") }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import * as mathjs from "mathjs";

@Component
export default class App extends Vue {
  mathInput: string = ``;
  currentTextareaLine: number = 0;
  roundRegex = new RegExp("^round", "i");
  scrollingTimeout: any = null;
  scrollTimeoutDuration = 250;
  inputTextarea: HTMLTextAreaElement | null = null;
  resultElement: HTMLElement | null = null;

  get mathInputs(): any[] {
    const formattedMathInput = this.mathInput.toLowerCase().replace(",", ".");
    let mathExpressions = formattedMathInput.split("\n");

    return mathExpressions.map((expression: string) => {
      expression = expression.trim();
      let shouldRound = this.roundRegex.test(expression);
      return {
        expression: expression.replace(this.roundRegex, "").trim(),
        round: shouldRound
      };
    });
  }

  get mathResult(): any[] {
    return this.mathInputs.map((input: any, index: number) => {
      let result: any = null;

      try {
        result = mathjs.evaluate(input.expression);
        if (new RegExp("^function", "i").test(result)) {
          result = null;
        } else {
          if (input.round) {
            if (result.hasOwnProperty("units")) {
              let names = result.units.map((item: any) => {
                return item.unit.name;
              });
              result = `${mathjs.round(result.toNumber(), 2)} ${names[0]}`;
            } else {
              result = mathjs.round(result, 2);
            }
          }
        }
      } catch (err) {}

      return result !== null && result !== undefined ? result : null;
    });
  }

  initScrollListeners() {
    if (this.inputTextarea && this.resultElement) {
      this.inputTextarea.removeEventListener(
        "scroll",
        this.handleTextareaScroll
      );
      this.resultElement.removeEventListener(
        "scroll",
        this.handleMathResultScroll
      );
      this.inputTextarea.addEventListener("scroll", this.handleTextareaScroll);
      this.resultElement.addEventListener(
        "scroll",
        this.handleMathResultScroll
      );
    }
  }

  handleTextareaCursor(event: Event) {
    if (event.type === "blur") this.currentTextareaLine = 0;
    else {
      this.currentTextareaLine = this.getTextareaLineNumber();
      if (!this.mathResult[this.currentTextareaLine - 1]) {
        this.currentTextareaLine = 0;
      }
    }
    this.handleTextareaScroll(event);
  }
  handleTextareaScroll(event: Event) {
    if (this.inputTextarea && this.resultElement) {
      this.resultElement.removeEventListener(
        "scroll",
        this.handleMathResultScroll
      );
      this.resultElement.scrollTop = this.inputTextarea.scrollTop;

      clearTimeout(this.scrollingTimeout);
      this.scrollingTimeout = setTimeout(() => {
        this.initScrollListeners();
      }, this.scrollTimeoutDuration);
      return false;
    }
  }
  handleMathResultScroll(event: Event) {
    if (this.inputTextarea && this.resultElement) {
      this.inputTextarea.removeEventListener(
        "scroll",
        this.handleTextareaScroll
      );
      this.inputTextarea.scrollTop = this.resultElement.scrollTop;

      clearTimeout(this.scrollingTimeout);
      this.scrollingTimeout = setTimeout(() => {
        this.initScrollListeners();
      }, this.scrollTimeoutDuration);
      return false;
    }
  }

  getTextareaLineNumber() {
    if (this.inputTextarea) {
      return this.inputTextarea.value
        .substr(0, this.inputTextarea.selectionStart)
        .split("\n").length;
    }
    return 0;
  }

  mounted() {
    this.inputTextarea = document.querySelector("textarea");
    this.resultElement = document.querySelector(".mathResult");

    if (this.inputTextarea && this.resultElement) {
      this.inputTextarea.focus();
      this.inputTextarea.addEventListener("blur", this.handleTextareaCursor);
      this.inputTextarea.addEventListener("focus", this.handleTextareaCursor);
      this.inputTextarea.addEventListener("keyup", this.handleTextareaCursor);
      this.inputTextarea.addEventListener("mouseup", this.handleTextareaCursor);
      this.initScrollListeners();
    }
  }
}
</script>