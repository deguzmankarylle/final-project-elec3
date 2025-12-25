"use strict";

/**
 * Modern Calculator Application
 * Refactored with improved structure, better naming, and enhanced maintainability
 */

// ===== DOM Elements =====
const domElements = {
  expression: document.getElementById("expression"),
  result: document.getElementById("result"),
  buttonsContainer: document.getElementById("keys"),
};

// ===== Calculator State =====
const calculatorState = {
  firstOperand: null,           // First number in calculation
  secondOperand: null,          // Second number (for repeated equals)
  operator: null,               // Current operator: "+", "-", "*", "/"
  currentInput: "0",            // Current display input
  hasCalculated: false,         // Flag for post-equals state
  isError: false,               // Error state flag
};

// ===== Utility Functions =====

/**
 * Check if calculator is in error state
 */
function checkErrorState() {
  return calculatorState.isError || calculatorState.currentInput === "Error";
}

/**
 * Format number to avoid floating-point precision issues
 */
function formatDisplayNumber(number) {
  if (!Number.isFinite(number)) return "Error";
  const rounded = Math.round((number + Number.EPSILON) * 1e12) / 1e12;
  return String(rounded);
}

/**
 * Get current input as a number
 */
function getCurrentInputAsNumber() {
  const { currentInput } = calculatorState;
  if (currentInput === "." || currentInput === "-.") return 0;
  return Number(currentInput);
}

/**
 * Perform arithmetic operation
 */
function performCalculation(a, operator, b) {
  switch (operator) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return NaN;
  }
}

/**
 * Update the display with current state
 */
function updateDisplay() {
  const expressionParts = [];

  if (calculatorState.firstOperand !== null) {
    expressionParts.push(formatDisplayNumber(calculatorState.firstOperand));
  }

  if (calculatorState.operator) {
    expressionParts.push(calculatorState.operator);
  }

  if (calculatorState.secondOperand !== null && !calculatorState.hasCalculated) {
    expressionParts.push(formatDisplayNumber(calculatorState.secondOperand));
  }

  domElements.expression.textContent = expressionParts.join(" ");
  domElements.result.textContent = calculatorState.currentInput;

  // Apply error styling if needed
  if (calculatorState.currentInput === "Error") {
    domElements.result.classList.add("error");
  } else {
    domElements.result.classList.remove("error");
  }
}

/**
 * Reset calculator state for new input
 */
function resetStateForNewInput() {
  if (checkErrorState() || calculatorState.hasCalculated) {
    calculatorState.firstOperand = null;
    calculatorState.secondOperand = null;
    calculatorState.operator = null;
    calculatorState.currentInput = "0";
    calculatorState.hasCalculated = false;
    calculatorState.isError = false;
  }
}

// ===== Operation Functions =====

/**
 * Append digit to current input
 */
function appendDigit(digit) {
  resetStateForNewInput();

  if (calculatorState.currentInput === "0") {
    calculatorState.currentInput = digit;
  } else if (calculatorState.currentInput === "-0") {
    calculatorState.currentInput = "-" + digit;
  } else {
    calculatorState.currentInput += digit;
  }

  updateDisplay();
}

/**
 * Add decimal point to current input
 */
function addDecimalPoint() {
  resetStateForNewInput();

  if (!calculatorState.currentInput.includes(".")) {
    calculatorState.currentInput += ".";
  }

  updateDisplay();
}

/**
 * Toggle sign of current input
 */
function toggleSign() {
  if (checkErrorState()) return;
  if (calculatorState.currentInput === "0" || calculatorState.currentInput === "0.") return;

  calculatorState.currentInput = calculatorState.currentInput.startsWith("-")
    ? calculatorState.currentInput.slice(1)
    : "-" + calculatorState.currentInput;

  updateDisplay();
}

/**
 * Remove last digit from input
 */
