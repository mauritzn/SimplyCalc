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

<style lang="scss" scoped>
#app {
  color: #eeeeee;
  height: 100vh;
}

header {
  position: relative;
  display: flex;
  height: 70px;
  width: 100%;
  background-color: #202646;
  padding: 10px 25px;
  align-items: center;
  //box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.1);
  z-index: 50;

  h1 {
    position: relative;
    color: white;
    top: 2px;
  }
}

.container {
  position: relative;
  display: flex;
  height: calc(100vh - 70px);
  padding: 25px;

  textarea,
  .mathResult {
    padding: 0;
    margin: 0;

    &::-webkit-scrollbar-track {
      border-radius: 10px;
      background-color: #1a203f;
    }

    &::-webkit-scrollbar {
      width: 5px;
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: #2c3561;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #38427c;
    }
  }

  textarea {
    position: relative;
    width: 50%;
    height: 100%;
    line-height: var(--input-lh);
    font-weight: var(--weight-bold);
    border: none;
    background-color: transparent;
    color: #ffd631;
    outline: none;
    resize: none;
    z-index: 25;
  }

  .separator {
    position: relative;
    height: 100%;
    width: 1px;
    padding-left: 25px;
    padding-right: 50px;
    z-index: 50;

    &::before {
      content: "";
      position: absolute;
      background-color: #e3e3e3;
      height: 90%;
      width: 1px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.75;
    }
  }

  .mathResult {
    position: relative;
    width: 50%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    color: #00ff76;
    font-weight: var(--weight-bold);
    z-index: 25;

    &::before {
      content: "";
    }

    &.showActiveLine > p {
      opacity: 0.5;
    }

    p {
      margin: 0;
      line-height: var(--input-lh);
      opacity: 1;
      transition: opacity 0.1s ease-in-out;

      &.active {
        opacity: 1;
      }

      &:empty:before {
        content: "\200b"; /* unicode zero width space character */
      }
    }
  }
}
</style>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import * as mathjs from "mathjs";

@Component
export default class App extends Vue {
  mathInput: string = ``;
  currentTextareaLine: number = 0;
  roundRegex = new RegExp("^round", "i");
  roundableStringResultRegex = new RegExp("([0-9.]+)[ ]+([a-z/() ^0-9]+)", "i"); // ([0-9.]+)[ ]+([A-Z]+)
  inputTextarea: HTMLTextAreaElement | null = null;
  resultElement: HTMLElement | null = null;
  scrollingTimeout: any = null;
  scrollTimeoutDuration = 250;

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
              //console.log(result.toString());f
              //console.log(result.toNumber());
              let names = result.units.map((item: any) => {
                return item.unit.name;
              });
              //console.log(names);
              result = `${mathjs.round(result.toNumber(), 2)} ${names[0]}`;
            } else {
              result = mathjs.round(result, 2);
            }
          }
        }
      } catch (err) {}

      /* if (!result) {
        if (this.mathResult && this.mathResult[index]) {
          result = this.mathResult[index];
        }
      } */

      return result !== null && result !== undefined ? result : null;
    });
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
  initScrollListeners() {
    if (this.inputTextarea && this.resultElement) {
      //console.log("init!");
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