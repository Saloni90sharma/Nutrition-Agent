/**
 * NutriBot — Meal Plan Page JavaScript
 */

const mealPlanForm   = document.getElementById('mealPlanForm');
const generateBtn    = document.getElementById('generatePlanBtn');
const planEmptyState = document.getElementById('planEmptyState');
const planLoading    = document.getElementById('planLoading');
const planOutput     = document.getElementById('planOutput');
const copyPlanBtn    = document.getElementById('copyPlanBtn');

let lastPlanText = '';

// ──────────────────────────────────────────────
//  Generate Plan
// ──────────────────────────────────────────────
mealPlanForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  await generatePlan();
});

async function generatePlan() {
  const formData = new FormData(mealPlanForm);
  const profile  = {};
  formData.forEach((val, key) => { if (val) profile[key] = val; });

  if (!profile.goal && !profile.diet_type) {
    showToast('Please fill in at least your goal and diet type.', 'warning');
    return;
  }

  // Show loading
  planEmptyState.classList.add('d-none');
  planOutput.classList.add('d-none');
  planLoading.classList.remove('d-none');
  copyPlanBtn.classList.add('d-none');
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating…';

  try {
    const resp = await fetch('/api/meal-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const data = await resp.json();

    planLoading.classList.add('d-none');

    if (data.error) {
      planEmptyState.classList.remove('d-none');
      showToast(data.error, 'error');
      return;
    }

    lastPlanText = data.plan;
    planOutput.innerHTML = renderMarkdown(data.plan);
    planOutput.classList.remove('d-none');
    planOutput.classList.add('slide-up');
    copyPlanBtn.classList.remove('d-none');

    showToast('✅ Your 7-day meal plan is ready!');

  } catch (e) {
    planLoading.classList.add('d-none');
    planEmptyState.classList.remove('d-none');
    showToast('Network error. Please try again.', 'error');
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="bi bi-magic me-2"></i>Generate 7-Day Plan';
  }
}

// ──────────────────────────────────────────────
//  Copy Plan
// ──────────────────────────────────────────────
copyPlanBtn?.addEventListener('click', () => {
  copyToClipboard(lastPlanText, 'copyPlanBtn');
});
