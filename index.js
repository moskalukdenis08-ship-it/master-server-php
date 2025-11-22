import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Ключі з Render Environment
const BIN_ID = "6919d96dd0ea881f40ec140f";
const API_KEY = process.env.JSONBIN_API_KEY;

app.post("/add", async (req, res) => {
    try {
        // Отримуємо дані з JSONBin
        const getResp = await axios.get(
            `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
            { headers: { "X-Master-Key": API_KEY } }
        );

        // Беремо масив servers з існуючих даних
        let servers = getResp.data.record.servers || [];

        if(servers.find(s => s.ip === req.body.ip && s.port === req.body.port))
        {
            return res.json({ ok: false, error: "Server already exists" });
        }
        
        // Додаємо новий сервер
        servers.push(req.body);
        
        // Записуємо назад у JSONBin без додаткового record
        await axios.put(
    `https://api.jsonbin.io/v3/b/${BIN_ID}`,
    { servers }, // обов'язково об’єкт з ключем "servers"
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
