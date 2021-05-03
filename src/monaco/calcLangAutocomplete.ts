import {
  languages as monacoLanguages,
  editor as monacoEditor,
  Position as monacoPosition,
} from "monaco-editor";

type ITextModel = monacoEditor.ITextModel;
type Position = monacoPosition;
type CompletionList = monacoLanguages.CompletionList;
type ProviderResult<T> = monacoLanguages.ProviderResult<T>;
type CompletionItem = monacoLanguages.CompletionItem;
type CompletionItemProvider = monacoLanguages.CompletionItemProvider;

const insertAsSnippet =
  monacoLanguages.CompletionItemInsertTextRule.InsertAsSnippet;
const functionKind = monacoLanguages.CompletionItemKind.Function;
const keywordKind = monacoLanguages.CompletionItemKind.Keyword;
const operatorKind = monacoLanguages.CompletionItemKind.Operator;

export const functions: any[] = [
  {
    label: "round",
    kind: functionKind,
    documentation: "Round a value towards the nearest integer",
    insertText: "round(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "round2",
    kind: functionKind,
    documentation: "Round a value towards the nearest integer, with precision",
    insertText: "round(${1}, ${2})",
    insertTextRules: insertAsSnippet,
  },

  {
    label: "abs",
    kind: functionKind,
    documentation: "Calculate the absolute value of a number",
    insertText: "abs(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "ceil",
    kind: functionKind,
    documentation: "Round a value up to the next largest whole number",
    insertText: "ceil(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "floor",
    kind: functionKind,
    documentation: "Round a value down to the next largest whole number",
    insertText: "floor(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "sqrt",
    kind: functionKind,
    documentation: "Calculate the square root of a value",
    insertText: "sqrt(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "exp",
    kind: functionKind,
    documentation: "Calculate the exponent of a value",
    insertText: "exp(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "pow",
    kind: functionKind,
    documentation: "Calculates the power of x to y, x^y",
    insertText: "pow(${1}, ${2})",
    insertTextRules: insertAsSnippet,
  },

  {
    label: "min",
    kind: functionKind,
    documentation: "Compute the minimum value of a matrix or a list of values",
    insertText: "min(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "max",
    kind: functionKind,
    documentation:
      "Compute the maximum value of a matrix or a list with values",
    insertText: "max(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "mad",
    kind: functionKind,
    documentation:
      "Compute the median absolute deviation of a matrix or a list with values",
    insertText: "mad(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "median",
    kind: functionKind,
    documentation: "Compute the median of a matrix or a list with values",
    insertText: "median(${0})",
    insertTextRules: insertAsSnippet,
  },

  {
    label: "bignumber",
    kind: functionKind,
    documentation:
      "Create a BigNumber, which can store numbers with arbitrary precision",
    insertText: "bignumber(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "boolean",
    kind: functionKind,
    documentation:
      "Create a boolean or convert a string or number to a boolean",
    insertText: "boolean(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "complex",
    kind: functionKind,
    documentation:
      "Create a complex value or convert a value to a complex value",
    insertText: "complex(${1}, ${2})",
    insertTextRules: insertAsSnippet,
  },

  {
    label: "acos",
    kind: functionKind,
    documentation: "Calculate the inverse cosine of a value",
    insertText: "acos(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "acosh",
    kind: functionKind,
    documentation: "Calculate the hyperbolic arccos of a value",
    insertText: "acosh(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "acot",
    kind: functionKind,
    documentation: "Calculate the inverse cotangent of a value",
    insertText: "acot(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "acoth",
    kind: functionKind,
    documentation: "Calculate the hyperbolic arccotangent of a value",
    insertText: "acoth(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "acsc",
    kind: functionKind,
    documentation: "Calculate the inverse cosecant of a value",
    insertText: "acsc(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "acsch",
    kind: functionKind,
    documentation: "Calculate the hyperbolic arccosecant of a value",
    insertText: "acsch(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "asec",
    kind: functionKind,
    documentation: "Calculate the inverse secant of a value",
    insertText: "asec(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "asech",
    kind: functionKind,
    documentation: "Calculate the hyperbolic arcsecant of a value",
    insertText: "asech(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "asin",
    kind: functionKind,
    documentation: "Calculate the inverse sine of a value",
    insertText: "asin(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "asinh",
    kind: functionKind,
    documentation: "Calculate the hyperbolic arcsine of a value",
    insertText: "asinh(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "atan",
    kind: functionKind,
    documentation: "Calculate the inverse tangent of a value",
    insertText: "atan(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "atan2",
    kind: functionKind,
    documentation:
      "Calculate the inverse tangent function with two arguments, y/x",
    insertText: "atan2(${1}, ${2})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "atanh",
    kind: functionKind,
    documentation: "Calculate the hyperbolic arctangent of a value",
    insertText: "atanh(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "cos",
    kind: functionKind,
    documentation: "Calculate the cosine of a value",
    insertText: "cos(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "cosh",
    kind: functionKind,
    documentation: "Calculate the hyperbolic cosine of a value",
    insertText: "cosh(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "cot",
    kind: functionKind,
    documentation: "Calculate the cotangent of a value",
    insertText: "cot(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "coth",
    kind: functionKind,
    documentation: "Calculate the hyperbolic cotangent of a value",
    insertText: "coth(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "csc",
    kind: functionKind,
    documentation: "Calculate the cosecant of a value",
    insertText: "csc(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "csch",
    kind: functionKind,
    documentation: "Calculate the hyperbolic cosecant of a value",
    insertText: "csch(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "sec",
    kind: functionKind,
    documentation: "Calculate the secant of a value",
    insertText: "sec(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "sech",
    kind: functionKind,
    documentation: "Calculate the hyperbolic secant of a value",
    insertText: "sech(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "sin",
    kind: functionKind,
    documentation: "Calculate the sine of a value",
    insertText: "sin(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "sinh",
    kind: functionKind,
    documentation: "Calculate the hyperbolic sine of a value",
    insertText: "sinh(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "tan",
    kind: functionKind,
    documentation: "Calculate the tangent of a value",
    insertText: "tan(${0})",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "tanh",
    kind: functionKind,
    documentation: "Calculate the hyperbolic tangent of a value",
    insertText: "tanh(${0})",
    insertTextRules: insertAsSnippet,
  },

  {
    label: "and",
    kind: functionKind,
    documentation: "Logical and",
    insertText: "and",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "not",
    kind: functionKind,
    documentation: "Logical not",
    insertText: "not",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "or",
    kind: functionKind,
    documentation: "Logical or",
    insertText: "or",
    insertTextRules: insertAsSnippet,
  },
  {
    label: "xor",
    kind: functionKind,
    documentation: "Logical xor",
    insertText: "xor",
    insertTextRules: insertAsSnippet,
  },

  {
    label: "in",
    kind: functionKind,
    insertText: "in",
    insertTextRules: insertAsSnippet,
  },
];

