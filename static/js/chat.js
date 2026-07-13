/**
 * NutriBot — Chat Page JavaScript
 * Handles: sending messages, rendering, streaming feel
 */

const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const sendBtn      = document.getElementById('sendBtn');
const typingInd    = document.getElementById('typingIndicator');
const clearBtn     = document.getElementById('clearChatBtn');

let isSending = false;

// ──────────────────────────────────────────────
//  Send Message
// ──────────────────────────────────────────────
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isSending) return;

  isSending = true;
  sendBtn.disabled = true;
  chatInput.value = '';
  chatInput.style.height = 'auto';
  updateCharCount(chatInput);

  // Append user bubble
  appendMessage('user', text);
  scrollToBottom();

  // Show typing indicator
  typingInd.classList.remove('d-none');
  scrollToBottom();

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    typingInd.classList.add('d-none');

    if (!resp.ok) {
      const err = await resp.json();
      appendMessage('assistant', `⚠️ ${err.error || 'Something went wrong.'}`);
    } else {
      const data = await resp.json();
      appendMessage('assistant', data.reply, true);
    }
  } catch (e) {
    typingInd.classList.add('d-none');
    appendMessage('assistant', '⚠️ Network error. Please check your connection and try again.');
  } finally {
    isSending = false;
    sendBtn.disabled = false;
    chatInput.focus();
    scrollToBottom();
  }
}

// ──────────────────────────────────────────────
//  Append Message to DOM
// ──────────────────────────────────────────────
function appendMessage(role, content, useMarkdown = false) {
  const isAssistant = role === 'assistant';
  const div = document.createElement('div');
  div.className = `message ${isAssistant ? 'assistant-message' : 'user-message'}`;

  const renderedContent = useMarkdown ? renderMarkdown(content) : escapeHtml(content);

  div.innerHTML = `
    <div class="message-avatar">${isAssistant ? '🤖' : '👤'}</div>
    <div class="message-content">
      <div class="message-bubble">${renderedContent}</div>
      <div class="message-time">${timeString()}</div>
    </div>
  `;

  // Insert before the end anchor
  const anchor = document.getElementById('messagesEnd');
  if (anchor) chatMessages.insertBefore(div, anchor);
  else chatMessages.appendChild(div);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

function scrollToBottom() {
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 50);
}

// ──────────────────────────────────────────────
//  Clear Chat
// ──────────────────────────────────────────────
clearBtn?.addEventListener('click', async () => {
  if (!confirm('Clear all chat history?')) return;
  try {
    await fetch('/api/chat/clear', { method: 'POST' });
    // Remove all dynamic messages (keep welcome)
    const allMsgs = chatMessages.querySelectorAll('.message:not(#welcomeMsg)');
    allMsgs.forEach(m => m.remove());
    showToast('Chat history cleared.');
  } catch (e) {
    showToast('Failed to clear history.', 'error');
  }
});

// ──────────────────────────────────────────────
//  Input Event Listeners
// ──────────────────────────────────────────────
chatInput?.addEventListener('input', () => {
  autoResize(chatInput);
  updateCharCount(chatInput);
});

chatInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn?.addEventListener('click', sendMessage);

// ──────────────────────────────────────────────
//  Init
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  chatInput?.focus();
  scrollToBottom();
});
