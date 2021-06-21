import "./css/app.scss";
import CalcEditor from "./classes/CalcEditor";
import ResultViewer from "./classes/ResultViewer";

// TODO: highlight the current line in the result panel

const calcEditor = new CalcEditor();
const resultViewer = new ResultViewer();
const scrollTimeoutDuration: number = 250;
let scrollTimeout: any = null;

calcEditor.onChange = (textLines) => {
  //console.log("value changed", textLines);
  resultViewer.handleMath(textLines);
};

// handle synced scrolling
calcEditor.onScrollTop = (scrollTop) => {
  if (!resultViewer.scrolling) {
    //console.log("calcEditor scrollTop changed", scrollTop);
    calcEditor.scrolling = true;
    resultViewer.aceEditor.getSession().setScrollTop(scrollTop);

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      calcEditor.scrolling = false;
    }, scrollTimeoutDuration);
  }
};
resultViewer.onScrollTop = (scrollTop) => {
  if (!calcEditor.scrolling) {
    //console.log("resultViewer scrollTop changed", scrollTop);
    resultViewer.scrolling = true;
    calcEditor.aceEditor.getSession().setScrollTop(scrollTop);

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      resultViewer.scrolling = false;
    }, scrollTimeoutDuration);
  }
};