export const typeKeywords: any[] = [
  {
    label: "true",
    kind: keywordKind,
    insertText: "true",
  },
  {
    label: "false",
    kind: keywordKind,
    insertText: "false",
  },
  {
    label: "deg",
    kind: keywordKind,
    insertText: "deg",
  },
  {
    label: "i",
    kind: keywordKind,
    insertText: "i",
  },

  {
    label: "mm",
    kind: keywordKind,
    insertText: "mm",
  },
  {
    label: "cm",
    kind: keywordKind,
    insertText: "cm",
  },
  {
    label: "m",
    kind: keywordKind,
    insertText: "m",
  },
  {
    label: "km",
    kind: keywordKind,
    insertText: "km",
  },
  {
    label: "inch",
    kind: keywordKind,
    insertText: "inch",
  },
  {
    label: "inches",
    kind: keywordKind,
    insertText: "inches",
  },
  {
    label: "feet",
    kind: keywordKind,
    insertText: "feet",
  },
  {
    label: "mile",
    kind: keywordKind,
    insertText: "mile",
  },
  {
    label: "miles",
    kind: keywordKind,
    insertText: "miles",
  },
  {
    label: "pi",
    kind: keywordKind,
    insertText: "pi",
  },
];

export const operators: any[] = [
  {
    label: "plus",
    kind: operatorKind,
    insertText: "plus",
  },
  {
    label: "minus",
    kind: operatorKind,
    insertText: "minus",
  },
  {
    label: "divide",
    kind: operatorKind,
    insertText: "divide",
  },
  {
    label: "multiply",
    kind: operatorKind,
    insertText: "multiply",
  },
  {
    label: "modulo",
    kind: operatorKind,
    insertText: "modulo",
  },
];

export let completionItemProvider: CompletionItemProvider = {
  provideCompletionItems: function (
    model: ITextModel,
    position: Position
  ): ProviderResult<CompletionList> {
    return {
      suggestions: functions
        .concat(typeKeywords)
        .concat(operators) as CompletionItem[],
    };
  },
};
