import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static("public"));

// Load Mega GTO data
const kbPath = path.join(__dirname, "data", "megagto-kb.txt");
const companyData = fs.readFileSync(kbPath, "utf-8");

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message || "";

    const systemPrompt = `
You are Mega GTO AI, a helpful assistant for Mega GTO Int’l Cargo Ltd and also a general knowledge assistant.
If the user asks about Mega GTO, use this company information:
${companyData}
Otherwise, answer generally like ChatGPT.
`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI request failed" });
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Mega GTO AI running on port ${process.env.PORT || 5000}`);
});
