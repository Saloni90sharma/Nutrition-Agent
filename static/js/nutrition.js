/**
 * NutriBot — Nutrition Analyzer Page JavaScript
 */

const foodInput     = document.getElementById('foodInput');
const analyzeBtn    = document.getElementById('analyzeBtn');
const emptyState    = document.getElementById('nutritionEmptyState');
const loadingState  = document.getElementById('nutritionLoading');
const resultsDiv    = document.getElementById('nutritionResults');
const macroBarsDiv  = document.getElementById('macroBars');
const analysisText  = document.getElementById('analysisText');
const copyBtn       = document.getElementById('copyAnalysisBtn');

let lastAnalysisText = '';

// ──────────────────────────────────────────────
//  Meal Presets
// ──────────────────────────────────────────────
document.querySelectorAll('.meal-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    foodInput.value = btn.dataset.meal;
    document.querySelectorAll('.meal-preset').forEach(b => b.classList.remove('active', 'btn-secondary'));
    btn.classList.add('active', 'btn-secondary');
  });
});

// ──────────────────────────────────────────────
//  Analyze
// ──────────────────────────────────────────────
analyzeBtn?.addEventListener('click', runAnalysis);
foodInput?.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') runAnalysis();
});

async function runAnalysis() {
  const items = foodInput.value.trim();
  if (!items) {
    showToast('Please enter food items to analyze.', 'warning');
    foodInput.focus();
    return;
  }

  // Show loading
  emptyState.classList.add('d-none');
  resultsDiv.classList.add('d-none');
  loadingState.classList.remove('d-none');
  copyBtn.classList.add('d-none');
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Analyzing…';

  try {
    const resp = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_items: items }),
    });
    const data = await resp.json();

    loadingState.classList.add('d-none');

    if (data.error) {
      emptyState.classList.remove('d-none');
      showToast(data.error, 'error');
      return;
    }

    lastAnalysisText = data.analysis;

    // Render macro bars (extract if possible, else use defaults)
    renderMacroBars(data.analysis);

    // Render analysis text
    analysisText.innerHTML = renderMarkdown(data.analysis);

    resultsDiv.classList.remove('d-none');
    resultsDiv.classList.add('fade-in');
    copyBtn.classList.remove('d-none');

  } catch (e) {
    loadingState.classList.add('d-none');
    emptyState.classList.remove('d-none');
    showToast('Network error. Please try again.', 'error');
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="bi bi-bar-chart-fill me-2"></i>Analyze Nutrition';
  }
}

// ──────────────────────────────────────────────
//  Macro Bars
// ──────────────────────────────────────────────
function renderMacroBars(text) {
  // Extract rough macro numbers from text using regex heuristics
  const calMatch  = text.match(/(\d{3,4})\s*(?:kcal|calories|cal)/i);
  const protMatch = text.match(/protein[:\s]+(\d+(?:\.\d+)?)\s*g/i);
  const carbMatch = text.match(/carb(?:ohydrate)?s?[:\s]+(\d+(?:\.\d+)?)\s*g/i);
  const fatMatch  = text.match(/fat[:\s]+(\d+(?:\.\d+)?)\s*g/i);
  const fibMatch  = text.match(/fiber[:\s]+(\d+(?:\.\d+)?)\s*g/i);

  const cals  = calMatch  ? parseInt(calMatch[1])    : null;
  const prot  = protMatch ? parseFloat(protMatch[1]) : null;
  const carbs = carbMatch ? parseFloat(carbMatch[1]) : null;
  const fat   = fatMatch  ? parseFloat(fatMatch[1])  : null;
  const fib   = fibMatch  ? parseFloat(fibMatch[1])  : null;

  if (!cals && !prot && !carbs && !fat) {
    macroBarsDiv.innerHTML = '';
    return;
  }

  const macros = [
    { label: 'Calories',      val: cals,  max: 2500, unit: 'kcal', color: '#f59e0b' },
    { label: 'Protein',       val: prot,  max: 60,   unit: 'g',    color: '#3b82f6' },
    { label: 'Carbohydrates', val: carbs, max: 130,  unit: 'g',    color: '#8b5cf6' },
    { label: 'Fat',           val: fat,   max: 65,   unit: 'g',    color: '#ef4444' },
    { label: 'Fiber',         val: fib,   max: 30,   unit: 'g',    color: '#22c55e' },
  ].filter(m => m.val !== null);

  macroBarsDiv.innerHTML = macros.map(m => {
    const pct = Math.min(100, Math.round((m.val / m.max) * 100));
    return `
      <div class="macro-bar-item">
        <div class="macro-bar-label">
          <span>${m.label}</span>
          <span class="fw-semibold">${m.val} ${m.unit}</span>
        </div>
        <div class="macro-bar-track">
          <div class="macro-bar-fill" style="width:${pct}%;background:${m.color}"
               data-target="${pct}"></div>
        </div>
      </div>
    `;
  }).join('');

  // Animate bars
  requestAnimationFrame(() => {
    document.querySelectorAll('.macro-bar-fill').forEach(bar => {
      bar.style.transition = 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });
}

// ──────────────────────────────────────────────
//  Copy
// ──────────────────────────────────────────────
copyBtn?.addEventListener('click', () => {
  copyToClipboard(lastAnalysisText, 'copyAnalysisBtn');
});
