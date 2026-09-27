export const museumRooms = [
  {
    id: "math",
    name: "Math",
    tagline: "Numbers can fool you.",
    description:
      "Explore the small assumptions that lead to surprising answers.",
    symbol: "÷",
    exhibits: [
      {
        id: "math-percentages",
        number: "001",
        topic: "Percentages",
        title: "Back to the original price?",
        question:
          "A bag costs ₪100. Its price drops by 20%, then the new price rises by 20%. What is the final price?",
        incorrectAnswer:
          "₪100 — the decrease and increase cancel each other out.",
      },
      {
        id: "math-fractions",
        number: "002",
        topic: "Fractions",
        title: "Just add everything?",
        question: "What is 1/2 + 1/3?",
        incorrectAnswer:
          "2/5 — add the top numbers, then add the bottom numbers.",
      },
      {
        id: "math-area",
        number: "003",
        topic: "Geometry",
        title: "Twice as wide, twice as big?",
        question:
          "A square has sides of 3 cm. If every side doubles to 6 cm, what happens to its area?",
        incorrectAnswer:
          "The area doubles from 9 cm² to 18 cm².",
      },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    tagline: "Almost working.",
    description:
      "Follow the code and find the moment it takes an unexpected turn.",
    symbol: "{ }",
    exhibits: [
      {
        id: "js-addition",
        number: "004",
        topic: "Type conversion",
        title: "When two becomes twenty-two",
        question: 'What does console.log("2" + 2) print?',
        incorrectAnswer:
          "4 — the plus operator adds the two numbers.",
      },
      {
        id: "js-comparison",
        number: "005",
        topic: "Comparisons",
        title: "Same contents, same array?",
        question: "What does console.log([] === []) print?",
        incorrectAnswer:
          "true — both arrays are empty, so they are equal.",
      },
      {
        id: "js-loops",
        number: "006",
        topic: "Loops",
        title: "One step too far",
        question:
          "An array has 3 items. A loop starts at i = 0 and runs while i <= items.length. How many iterations does it make?",
        incorrectAnswer:
          "3 — one iteration for each item in the array.",
      },
    ],
  },
];