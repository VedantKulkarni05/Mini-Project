const state = {
  intents: [],
  fallback:
    "I'm not quite sure about that. Could you try rephrasing or asking about admissions, courses, or fees?",
};

const chatArea = document.getElementById("chatArea");
const inputEl = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const suggestionsEl = document.getElementById("suggestions");
const emptyStateEl = document.getElementById("emptyState");
const quickTopicsEl = document.getElementById("quickTopics");

const quickTopics = [
  { title: "Admissions", subtitle: "Process & requirements", query: "Tell me about admissions" },
  { title: "Courses", subtitle: "Programs & departments", query: "What courses are offered?" },
  { title: "Fees", subtitle: "Tuition & payment info", query: "Tell me about fees" },
  { title: "Contact", subtitle: "Office & support", query: "How can I contact college?" },
];

init();

function init() {
  renderQuickTopics();
  updateGreeting();

  // Initially clear suggestions to keep the landing page clean
  renderSuggestions([]);

  loadIntents().then(() => {
    // Only show suggestions here if user already started interacting
    // or keep them hidden for a cleaner start.
  });
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = "Good morning! ";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon! ";
  if (hour >= 17) greeting = "Good evening! ";

  const titleEl = emptyStateEl.querySelector("h2");
  if (titleEl) {
    titleEl.textContent = `${greeting}How can I help you?`;
  }
}

async function loadIntents() {
  const sources = ["./data/intents.json", "./intent.json"];
  let loaded = false;

  for (const url of sources) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      state.intents = Array.isArray(data.intents) ? data.intents : [];
      if (state.intents.length) {
        loaded = true;
        break;
      }
    } catch (error) {
      // Ignore and try next source
    }
  }

  if (!loaded) {
    console.warn("Could not load helpdesk data. Using local fallbacks.");
    // Optional: Inject some hardcoded fundamental intents if fetch fails (CORS etc)
    state.intents = [
      { keywords: ["hi", "hello", "hey"], response: "Hello! I'm GESCOE-Assist. How can I help you today?", suggestion: "About College" },
      { keywords: ["courses", "degree", "branch"], response: "We offer various Engineering branches including Computer, IT, Civil, and Mechanical.", suggestion: "Degrees" }
    ];
  }
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findBestIntent(message) {
  const normalizedMessage = normalizeText(message);
  if (!normalizedMessage) return null;

  const words = normalizedMessage.split(" ");
  let bestIntent = null;
  let bestScore = 0;

  for (const intent of state.intents) {
    if (!Array.isArray(intent.keywords)) continue;

    let score = 0;
    for (const keyword of intent.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;

      if (normalizedMessage.includes(normalizedKeyword)) {
        score += 2;
      } else {
        const keyParts = normalizedKeyword.split(" ");
        const partialMatches = keyParts.filter((part) => words.includes(part)).length;
        score += partialMatches;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestScore > 0 ? bestIntent : null;
}

function getBotReply(userMessage) {
  const bestIntent = findBestIntent(userMessage);
  return bestIntent?.response || state.fallback;
}

function getSuggestions(input, limit = 5) {
  const normalizedInput = normalizeText(input);
  const ranked = [];

  for (const intent of state.intents) {
    if (!Array.isArray(intent.keywords) || !intent.keywords.length) continue;

    const suggestionText = intent.suggestion || toSuggestion(intent.keywords[0]);

    if (!normalizedInput) {
      ranked.push({ suggestion: suggestionText, score: 1 });
      continue;
    }

    let score = 0;
    for (const keyword of intent.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedKeyword.includes(normalizedInput)) score += 3;
      if (normalizedInput.includes(normalizedKeyword)) score += 2;
    }

    if (score > 0) ranked.push({ suggestion: suggestionText, score });
  }

  const unique = [];
  const seen = new Set();

  ranked
    .sort((a, b) => b.score - a.score)
    .forEach((item) => {
      if (!seen.has(item.suggestion)) {
        seen.add(item.suggestion);
        unique.push(item.suggestion);
      }
    });

  return unique.slice(0, limit);
}

function toSuggestion(keyword) {
  return keyword
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function appendMessage(sender, text) {
  if (emptyStateEl.style.display !== "none") {
    emptyStateEl.style.opacity = "0";
    setTimeout(() => { emptyStateEl.style.display = "none"; }, 300);
  }

  const row = document.createElement("div");
  row.className = `msg-row ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = `msg ${sender}`;
  bubble.textContent = text;

  const time = document.createElement("div");
  time.className = "timestamp";
  time.textContent = formatTime(new Date());

  const wrap = document.createElement("div");
  wrap.appendChild(bubble);
  wrap.appendChild(time);

  row.appendChild(wrap);
  chatArea.appendChild(row);

  scrollToBottom();
}

function renderSuggestions(suggestions) {
  suggestionsEl.innerHTML = "";
  suggestions.forEach((text) => {
    const chip = document.createElement("button");
    chip.className = "suggestion-chip";
    chip.type = "button";
    chip.textContent = text;
    chip.addEventListener("click", () => sendMessage(text));
    suggestionsEl.appendChild(chip);
  });
}

function renderQuickTopics() {
  quickTopicsEl.innerHTML = "";
  quickTopics.forEach((topic) => {
    const btn = document.createElement("button");
    btn.className = "topic-btn";
    btn.type = "button";
    btn.innerHTML = `
      <div class="topic-icon">#</div>
      <div>
        <strong>${topic.title}</strong>
        <span>${topic.subtitle}</span>
      </div>
    `;
    btn.addEventListener("click", () => sendMessage(topic.query));
    quickTopicsEl.appendChild(btn);
  });
}

function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing";
  indicator.id = "typingIndicator";
  indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  chatArea.appendChild(indicator);
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

function sendMessage(providedText) {
  const rawText = typeof providedText === "string" ? providedText : inputEl.value;
  const message = rawText.trim();

  if (!message) return;

  // Clear suggestions while bot is "thinking" or just reset them
  renderSuggestions([]);
  
  appendMessage("user", message);
  inputEl.value = "";

  showTypingIndicator();
  
  // Simulate network delay for a more "human" feel
  const delay = 600 + Math.random() * 800;
  
  setTimeout(() => {
    hideTypingIndicator();
    appendMessage("bot", getBotReply(message));
    // Restore suggestions after bot reply
    renderSuggestions(getSuggestions("", 5));
  }, delay);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function scrollToBottom() {
  chatArea.scrollTo({
    top: chatArea.scrollHeight,
    behavior: "smooth"
  });
}

sendBtn.addEventListener("click", () => sendMessage());

inputEl.addEventListener("input", (e) => {
  renderSuggestions(getSuggestions(e.target.value, 5));
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
