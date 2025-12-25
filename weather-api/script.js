"use strict";

/**
 * Modern Weather API Application
 * Refactored with improved structure, dark/light mode, and better maintainability
 */

// ===== API Configuration =====
const API_CONFIG = {
  API_KEY: "1edb07712668c112729b6fa5d5e6a812",
  GEO_URL: "https://api.openweathermap.org/geo/1.0/direct",
  WEATHER_URL: "https://api.openweathermap.org/data/2.5/weather",
  FORECAST_URL: "https://api.openweathermap.org/data/2.5/forecast",
};

// ===== DOM Elements =====
const domElements = {
  cityInput: document.getElementById("cityInput"),
  searchBtn: document.getElementById("searchBtn"),
  themeToggle: document.getElementById("themeToggle"),
  status: document.getElementById("status"),
  errorBox: document.getElementById("errorBox"),
  placeSelect: document.getElementById("placeSelect"),
  
  weatherCard: document.getElementById("weatherResult"),
  cityName: document.getElementById("cityName"),
  country: document.getElementById("country"),
  description: document.getElementById("description"),
  temp: document.getElementById("temp"),
  feelsLike: document.getElementById("feelsLike"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  
  forecastSection: document.getElementById("forecastBox"),
  forecastGrid: document.getElementById("forecastGrid"),
};

// ===== Theme Management =====

/**
 * Initialize theme from localStorage or default to dark
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem("weather_theme") || "dark";
  applyTheme(savedTheme);
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);
}

/**
 * Update theme toggle button icon
 */
function updateThemeIcon(theme) {
  domElements.themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem("weather_theme", newTheme);
}

// ===== UI Helper Functions =====

/**
 * Set loading state
 */
function setLoadingState(isLoading, message = "") {
  domElements.status.textContent = message;
  domElements.searchBtn.disabled = isLoading;
  domElements.cityInput.disabled = isLoading;
  domElements.placeSelect.disabled = isLoading;
}

/**
 * Display error message
 */
function displayError(message) {
  domElements.errorBox.textContent = message;
  domElements.errorBox.classList.remove("hidden");
}

/**
 * Clear error message
 */
function clearError() {
  domElements.errorBox.textContent = "";
  domElements.errorBox.classList.add("hidden");
}

/**
 * Hide all results
 */
function hideResults() {
  domElements.weatherCard.classList.add("hidden");
  domElements.forecastSection.classList.add("hidden");
  domElements.forecastGrid.innerHTML = "";
}

/**
 * Show/hide place select dropdown
 */
function showPlaceSelect(visible) {
  if (visible) {
    domElements.placeSelect.classList.remove("hidden");
  } else {
    domElements.placeSelect.classList.add("hidden");
    domElements.placeSelect.innerHTML = "";
  }
}

// ===== Validation =====

/**
 * Validate city input
 */
function validateCityInput(city) {
  const trimmed = city.trim();
  
  if (!trimmed) {
    return { valid: false, error: "Please enter a city or province name." };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: "Please enter at least 2 characters." };
  }
  
  const isValidFormat = /^[a-zA-ZÀ-ž\s.,'-]+$/.test(trimmed);
  if (!isValidFormat) {
    return { valid: false, error: "Please use letters and common punctuation only." };
  }
  
  return { valid: true, city: trimmed };
}

// ===== API Functions =====

/**
 * Generic fetch with error handling
 */
async function fetchFromAPI(url) {
  const response = await fetch(url);
  
  if (!response.ok) {
    let errorDetails = "";
    try {
      const data = await response.json();
      if (data?.message) errorDetails = ` (${data.message})`;
    } catch {}
    throw new Error(`Request failed: ${response.status} ${response.statusText}${errorDetails}`);
  }
  
  return response.json();
}

/**
 * Geocode city name to coordinates
 */
async function geocodeCity(city) {
  const url = `${API_CONFIG.GEO_URL}?q=${encodeURIComponent(city)}&limit=5&appid=${API_CONFIG.API_KEY}`;
  const data = await fetchFromAPI(url);
  
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Location not found. Please check spelling.");
  }
  
  return data;
}

/**
 * Fetch current weather
 */
async function fetchCurrentWeather(latitude, longitude) {
  const url = `${API_CONFIG.WEATHER_URL}?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.API_KEY}&units=metric`;
  return fetchFromAPI(url);
}

/**
 * Fetch 5-day forecast
 */
async function fetchForecast(latitude, longitude) {
  const url = `${API_CONFIG.FORECAST_URL}?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.API_KEY}&units=metric`;
  return fetchFromAPI(url);
}

// ===== Location Formatting =====

/**
 * Format location name
 */
function formatLocationName(location) {
  const state = location.state ? `, ${location.state}` : "";
  return `${location.name}${state}, ${location.country}`;
}

/**
 * Populate place select dropdown
 */
function populatePlaceSelect(locations) {
  domElements.placeSelect.innerHTML = "";
  
  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = JSON.stringify({
      latitude: location.lat,
      longitude: location.lon,
      name: location.name,
      state: location.state || "",
      country: location.country || "",
    });
    option.textContent = formatLocationName(location);
    domElements.placeSelect.appendChild(option);
  });
  
  showPlaceSelect(true);
}

