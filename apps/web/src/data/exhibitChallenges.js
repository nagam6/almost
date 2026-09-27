export const exhibitChallenges = {
  "math-percentages": {
    options: [
      {
        id: "same-amount",
        text: "The same percentage always represents the same amount.",
      },
      {
        id: "different-base",
        text: "The increase is calculated from a smaller price.",
      },
      {
        id: "reverse-order",
        text: "The changes would cancel out if we reversed their order.",
      },
    ],
  },

  "math-fractions": {
    options: [
      {
        id: "common-denominator",
        text: "The fractions need a common denominator before adding.",
      },
      {
        id: "multiply-all",
        text: "We should multiply both numerators and denominators.",
      },
      {
        id: "larger-denominator",
        text: "We should add the numerators and keep the larger denominator.",
      },
    ],
  },

  "math-area": {
    options: [
      {
        id: "one-dimension",
        text: "Only one dimension affects the area.",
      },
      {
        id: "both-dimensions",
        text: "Both dimensions double, so the area becomes four times larger.",
      },
      {
        id: "add-length",
        text: "We should add the extra side length to the original area.",
      },
    ],
  },

  "js-addition": {
    options: [
      {
        id: "automatic-number",
        text: "JavaScript always converts strings into numbers when using +.",
      },
      {
        id: "string-concatenation",
        text: "One value is a string, so + joins the values as text.",
      },
      {
        id: "syntax-error",
        text: "Using a string and a number together causes a syntax error.",
      },
    ],
  },

  "js-comparison": {
    options: [
      {
        id: "compare-length",
        text: "Strict equality compares only the lengths of arrays.",
      },
      {
        id: "empty-invalid",
        text: "Empty arrays cannot be compared.",
      },
      {
        id: "different-references",
        text: "These are two separate arrays with different references.",
      },
    ],
  },

  "js-loops": {
    options: [
      {
        id: "inclusive-boundary",
        text: "The condition includes index 3, so the loop runs four times.",
      },
      {
        id: "starts-at-one",
        text: "Array indexes start at 1, so the first iteration is skipped.",
      },
      {
        id: "length-changes",
        text: "Reading an array item automatically changes its length.",
      },
    ],
  },
};