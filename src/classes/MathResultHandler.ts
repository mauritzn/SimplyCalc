import * as mathjs from "mathjs";

export default class MathResultHandler {
  private mathScope: any = {};
  private resultContainer: HTMLElement;
  private _mathInputs: any[] = [];
  private _results: Array<string | null> = [];

  constructor(resultContainer: HTMLElement) {
    //console.log("new MathResultHandler(resultContainer)");
    this.resultContainer = resultContainer;
  }

  public set mathInputs(newValue: any[]) {
    this._mathInputs = newValue;

    this.results = newValue.map((input: any, index: number) => {
      let result: string | null = null;

      // catch mathjs errors
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

        result = [null, undefined].includes(result) ? null : String(result);

        // Add comments to result
        if (new RegExp("[ ]*#.*?$", "i").test(input.expression)) {
          const match = new RegExp("[ ]*#.*?$", "i").exec(input.expression);
          result = `${result ? result : ""} <span>${
            match ? match[0] : ""
          }</span>`;
        }

        // Add number grouping to result
        if (
          new RegExp("[0-9]+", "i").test(result) &&
          !new RegExp("^[ ]*#.*?$", "i").test(result)
        ) {
          if (Number.isInteger(result)) {
            result = this.formatNumber(result);
          } else {
            const match = new RegExp("[0-9]+", "i").exec(result);
            if (match && result) {
              const formattedNumber = this.formatNumber(Number(match[0]));
              result = String(result).replace(match[0], formattedNumber);
            }
          }
        }
      } catch (err) {}

      return [null, undefined].includes(result) ? null : result;
    });
  }

  public get results(): Array<string | null> {
    return this._results;
  }
  public set results(newValue: Array<string | null>) {
    this._results = newValue;

    // render result lines
    let resultLines = document.querySelectorAll(`.mathResult p[key]`);
    if (resultLines.length > 0) {
      if (resultLines.length < newValue.length) {
        // add placeholder result lines if there are too few lines
        for (let i = 0; i < newValue.length - resultLines.length; i++) {
          this.addPlaceholderResultLine();
        }
      } else if (resultLines.length > newValue.length) {
        // remove unneeded result lines
        for (let i = resultLines.length - 1; i >= newValue.length; i--) {
          resultLines[i].remove();
        }
      }

      resultLines = document.querySelectorAll(`.mathResult p[key]`);
      resultLines.forEach((resultLine, key) => {
        const currentResult = resultLine.innerHTML;
        const newResult = newValue[key];
        const attrKey = resultLine.getAttribute("key");

        // fix incorrect keys and change "placeholder" keys
        if (Number(attrKey) !== key) {
          resultLine.setAttribute("key", String(key));
        }

        if (newResult !== currentResult) {
          resultLine.innerHTML = newResult;
        }
      });
    } else {
      // nothing to check, simply add results
      newValue.map((value, key) => {
        this.addResultLine(key + 1, value);
      });
    }
  }

  public highlightResult(lineNumber: number): void {
    this.results.map((result: any, index: number) => {
      let element = this.getResultLine(index + 1);
      if (element) {
        if (lineNumber - 1 === index) {
          element.classList.add("active");
        } else {
          element.classList.remove("active");
        }
      }
    });
  }
  public isResultLineEmpty(lineNumber: number): boolean {
    return this.results[lineNumber - 1] === null;
  }

  public getResultLine(lineNumber: number): HTMLElement | null {
    return document.querySelector(
      `.mathResult p[key="${String(lineNumber - 1)}"]`
    );
  }
  private addPlaceholderResultLine(): void {
    let resultElement = document.createElement("p") as HTMLElement;
    resultElement.innerHTML = "";
    resultElement.setAttribute("key", "placeholder");
    this.resultContainer.append(resultElement);
  }
  private addResultLine(lineNumber: number, value: string): void {
    let resultElement = document.createElement("p") as HTMLElement;
    resultElement.innerHTML = value ? value : "";
    resultElement.setAttribute("key", String(lineNumber - 1));
    this.resultContainer.append(resultElement);
  }

  private formatNumber(toFormat: string | number, separator = ","): string {
    return String(toFormat).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }
}