/**
 * Get selected place from dropdown
 */
function getSelectedPlace() {
  return JSON.parse(domElements.placeSelect.value);
}

// ===== Weather Display =====

/**
 * Display current weather
 */
function displayCurrentWeather(weatherData, place) {
  const cityDisplayName = place?.name || weatherData.name || "Unknown";
  const stateDisplay = place?.state ? `, ${place.state}` : "";
  const countryName = place?.country || weatherData.sys?.country || "";
  
  const weatherDescription = weatherData.weather?.[0]?.description || "N/A";
  const temperature = Math.round(weatherData.main?.temp ?? 0);
  const feelsLikeTemp = Math.round(weatherData.main?.feels_like ?? 0);
  const humidityPercent = weatherData.main?.humidity ?? 0;
  const windSpeed = weatherData.wind?.speed ?? 0;
  
  domElements.cityName.textContent = `${cityDisplayName}${stateDisplay}`;
  domElements.country.textContent = countryName ? `Country: ${countryName}` : "";
  domElements.description.textContent = weatherDescription;
  domElements.temp.textContent = temperature;
  domElements.feelsLike.textContent = feelsLikeTemp;
  domElements.humidity.textContent = humidityPercent;
  domElements.wind.textContent = windSpeed;
  
  domElements.weatherCard.classList.remove("hidden");
}

// ===== Forecast Display =====

/**
 * Extract daily forecasts from 3-hourly data
 */
function extractDailyForecasts(forecastList) {
  const forecastsByDay = new Map();
  
  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().slice(0, 10);
    
    if (!forecastsByDay.has(dayKey)) {
      forecastsByDay.set(dayKey, []);
    }
    forecastsByDay.get(dayKey).push(item);
  });
  
  const dailyForecasts = [];
  const daysArray = Array.from(forecastsByDay.entries()).slice(0, 5);
  
  daysArray.forEach(([, items]) => {
    // Find forecast closest to noon
    let closestToNoon = items[0];
    let minHourDifference = Infinity;
    
    items.forEach((item) => {
      const itemDate = new Date(item.dt * 1000);
      const hourDifference = Math.abs(itemDate.getUTCHours() - 12);
      
      if (hourDifference < minHourDifference) {
        minHourDifference = hourDifference;
        closestToNoon = item;
      }
    });
    
    dailyForecasts.push(closestToNoon);
  });
  
  return dailyForecasts;
}

/**
 * Format day label from Unix timestamp
 */
function formatDayLabel(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

/**
 * Display 5-day forecast
 */
function displayForecast(forecastData) {
  const forecastList = forecastData.list || [];
  if (forecastList.length === 0) return;
  
  const dailyForecasts = extractDailyForecasts(forecastList);
  domElements.forecastGrid.innerHTML = "";
  
  dailyForecasts.forEach((forecast) => {
    const temperature = Math.round(forecast.main?.temp ?? 0);
    const description = forecast.weather?.[0]?.description || "N/A";
    const day = formatDayLabel(forecast.dt);
    
    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast-item";
    forecastCard.innerHTML = `
      <p class="forecast-date">${day}</p>
      <p class="forecast-temp">${temperature}°C</p>
      <p class="forecast-desc">${description}</p>
    `;
    
    domElements.forecastGrid.appendChild(forecastCard);
  });
  
  domElements.forecastSection.classList.remove("hidden");
}

// ===== Main Weather Fetch =====

/**
 * Fetch and display weather for selected place
 */
async function fetchWeatherForPlace(place) {
  hideResults();
  clearError();
  
  try {
    setLoadingState(true, "Loading weather...");
    
    const currentWeather = await fetchCurrentWeather(place.latitude, place.longitude);
    displayCurrentWeather(currentWeather, place);
    
    setLoadingState(true, "Loading forecast...");
    
    const forecast = await fetchForecast(place.latitude, place.longitude);
    displayForecast(forecast);
    
    setLoadingState(false, "");
  } catch (error) {
    console.error(error);
    setLoadingState(false, "");
    displayError(error.message || "Failed to fetch weather data.");
  }
}

// ===== Search Functionality =====

/**
 * Execute city search
 */
async function executeSearch() {
  clearError();
  hideResults();
  showPlaceSelect(false);
  
  const validation = validateCityInput(domElements.cityInput.value);
  
  if (!validation.valid) {
    displayError(validation.error);
    return;
  }
  
  try {
    setLoadingState(true, "Searching location...");
    
    const locations = await geocodeCity(validation.city);
    populatePlaceSelect(locations);
    
    setLoadingState(false, "");
    
    // Automatically fetch weather for first result
    await fetchWeatherForPlace(getSelectedPlace());
  } catch (error) {
    console.error(error);
    setLoadingState(false, "");
    displayError(error.message || "Failed to find location.");
  }
}

// ===== Event Listeners =====

domElements.searchBtn.addEventListener("click", executeSearch);

domElements.cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    executeSearch();
  }
});

domElements.placeSelect.addEventListener("change", () => {
  fetchWeatherForPlace(getSelectedPlace());
});

domElements.themeToggle.addEventListener("click", toggleTheme);

// ===== Initialize =====
initializeTheme();