function removeLastCharacter() {
  if (checkErrorState()) return;
  if (calculatorState.hasCalculated) return;

  const { currentInput } = calculatorState;

  if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput.startsWith("-"))) {
    calculatorState.currentInput = "0";
  } else {
    calculatorState.currentInput = currentInput.slice(0, -1);
    if (calculatorState.currentInput === "-") {
      calculatorState.currentInput = "0";
    }
  }

  updateDisplay();
}

/**
 * Clear all calculator state
 */
function clearCalculator() {
  calculatorState.firstOperand = null;
  calculatorState.secondOperand = null;
  calculatorState.operator = null;
  calculatorState.currentInput = "0";
  calculatorState.hasCalculated = false;
  calculatorState.isError = false;

  updateDisplay();
}

/**
 * Select operator
 */
function selectOperator(operator) {
  if (checkErrorState()) return;

  const inputNumber = getCurrentInputAsNumber();

  // Continue from result after equals
  if (calculatorState.hasCalculated) {
    calculatorState.hasCalculated = false;
    calculatorState.secondOperand = null;
  }

  if (calculatorState.firstOperand === null) {
    calculatorState.firstOperand = inputNumber;
    calculatorState.operator = operator;
    calculatorState.currentInput = "0";
    updateDisplay();
    return;
  }

  // Chain calculations
  if (calculatorState.operator && calculatorState.currentInput !== "0") {
    calculatorState.secondOperand = inputNumber;
    const result = performCalculation(
      calculatorState.firstOperand,
      calculatorState.operator,
      calculatorState.secondOperand
    );

    if (!Number.isFinite(result)) {
      calculatorState.currentInput = "Error";
      calculatorState.isError = true;
      calculatorState.firstOperand = null;
      calculatorState.secondOperand = null;
      calculatorState.operator = null;
      updateDisplay();
      return;
    }

    calculatorState.firstOperand = result;
    calculatorState.secondOperand = null;
    calculatorState.operator = operator;
    calculatorState.currentInput = "0";
    updateDisplay();
    return;
  }

  // Allow changing operator without entering next number
  calculatorState.operator = operator;
  updateDisplay();
}

/**
 * Calculate result
 */
function calculateResult() {
  if (checkErrorState()) return;
  if (calculatorState.operator === null || calculatorState.firstOperand === null) return;

  const inputNumber = getCurrentInputAsNumber();
  const secondOperand = calculatorState.hasCalculated
    ? (calculatorState.secondOperand ?? inputNumber)
    : inputNumber;

  const result = performCalculation(
    calculatorState.firstOperand,
    calculatorState.operator,
    secondOperand
  );

  if (!Number.isFinite(result)) {
    calculatorState.currentInput = "Error";
    calculatorState.isError = true;
    calculatorState.firstOperand = null;
    calculatorState.secondOperand = null;
    calculatorState.operator = null;
    updateDisplay();
    return;
  }

  calculatorState.secondOperand = secondOperand;
  calculatorState.firstOperand = result;
  calculatorState.currentInput = formatDisplayNumber(result);
  calculatorState.hasCalculated = true;

  updateDisplay();
}

// ===== Event Handlers =====

/**
 * Handle button clicks
 */
domElements.buttonsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { dataset } = button;

  if (dataset.digit) appendDigit(dataset.digit);
  else if (dataset.op) selectOperator(dataset.op);
  else if (dataset.action === "dot") addDecimalPoint();
  else if (dataset.action === "clear") clearCalculator();
  else if (dataset.action === "backspace") removeLastCharacter();
  else if (dataset.action === "sign") toggleSign();
  else if (dataset.action === "equals") calculateResult();
});

/**
 * Handle keyboard input
 */
document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (key >= "0" && key <= "9") {
    appendDigit(key);
  } else if (key === ".") {
    addDecimalPoint();
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (key === "Backspace" || key === "Delete") {
    removeLastCharacter();
  } else if (key === "Escape") {
    clearCalculator();
  } else if (["+", "-", "*", "/"].includes(key)) {
    selectOperator(key);
  }
});

// ===== Initialize =====
clearCalculator();
