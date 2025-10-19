import express from "express";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const SEND_EMAILS = process.env.SEND_EMAILS === "true";

let transporter = null;
if (SEND_EMAILS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendDiscordMessage(content) {
  if (!DISCORD_WEBHOOK) return;
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch (err) {
    console.error("Erreur Discord:", err);
  }
}

async function sendEmail(subject, html) {
  if (!SEND_EMAILS || !transporter) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject,
      html,
    });
  } catch (err) {
    console.error("Erreur Email:", err);
  }
}

app.post("/notify", async (req, res) => {
  const log = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const time = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

  const message = `
**Event:** ${log.event}
**User:** ${log.email || "N/A"}
**IP:** ${log.ip || ip}
**User-Agent:** ${log.userAgent || "N/A"}
**Méthode:** ${log.method || "N/A"}
**Durée:** ${log.durationMs || "N/A"} ms
**Heure:** ${time}
${log.note ? `**Note:** ${log.note}` : ""}
  `;

  await sendDiscordMessage(message);

  const html = `
    <h2>📋 Alerte - ${log.event}</h2>
    <ul>
      <li><strong>Utilisateur:</strong> ${log.email || "N/A"}</li>
      <li><strong>IP:</strong> ${log.ip || ip}</li>
      <li><strong>Heure:</strong> ${time}</li>
      <li><strong>Méthode:</strong> ${log.method || "N/A"}</li>
      <li><strong>Durée:</strong> ${log.durationMs || "N/A"} ms</li>
      ${log.note ? `<li><strong>Note:</strong> ${log.note}</li>` : ""}
    </ul>
  `;
  await sendEmail(`Alerte accès - ${log.event}`, html);

  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.send("✅ Notifier en ligne !");
});

app.listen(PORT, () => console.log(`🚀 Notifier running on port ${PORT}`));
