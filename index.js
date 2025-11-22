import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔑 ТВОЇ ДАНІ JSONBIN
const BIN_ID = "<<<your-bin-id>>>";      // наприклад: "66df29aeacd3cb34a8f1ddf1"
const API_KEY = "<<<your-api-key>>>";    // секретний ключ JSONBin

// Додати сервер у JSONBin
app.post("/add", async (req, res) => {
    try {
        // Отримуємо поточні дані з JSONBin
        const getResp = await axios.get(
            `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
            {
                headers: { "X-Master-Key": API_KEY }
            }
        );

        let servers = getResp.data.record.servers;

        // Додаємо новий
        servers.push(req.body);

        // Записуємо назад у JSONBin
        await axios.put(
            `https://api.jsonbin.io/v3/b/${BIN_ID}`,
            { servers },
            {
                headers: {
                    "X-Master-Key": API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ ok: true });

    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({ error: "Failed to update JSONBin" });
    }
});

// Render PORT
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
