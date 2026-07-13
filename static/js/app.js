/**
 * NutriBot — Core App JavaScript
 * Handles: dark mode, profile, quick prompts, toast notifications
 */

// ──────────────────────────────────────────────
//  Dark Mode
// ──────────────────────────────────────────────
const THEME_KEY = 'nutribot_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const icon = theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill';
  document.querySelectorAll('#themeToggle i, #themeToggleMobile i').forEach(el => {
    el.className = `bi ${icon}`;
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Initialize theme
(function () {
  const saved = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);
})();

document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
document.getElementById('themeToggleMobile')?.addEventListener('click', toggleTheme);

// ──────────────────────────────────────────────
//  Toast Notifications
// ──────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('notifToast');
  const msg   = document.getElementById('toastMsg');
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.className = `toast align-items-center border-0 text-white bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'}`;
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
}

// ──────────────────────────────────────────────
//  Profile Management
// ──────────────────────────────────────────────
async function loadProfile() {
  try {
    const resp = await fetch('/api/profile');
    const profile = await resp.json();
    populateProfileUI(profile);
    populateProfileForm(profile);
  } catch (e) {
    console.warn('Could not load profile:', e);
  }
}

function populateProfileUI(profile) {
  const nameEl  = document.getElementById('profileName');
  const goalEl  = document.getElementById('profileGoal');
  const bmiEl   = document.getElementById('statBMI');
  const calsEl  = document.getElementById('statCals');
  const dietEl  = document.getElementById('statDiet');

  if (nameEl && profile.name)  nameEl.textContent = profile.name;
  if (goalEl && profile.goal)  goalEl.textContent = profile.goal;

  // Calculate estimated calories
  if (calsEl && profile.weight && profile.height && profile.age) {
    const cals = estimateCalories(profile);
    if (cals) calsEl.textContent = cals.toLocaleString();
  }
  if (dietEl && profile.diet_type) dietEl.textContent = capitalize(profile.diet_type);

  // BMI
  if (bmiEl && profile.weight && profile.height) {
    const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
    bmiEl.textContent = bmi;
  }
}

function populateProfileForm(profile) {
  const form = document.getElementById('profileForm');
  if (!form || !profile) return;
  Object.entries(profile).forEach(([key, val]) => {
    const el = form.querySelector(`[name="${key}"]`);
    if (el) el.value = val;
  });
}

function estimateCalories(profile) {
  const w = parseFloat(profile.weight);
  const h = parseFloat(profile.height);
  const a = parseInt(profile.age);
  if (!w || !h || !a) return null;

  // Mifflin-St Jeor
  let bmr = profile.gender === 'female'
    ? (10 * w) + (6.25 * h) - (5 * a) - 161
    : (10 * w) + (6.25 * h) - (5 * a) + 5;

  const activityFactors = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, 'very active': 1.9
  };
  const factor = activityFactors[profile.activity_level] || 1.55;
  let tdee = Math.round(bmr * factor);

  if (profile.goal === 'weight loss')  tdee -= 400;
  if (profile.goal === 'weight gain')  tdee += 400;
  if (profile.goal === 'muscle building') tdee += 250;

  return tdee;
}

// Profile Save
document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
  const form = document.getElementById('profileForm');
  const data = {};
  new FormData(form).forEach((val, key) => { if (val) data[key] = val; });

  try {
    const resp = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await resp.json();
    if (result.profile) {
      populateProfileUI(result.profile);
      bootstrap.Modal.getInstance(document.getElementById('profileModal'))?.hide();
      showToast('Profile saved! NutriBot will personalize advice for you. 🥗');
    }
  } catch (e) {
    showToast('Failed to save profile. Please try again.', 'error');
  }
});

// ──────────────────────────────────────────────
//  Quick Prompts (Sidebar)
// ──────────────────────────────────────────────
async function loadQuickPrompts() {
  const container = document.getElementById('quickPromptsContainer');
  if (!container) return;
  try {
    const resp = await fetch('/api/quick-prompts');
    const prompts = await resp.json();
    container.innerHTML = prompts.slice(0, 5).map(p => `
      <button class="quick-prompt-btn text-truncate" title="${p}"
              onclick="insertPrompt('${p.replace(/'/g, "\\'")}')">
        ${p}
      </button>
    `).join('');
  } catch (e) { /* silently fail */ }
}

// ──────────────────────────────────────────────
//  Sidebar Toggle (Mobile)
// ──────────────────────────────────────────────
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('chatSidebar')?.classList.toggle('open');
});

// ──────────────────────────────────────────────
//  Utility Helpers
// ──────────────────────────────────────────────
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function timeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function copyToClipboard(text, btnId) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard! 📋');
    const btn = document.getElementById(btnId);
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check-lg"></i>';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }
  }).catch(() => showToast('Could not copy text.', 'error'));
}

function renderMarkdown(text) {
  if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true, gfm: true });
    return marked.parse(text);
  }
  // Simple fallback if marked is not loaded
  return text.replace(/\n/g, '<br>');
}

// ──────────────────────────────────────────────
//  Auto-resize Textarea
// ──────────────────────────────────────────────
function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// ──────────────────────────────────────────────
//  Global insertPrompt (called from hint chips, quick prompts)
// ──────────────────────────────────────────────
function insertPrompt(text) {
  const input = document.getElementById('chatInput');
  if (!input) return;
  input.value = text;
  input.focus();
  autoResize(input);
  updateCharCount(input);
  // Close mobile sidebar
  document.getElementById('chatSidebar')?.classList.remove('open');
}

function updateCharCount(textarea) {
  const counter = document.getElementById('charCount');
  if (counter) counter.textContent = `${textarea.value.length}/1000`;
}

// ──────────────────────────────────────────────
//  Bootstrap tooltips init
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadQuickPrompts();

  // Init Bootstrap tooltips
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    new bootstrap.Tooltip(el, { trigger: 'hover' });
  });
});
