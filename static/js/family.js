/**
 * NutriBot — Family Planner Page JavaScript
 */

const addMemberForm      = document.getElementById('addMemberForm');
const memberCount        = document.getElementById('memberCount');
const familyEmptyState   = document.getElementById('familyEmptyState');
const familyMembersGrid  = document.getElementById('familyMembersGrid');
const generateFamilyBtn  = document.getElementById('generateFamilyPlanBtn');
const familyPlanCard     = document.getElementById('familyPlanCard');
const familyPlanLoading  = document.getElementById('familyPlanLoading');
const familyPlanOutput   = document.getElementById('familyPlanOutput');
const copyFamilyPlanBtn  = document.getElementById('copyFamilyPlanBtn');

let members = [];
let lastFamilyPlan = '';

const ROLE_EMOJIS = {
  father: '👨', mother: '👩', child: '👦', teenager: '🧑',
  grandparent: '👴', 'family member': '🙂',
};

// ──────────────────────────────────────────────
//  Load existing family members from server
// ──────────────────────────────────────────────
async function loadFamilyMembers() {
  try {
    const resp = await fetch('/api/family');
    members = await resp.json();
    renderMembers();
  } catch (e) {
    console.warn('Could not load family members:', e);
  }
}

// ──────────────────────────────────────────────
//  Add Member
// ──────────────────────────────────────────────
addMemberForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(addMemberForm);
  const data = {};
  formData.forEach((val, key) => { if (val) data[key] = val; });

  if (!data.name || !data.age) {
    showToast('Name and Age are required.', 'warning');
    return;
  }

  try {
    const resp = await fetch('/api/family/member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await resp.json();
    if (result.member) {
      members.push(result.member);
      renderMembers();
      addMemberForm.reset();
      showToast(`✅ ${result.member.name} added to family!`);
    }
  } catch (e) {
    showToast('Failed to add member.', 'error');
  }
});

// ──────────────────────────────────────────────
//  Remove Member
// ──────────────────────────────────────────────
async function removeMember(memberId) {
  try {
    const resp = await fetch(`/api/family/member/${memberId}`, { method: 'DELETE' });
    const result = await resp.json();
    members = members.filter(m => m.id !== memberId);
    renderMembers();
    showToast('Member removed.');
  } catch (e) {
    showToast('Failed to remove member.', 'error');
  }
}

// ──────────────────────────────────────────────
//  Render Members Grid
// ──────────────────────────────────────────────
function renderMembers() {
  memberCount.textContent = members.length;

  if (members.length === 0) {
    familyEmptyState.classList.remove('d-none');
    familyMembersGrid.innerHTML = '';
    return;
  }

  familyEmptyState.classList.add('d-none');

  familyMembersGrid.innerHTML = members.map(m => {
    const emoji = ROLE_EMOJIS[m.role?.toLowerCase()] || '🙂';
    const ageBadge = m.age ? `${m.age} yrs` : '';
    return `
      <div class="col-sm-6 col-md-4">
        <div class="member-card">
          <button class="member-remove-btn" onclick="removeMember(${m.id})" title="Remove">
            <i class="bi bi-x-lg"></i>
          </button>
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="member-avatar">${emoji}</div>
            <div>
              <div class="fw-bold" style="font-size:0.9rem">${escapeHtml(m.name)}</div>
              <small class="text-muted">${capitalize(m.role || 'Family member')}</small>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-1">
            ${ageBadge ? `<span class="badge bg-secondary-subtle text-secondary">${ageBadge}</span>` : ''}
            ${m.diet_type ? `<span class="badge bg-success-soft text-success">${capitalize(m.diet_type)}</span>` : ''}
            ${m.goal ? `<span class="badge bg-info-soft text-info" title="${m.goal}">${m.goal.slice(0, 15)}${m.goal.length > 15 ? '…' : ''}</span>` : ''}
            ${m.health_conditions ? `<span class="badge bg-warning-soft text-warning">${m.health_conditions.slice(0, 12)}${m.health_conditions.length > 12 ? '…' : ''}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ──────────────────────────────────────────────
//  Generate Family Plan
// ──────────────────────────────────────────────
generateFamilyBtn?.addEventListener('click', async () => {
  if (members.length === 0) {
    showToast('Please add family members first.', 'warning');
    return;
  }

  familyPlanCard.classList.remove('d-none');
  familyPlanLoading.classList.remove('d-none');
  familyPlanOutput.innerHTML = '';
  copyFamilyPlanBtn.classList.add('d-none');
  generateFamilyBtn.disabled = true;
  generateFamilyBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Generating…';

  try {
    const resp = await fetch('/api/family/plan', { method: 'POST' });
    const data = await resp.json();
    familyPlanLoading.classList.add('d-none');

    if (data.error) {
      showToast(data.error, 'error');
      familyPlanOutput.innerHTML = `<p class="text-muted">${data.error}</p>`;
      return;
    }

    lastFamilyPlan = data.plan;
    familyPlanOutput.innerHTML = renderMarkdown(data.plan);
    familyPlanOutput.classList.add('slide-up');
    copyFamilyPlanBtn.classList.remove('d-none');
    showToast('✅ Family plan generated!');

    // Scroll to plan
    familyPlanCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (e) {
    familyPlanLoading.classList.add('d-none');
    familyPlanOutput.innerHTML = '<p class="text-muted">Failed to generate plan. Please try again.</p>';
    showToast('Network error.', 'error');
  } finally {
    generateFamilyBtn.disabled = false;
    generateFamilyBtn.innerHTML = '<i class="bi bi-magic me-1"></i>Generate Family Plan';
  }
});

// ──────────────────────────────────────────────
//  Copy Plan
// ──────────────────────────────────────────────
copyFamilyPlanBtn?.addEventListener('click', () => {
  copyToClipboard(lastFamilyPlan, 'copyFamilyPlanBtn');
});

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ──────────────────────────────────────────────
//  Init
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadFamilyMembers);
