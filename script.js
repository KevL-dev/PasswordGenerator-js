"use strict";

const lengthSlider = document.getElementById("length-slider");
const lengthValue = document.getElementById("length-value");
const passwordDisplay = document.getElementById("password-display");
const statusEl = document.getElementById("status");
const selectionHint = document.getElementById("selection-hint");

const generateBtn = document.getElementById("generate-btn");
const refreshBtn = document.getElementById("refresh-btn");
const copyBtn = document.getElementById("copy-btn");

const uppercaseCb = document.getElementById("uppercase");
const lowercaseCb = document.getElementById("lowercase");
const numbersCb = document.getElementById("numbers");
const symbolsCb = document.getElementById("symbols");

const themeToggle = document.getElementById("theme-toggle");

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  number: "0123456789",
  symbol: "!@#$%^&*()_+[]{}|;:,.<>?",
};

const DEFAULT_PLACEHOLDER = `Click "Generate Password" to create a password`;

function setStatus(message) {
  statusEl.textContent = message;
}

function hasSelection() {
  return (
    uppercaseCb.checked ||
    lowercaseCb.checked ||
    numbersCb.checked ||
    symbolsCb.checked
  );
}

function updateSelectionUI() {
  const ok = hasSelection();
  selectionHint.hidden = ok;
  generateBtn.disabled = !ok;
  refreshBtn.disabled = !ok;
}

function getSecureRandomInt(maxExclusive) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % maxExclusive;
}

function pickRandomChar(chars) {
  return chars[getSecureRandomInt(chars.length)];
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildPool() {
  const enabled = [];
  if (uppercaseCb.checked) enabled.push(CHARSETS.upper);
  if (lowercaseCb.checked) enabled.push(CHARSETS.lower);
  if (numbersCb.checked) enabled.push(CHARSETS.number);
  if (symbolsCb.checked) enabled.push(CHARSETS.symbol);

  return enabled;
}

function generatePassword() {
  if (!hasSelection()) {
    setStatus("Select at least one character type.");
    passwordDisplay.textContent = DEFAULT_PLACEHOLDER;
    return;
  }

  const length = Number(lengthSlider.value);
  const enabledSets = buildPool();

  const result = [];

  for (const set of enabledSets) {
    result.push(pickRandomChar(set));
  }

  const combinedPool = enabledSets.join("");
  while (result.length < length) {
    result.push(pickRandomChar(combinedPool));
  }

  shuffleArray(result);

  const password = result.join("");
  passwordDisplay.textContent = password;
  setStatus("Password generated.");
}

async function copyPassword() {
  const password = passwordDisplay.textContent.trim();

  if (!password || password === DEFAULT_PLACEHOLDER) return;

  try {
    await navigator.clipboard.writeText(password);
    setStatus("Copied to clipboard.");
  } catch {
    try {
      const temp = document.createElement("textarea");
      temp.value = password;
      temp.setAttribute("readonly", "");
      temp.style.position = "absolute";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Failed to copy.");
    }
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const icon = themeToggle.querySelector("i");
  if (theme === "dark") {
    icon.className = "bx bx-sun";
    themeToggle.setAttribute("aria-label", "Switch to light mode");
  } else {
    icon.className = "bx bx-moon";
    themeToggle.setAttribute("aria-label", "Switch to dark mode");
  }
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    applyTheme(saved);
    return;
  }

  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)",
  ).matches;
  applyTheme(prefersDark ? "dark" : "light");
}

lengthSlider.addEventListener("input", () => {
  lengthValue.textContent = lengthSlider.value;
});

[uppercaseCb, lowercaseCb, numbersCb, symbolsCb].forEach((el) => {
  el.addEventListener("change", updateSelectionUI);
});

generateBtn.addEventListener("click", generatePassword);
refreshBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);

themeToggle.addEventListener("click", () => {
  const current =
    document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(current === "dark" ? "light" : "dark");
});

initTheme();
updateSelectionUI();
setStatus("");
