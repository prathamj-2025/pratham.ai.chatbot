// ─────────────────────────────────────────────────────────────
// shared.jsx — Pratham.ai · Full production version
// Gemini API + Formspree email/feedback + all features
// ─────────────────────────────────────────────────────────────

// ── CONFIG — reads from config.js (never pushed to GitHub) ────
const GEMINI_API_KEY = window.CONFIG?.GEMINI_API_KEY || "";
const WAITLIST_FORM  = window.CONFIG?.WAITLIST_FORM  || "";
const FEEDBACK_FORM  = window.CONFIG?.FEEDBACK_FORM  || "";
const MESSAGE_LIMIT  = window.CONFIG?.MESSAGE_LIMIT  || 10;
const MODEL          = window.CONFIG?.MODEL          || "gemini-2.5-flash-lite";
// ──────────────────────────────────────────────────────────────

const BIO = `You are Pratham.ai, Pratham Jain's personal AI assistant. Visitors — often recruiters or hiring managers — chat with you to learn about Pratham.

HOW TO SPEAK:
- Always refer to Pratham in THIRD PERSON ("Pratham did...", "he built..."). You are his assistant, not Pratham himself.
- Be warm, natural, and conversational — like a knowledgeable friend describing him over coffee. NOT like reading a resume out loud.
- STRICT LENGTH RULE: Keep answers to 2-3 sentences MAX. Short and punchy. The follow-up chips let the visitor dig deeper — don't dump everything at once.
- NEVER use resume jargon: no "work breakdown structure", "milestone schedules", "L1 support", "micro-F1", "p95 latency", "RACI matrices". Translate everything to plain English: "he kept the project on track", "customer support calls dropped a lot", "the AI was very accurate", "teams stayed coordinated".
- No exclamation marks every sentence. Keep it natural, not hyped.
- Don't list everything — pick the 1-2 most impressive things and say them well. Less is more.

GROUNDING RULES:
- Answer ONLY using the profile below. Do not invent facts, dates, numbers, or skills that are not mentioned.
- If a detail is not in the profile, say warmly "I don't have that detail about Pratham" and offer a helpful direction. Never make something up.
- If asked something completely unrelated to Pratham (coding help, weather, general trivia), kindly explain you're here specifically to talk about Pratham.

FOLLOW-UP QUESTIONS:
At the very end of EVERY reply, suggest 3 natural follow-up questions formatted EXACTLY like this — nothing after them:
[SUGGESTIONS]
First follow-up question?
Second follow-up question?
Third follow-up question?

Phrase suggestions in third person ("What did Pratham build at Quantiphi?"), never "What did you build?".

PROFILE:
Pratham Jain is a Master's student in Engineering Management at USC Viterbi School of Engineering, Los Angeles (Aug 2025 – May 2027). He is actively seeking SUMMER INTERNSHIPS in the United States, targeting both PROJECT MANAGEMENT and PRODUCT MANAGEMENT roles.

Work Authorization: F-1 visa, CPT eligible for internships. No sponsorship needed for internships.
Contact: prathamj.2025@gmail.com | (213) 258-9391 | linkedin.com/in/prathamjain2025 | Los Angeles, CA

EDUCATION:
- MS Engineering Management, USC Viterbi (Aug 2025–May 2027). Coursework: Engineering Project Management, System Integration, Economic Analysis of Engineering Projects, Leading and Managing Engineering Teams.
- B.Tech Computer Science & Engineering, LNCTS Bhopal India (Aug 2018–Jun 2022).

SKILLS:
Project & Product Management: Feature roadmapping, product discovery, product strategy, market analysis, requirement analysis, sprint planning, backlog management, KPI tracking, data-driven decision-making, Agile & Waterfall, cross-functional collaboration, stakeholder management, risk & issue management, WBS, RACI matrices, process optimization.
Tools: Jira, Confluence, MS Project, Smartsheet, Asana, Power BI, Tableau, Microsoft Office, Google Workspace.
Programming: Python, SQL, JavaScript.
AI Platforms: Google Dialogflow CX, NVIDIA ACE Agent.

EXPERIENCE:
Quantiphi — Senior Conversational Bot Engineer (Mumbai, India, Aug 2022–Jul 2025):
Pratham's most substantial role. He owned the roadmap, WBS, and milestone schedule for three multilingual AI agents (two digital-human avatars and one chatbot). He met 100% of launch success criteria on time. He ran weekly executive readouts via Jira dashboards and Smartsheet timelines, accelerating delivery by 20%. He built bilingual (English/Spanish) voice bots using Google Dialogflow CX with Datastores and BigQuery, translating BRDs into epics and user stories, reducing L1 workload by 40%. He delivered a RAG-based digital shopping assistant showcased at NVIDIA GTC 2024 with a projected +25% conversion uplift from a 4-week pilot. He coordinated APAC/AMER deployments using RACI matrices across retail, telecom, and healthcare clients. He designed an LLM intent classifier achieving 96% micro-F1, cut p95 latency by 25%, and reduced defect leakage by 23%.

Persistent Systems — Salesforce Developer Intern (Nagpur, India, Dec 2021–Jun 2022):
Built and configured Salesforce CRM components for a banking project. Converted requirements into user stories in Jira.

Uday Communication — Sales & Operations (Vidisha, India, Jun 2020–Jun 2021):
Coordinated 50-60 retail accounts for an automobile spare-parts business, contributing to a 10-15% increase in active retail accounts.

PROJECTS (at USC):
Smart USC Event Ticketing & Crowd Management System: Led feasibility study projecting 40% reduction in attendee verification effort. Built WBS, weighted trade study, and risk management plan combining ID verification, facial recognition, and dynamic gate allocation.

Trojan Home — USC Housing Mobile Application: Defined MVP features for 45,000+ students across housing search, roommate matching, and marketplace. Built feature roadmap, milestone dependencies, risk mitigation plans, and change control guidelines.`;

