# GG · Deep Sea — Personal AI site

Standalone version of design GG (the deep-blue aurora with bubbles, PM glyphs,
and a frosted-glass chat card).

## Files
- `index.html` — page shell. Loads React, Babel, the CSS keyframes, and mounts `<DirectionDeepSea />`.
- `shared.jsx` — your bio + the `useChat` hook (this is where you connect your own AI backend).
- `app.jsx` — all the GG visuals (aurora blobs, bubbles, PM glyphs, glass card, chat UI).

## Run it locally
Just open `index.html` in a browser — but because it uses `<script src>` for the JSX
files, you need a tiny local server (browsers block file:// fetches). Easiest:
```
cd gg-deepsea
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Fill in your details
Open `shared.jsx` and edit the `BIO` constant — name, role, background, contact, etc.
Also edit `SUGGESTED_QUESTIONS` for the pill prompts on the empty state.

## Connect your own Claude agent
The current chatbot calls `window.claude.complete(...)` inside `shared.jsx`. That
helper only exists inside the Claude artifact/skill runtime. For your own site, replace
the marked block in `shared.jsx` with a fetch to your backend:

```js
// inside useChat → send()
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ bio: BIO, messages: next }),
});
const { reply } = await res.json();
```

On your server (Node, Python, whatever), receive the messages, prepend `BIO`
as a system prompt, and call the Anthropic API. **Never put your API key in
the browser** — keep it on the server.

Minimal Node example:
```js
// /api/chat
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/chat", async (req, res) => {
  const { bio, messages } = req.body;
  const r = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: bio,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  });
  res.json({ reply: r.content[0].text });
});
```
