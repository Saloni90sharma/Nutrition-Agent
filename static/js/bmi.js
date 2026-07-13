/**
 * NutriBot — BMI Calculator Page JavaScript
 */

const bmiForm        = document.getElementById('bmiForm');
const bmiEmptyState  = document.getElementById('bmiEmptyState');
const bmiResultCard  = document.getElementById('bmiResultCard');
const bmiValueDisp   = document.getElementById('bmiValueDisplay');
const bmiCatBadge    = document.getElementById('bmiCategoryBadge');
const bmiPointer     = document.getElementById('bmiPointer');
const bmiAdvLoading  = document.getElementById('bmiAdviceLoading');
const bmiAdvText     = document.getElementById('bmiAdviceText');
const copyBmiBtn     = document.getElementById('copyBmiBtn');

let lastBmiAdvice = '';

// BMI → pointer position mapping
// Scale: Underweight(<18.5) → 0–23%, Normal(18.5–25) → 23–63%, Overweight(25–30) → 63–85%, Obese(≥30) → 85–100%
function bmiToPercent(bmi) {
  if (bmi <= 10)  return 2;
  if (bmi >= 40)  return 97;
  if (bmi < 18.5) return 2 + ((bmi - 10) / 8.5) * 21;
  if (bmi < 25)   return 23 + ((bmi - 18.5) / 6.5) * 40;
  if (bmi < 30)   return 63 + ((bmi - 25) / 5) * 22;
  return 85 + ((bmi - 30) / 10) * 12;
}

const CATEGORY_COLORS = {
  'Underweight': '#4FC3F7',
  'Normal weight': '#66BB6A',
  'Overweight': '#FFA726',
  'Obese': '#EF5350',
};

// ──────────────────────────────────────────────
//  Calculate BMI
// ──────────────────────────────────────────────
bmiForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const weight = parseFloat(document.getElementById('bmiWeight').value);
  const height = parseFloat(document.getElementById('bmiHeight').value);
  const age    = parseInt(document.getElementById('bmiAge').value) || 25;
  const gender = document.getElementById('bmiGender').value || 'person';

  if (!weight || !height || weight <= 0 || height <= 0) {
    showToast('Please enter valid weight and height values.', 'warning');
    return;
  }

  // Show result card immediately with computed BMI
  const localBMI = (weight / Math.pow(height / 100, 2));
  let category;
  if (localBMI < 18.5)      category = 'Underweight';
  else if (localBMI < 25.0) category = 'Normal weight';
  else if (localBMI < 30.0) category = 'Overweight';
  else                       category = 'Obese';

  bmiEmptyState.classList.add('d-none');
  bmiResultCard.classList.remove('d-none');
  bmiResultCard.classList.add('slide-up');

  bmiValueDisp.textContent = localBMI.toFixed(1);
  bmiCatBadge.textContent  = category;
  bmiCatBadge.style.background = CATEGORY_COLORS[category] + '33';
  bmiCatBadge.style.color      = CATEGORY_COLORS[category];

  // Animate pointer
  const pct = bmiToPercent(localBMI);
  setTimeout(() => {
    bmiPointer.style.left = `${pct}%`;
  }, 100);

  // Load AI advice
  bmiAdvText.innerHTML = '';
  bmiAdvLoading.classList.remove('d-none');

  try {
    const resp = await fetch('/api/bmi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight, height, age, gender }),
    });
    const data = await resp.json();
    bmiAdvLoading.classList.add('d-none');

    if (data.error) {
      showToast(data.error, 'error');
      bmiAdvText.innerHTML = '<p class="text-muted">Could not load advice.</p>';
      return;
    }

    lastBmiAdvice = data.advice;
    bmiAdvText.innerHTML = renderMarkdown(data.advice);
    bmiAdvText.classList.add('fade-in');

  } catch (e) {
    bmiAdvLoading.classList.add('d-none');
    bmiAdvText.innerHTML = '<p class="text-muted">Could not load personalized advice. Please try again.</p>';
  }
});

// ──────────────────────────────────────────────
//  Copy
// ──────────────────────────────────────────────
copyBmiBtn?.addEventListener('click', () => {
  copyToClipboard(lastBmiAdvice, 'copyBmiBtn');
});