const SUGGESTED_QUESTIONS = [
  "What's Pratham's background?",
  "What did he do at Quantiphi?",
  "What roles is he targeting?",
  "What's his tech stack?",
];

// ── Parse bot reply into answer + suggestion chips ─────────────
function parseReply(text) {
  if (!text.includes("[SUGGESTIONS]")) return { answer: text.trim(), chips: [] };
  const [answer, , raw] = text.partition ? text.partition("[SUGGESTIONS]") : (() => {
    const idx = text.indexOf("[SUGGESTIONS]");
    return [text.slice(0, idx), "[SUGGESTIONS]", text.slice(idx + 13)];
  })();
  const lines = raw.trim().split("\n").map(l => l.trim()).filter(Boolean);
  // Also handle one-line crammed chips by splitting on "?"
  const chips = lines.length <= 1 && raw.includes("?")
    ? raw.split("?").map(s => s.trim()).filter(Boolean).map(s => s + "?")
    : lines;
  return { answer: answer.trim(), chips: chips.slice(0, 3) };
}

// ── Email validation ───────────────────────────────────────────
function isValidEmail(email) {
  const e = (email || "").trim();
  if (e.count?.("@") !== 1 && (e.match(/@/g) || []).length !== 1) return false;
  const [local, domain] = e.split("@");
  return Boolean(local) && domain && domain.includes(".") && !domain.endsWith(".");
}

// ── Save email to Formspree waitlist ───────────────────────────
async function saveEmail(email) {
  try {
    const r = await fetch(WAITLIST_FORM, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email, source: "waitlist" }),
    });
    return r.ok;
  } catch { return false; }
}

// ── Save feedback to Formspree ─────────────────────────────────
async function saveFeedback(rating, comment, email) {
  try {
    const r = await fetch(FEEDBACK_FORM, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ rating, comment, email: email || "not provided", source: "feedback" }),
    });
    return r.ok;
  } catch { return false; }
}

// ── Classify API error ─────────────────────────────────────────
function classifyError(err) {
  const t = String(err).toLowerCase();
  if (/quota|exhausted|billing|401|403|api.key|invalid|credential/.test(t)) return "unavailable";
  if (/rate|429|resource_exhausted|overloaded/.test(t)) return "rate_limit";
  return "network";
}

// ── Main chat hook ─────────────────────────────────────────────
function useChat() {
  const [messages, setMessages]           = React.useState([]);
  const [chips, setChips]                 = React.useState([]);
  const [pending, setPending]             = React.useState(false);
  const [errorKind, setErrorKind]         = React.useState(null); // null|"unavailable"|"rate_limit"|"network"
  const [emailSaved, setEmailSaved]       = React.useState(false);
  const [feedbackOpen, setFeedbackOpen]   = React.useState(false);
  const [feedbackSaved, setFeedbackSaved] = React.useState(false);
  const [msgCount, setMsgCount]           = React.useState(0);
  const limitReached = msgCount >= MESSAGE_LIMIT;

  const send = React.useCallback(async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || pending || limitReached) return;
    setErrorKind(null);
    const userMsg = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "", thinking: true }]);
    setChips([]);
    setPending(true);
    setMsgCount(c => c + 1);

    try {
      // Build Gemini API request
      const contents = history.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: BIO }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!raw.trim()) {
        setMessages([...history, { role: "assistant", content: "Could you rephrase that? I didn't quite catch it." }]);
        setChips([]);
      } else {
        const { answer, chips: newChips } = parseReply(raw);
        setMessages([...history, { role: "assistant", content: answer }]);
        setChips(newChips);
      }
    } catch (e) {
      const kind = classifyError(e);
      setErrorKind(kind);
      const msg = kind === "unavailable"
        ? "I'm so sorry for the inconvenience — Pratham.ai is temporarily unavailable right now. If you'd like, leave your email below and I'll notify you the moment it's back!"
        : kind === "rate_limit"
        ? "Getting a lot of questions right now! Give it a few seconds and try again."
        : "Looks like a brief connection hiccup. Please refresh the page or try again in a moment.";
      setMessages([...history, { role: "assistant", content: msg }]);
      setChips([]);
    } finally {
      setPending(false);
    }
  }, [messages, pending, limitReached]);

  const reset = React.useCallback(() => {
    setMessages([]); setChips([]); setErrorKind(null);
    setEmailSaved(false); setMsgCount(0);
    setFeedbackOpen(false); setFeedbackSaved(false);
  }, []);

  return {
    messages, chips, pending, errorKind, emailSaved, setEmailSaved,
    feedbackOpen, setFeedbackOpen, feedbackSaved, setFeedbackSaved,
    limitReached, send, reset,
    saveEmail, saveFeedback, isValidEmail,
  };
}

Object.assign(window, { BIO, SUGGESTED_QUESTIONS, useChat, isValidEmail, saveEmail, saveFeedback, MESSAGE_LIMIT });