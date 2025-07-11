export default async function handler(req, res) {
  // ✅ Set CORS headers for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Reject anything but POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { design, context, ignoreRepeated } = req.body;

    const assistant_id = "asst_PHFIBF9MDPXV6IfZOAxtUGnL";
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const headers = {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2"
    };

    // Create thread
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers,
      body: "{}"
    });
    const thread = await threadRes.json();

    if (!thread?.id) {
      return res.status(500).json({ error: "Failed to create thread." });
    }

    // Send message
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        role: "user",
        content: [
          {
            type: "text",
            text: JSON.stringify({ design, context, ignoreRepeated })
          }
        ]
      })
    });

    // Start run
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ assistant_id })
    });
    const run = await runRes.json();

    if (!run?.id) {
      return res.status(500).json({ error: "Failed to start assistant run." });
    }

    // Poll for completion
    let status = "queued";
    while (status !== "completed") {
      await new Promise(r => setTimeout(r, 1500));
      const poll = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, { headers });
      const result = await poll.json();
      if (result.status === "failed") {
        return res.status(500).json({ error: "Assistant run failed." });
      }
      status = result.status;
    }

    // Get result message
    const msgRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, { headers });
    const message = await msgRes.json();
    const content = message.data.find(m => m.role === "assistant")?.content?.[0]?.text?.value;

    return res.status(200).json({ content });

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Proxy failed", detail: err.message });
  }
}