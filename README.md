
# Critique Assistant – Vercel Proxy Server

This is the secure backend for the Critique Assistant Figma plugin. It relays JSON design data to OpenAI's Assistants API without exposing the API key to the client.

---

## Features

- ✅ Fully CORS-enabled
- ✅ Handles multi-step OpenAI Assistants v2 flows:
  - Create thread
  - Send message
  - Start and poll run
  - Return JSON critique response

---

## Structure

```
/critique-assistant-proxy/
├── api/
│   └── proxy.js                # Main serverless handler
├── .env.local                  # Secret API key (not committed)
├── vercel.json (optional)     # Vercel routing rules
└── README.md
```

---

## Setup

### 1. Clone this repo

```bash
git clone https://github.com/your-org/critique-assistant-proxy.git
cd critique-assistant-proxy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your `.env.local`

Create a `.env.local` file:

```env
OPENAI_API_KEY=sk-...
```

### 4. Deploy to Vercel

```bash
vercel --prod
```

---

## Environment Variables

The only required variable is:

- `OPENAI_API_KEY` – Your OpenAI project key (used server-side only)

---

## Security

- CORS headers are added manually in `proxy.js`
- Only accepts `POST` method
- Plugin receives **no credentials** or API key

---

## License

MIT License © Homebase
