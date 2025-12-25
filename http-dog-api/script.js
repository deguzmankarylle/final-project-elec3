"use strict";

/**
 * HTTP Dog API Application
 * Modern app for exploring HTTP status codes with adorable dog images
 */

// ===== DOM Elements =====
const domElements = {
  statusInput: document.getElementById("statusInput"),
  searchBtn: document.getElementById("searchBtn"),
  randomBtn: document.getElementById("randomBtn"),
  themeToggle: document.getElementById("themeToggle"),
  statusMessage: document.getElementById("statusMessage"),
  resultSection: document.getElementById("resultSection"),
  statusCode: document.getElementById("statusCode"),
  statusName: document.getElementById("statusName"),
  statusDescription: document.getElementById("statusDescription"),
  statusCategory: document.getElementById("statusCategory"),
  statusSeverity: document.getElementById("statusSeverity"),
  dogImage: document.getElementById("dogImage"),
};

// ===== API Configuration =====
const API_BASE_URL = "https://httpstat.us";
const DOG_API_URL = "https://dog.ceo/api/breeds/image/random";

// ===== HTTP Status Information =====
const statusInfo = {
  "1xx": { category: "Informational", description: "Request received, continuing process" },
  "2xx": { category: "Success", description: "Request successfully received and processed", severity: "Good" },
  "3xx": { category: "Redirection", description: "Further action must be taken", severity: "Neutral" },
  "4xx": { category: "Client Error", description: "Request contains bad syntax or cannot be fulfilled", severity: "Warning" },
  "5xx": { category: "Server Error", description: "Server failed to fulfill valid request", severity: "Critical" },
};

// ===== Status Code Descriptions =====
const statusDescriptions = {
  200: "OK - Request succeeded",
  201: "Created - Resource created successfully",
  204: "No Content - Request succeeded with no content",
  301: "Moved Permanently - URL has moved permanently",
  304: "Not Modified - Resource not modified since last request",
  400: "Bad Request - Server cannot process the request",
  401: "Unauthorized - Authentication required",
  403: "Forbidden - Access denied",
  404: "Not Found - Resource not found",
  429: "Too Many Requests - Rate limit exceeded",
  500: "Internal Server Error - Unexpected server error",
  502: "Bad Gateway - Invalid response from upstream server",
  503: "Service Unavailable - Server temporarily unavailable",
  504: "Gateway Timeout - Upstream server timeout",
};

// ===== Theme Management =====

/**
 * Initialize theme from localStorage
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem("http_dog_theme") || "light";
  applyTheme(savedTheme);
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    domElements.themeToggle.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    domElements.themeToggle.textContent = "🌙";
  }
  localStorage.setItem("http_dog_theme", theme);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
}

// ===== HTTP Status Helpers =====

/**
 * Get category prefix (1xx, 2xx, etc.)
 */
function getCategoryPrefix(code) {
  const codeStr = String(code);
  return codeStr.charAt(0) + "xx";
}

/**
 * Get status category information
 */
function getStatusCategory(code) {
  const prefix = getCategoryPrefix(code);
  return statusInfo[prefix] || { category: "Unknown", severity: "Unknown" };
}

/**
 * Get status description
 */
function getStatusDescription(code) {
  return statusDescriptions[code] || `HTTP Status Code ${code}`;
}

/**
 * Validate HTTP status code
 */
function validateStatusCode(code) {
  const num = parseInt(code, 10);
  return !isNaN(num) && num >= 100 && num <= 599;
}

// ===== API Functions =====

/**
 * Fetch dog image for status code
 */
async function fetchDogImage(code) {
  try {
    // Fetch a random dog image from Dog API
    const response = await fetch(DOG_API_URL);
    const data = await response.json();

    if (data.status === "success") {
      displayResult(code, data.message);
    } else {
      showMessage("Unable to load dog image for this status code", "error");
      domElements.resultSection.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    showMessage("Failed to fetch dog image", "error");
    domElements.resultSection.classList.add("hidden");
  }
}

/**
 * Fetch random dog image from Dog API
 */
async function fetchRandomDog() {
  try {
    showMessage("Loading random dog...", "info");
    const response = await fetch(DOG_API_URL);
    const data = await response.json();

    if (data.status === "success") {
      displayRandomDogResult(data.message);
    } else {
      showMessage("Failed to fetch random dog", "error");
    }
  } catch (error) {
    console.error("Error fetching random dog:", error);
    showMessage("Failed to fetch random dog image", "error");
  }
}

/**
 * Display result
 */
function displayResult(code, imageUrl) {
  const statusCode = parseInt(code, 10);
  const categoryInfo = getStatusCategory(statusCode);
  const description = getStatusDescription(statusCode);

  domElements.statusCode.textContent = statusCode;
  domElements.statusName.textContent = categoryInfo.category;
  domElements.statusDescription.textContent = description;
  domElements.statusCategory.textContent = categoryInfo.category;
  domElements.statusSeverity.textContent = categoryInfo.severity || "Normal";
  domElements.dogImage.src = imageUrl;
  domElements.dogImage.alt = `HTTP ${statusCode} - ${categoryInfo.category}`;

  domElements.resultSection.classList.remove("hidden");
  showMessage(`Fetched HTTP ${statusCode} - ${categoryInfo.category}`, "success");
  
  // Scroll to result
  setTimeout(() => {
    domElements.resultSection.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

/**
 * Display random dog result
 */
function displayRandomDogResult(imageUrl) {
  const randomCode = Math.floor(Math.random() * 500) + 100;
  const categoryInfo = getStatusCategory(randomCode);

  domElements.statusCode.textContent = "🎲";
  domElements.statusName.textContent = "Random Dog";
  domElements.statusDescription.textContent = "A random cute dog just for you!";
  domElements.statusCategory.textContent = "Entertainment";
  domElements.statusSeverity.textContent = "Fun";
  domElements.dogImage.src = imageUrl;
  domElements.dogImage.alt = "Random dog image";

  domElements.resultSection.classList.remove("hidden");
  showMessage("Here's a random dog for you! 🐕", "success");
  
  // Scroll to result
  setTimeout(() => {
    domElements.resultSection.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

/**
 * Show status message
 */
function showMessage(message, type = "info") {
  domElements.statusMessage.textContent = message;
  domElements.statusMessage.style.color = 
    type === "error" ? "#ff4444" : 
    type === "success" ? "#4CAF50" : 
    "inherit";
}

// ===== Event Handlers =====

/**
 * Handle search
 */
function handleSearch() {
  const code = domElements.statusInput.value.trim();

  if (!code) {
    showMessage("Please enter a status code", "error");
    return;
  }

  if (!validateStatusCode(code)) {
    showMessage("Please enter a valid HTTP status code (100-599)", "error");
    return;
  }

  showMessage("Loading...", "info");
  fetchDogImage(code);
}

/**
 * Handle quick button click
 */
function handleQuickButton(event) {
  const code = event.target.getAttribute("data-code");
  if (code) {
    domElements.statusInput.value = code;
    handleSearch();
  }
}

// ===== Event Listeners =====

domElements.searchBtn.addEventListener("click", handleSearch);
domElements.statusInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

domElements.randomBtn.addEventListener("click", fetchRandomDog);

domElements.themeToggle.addEventListener("click", toggleTheme);

// Quick buttons
document.querySelectorAll(".quick-btn").forEach((btn) => {
  btn.addEventListener("click", handleQuickButton);
});

// ===== Initialize =====
initializeTheme();

// Set initial focus
domElements.statusInput.focus();
