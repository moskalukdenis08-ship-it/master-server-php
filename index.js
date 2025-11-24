import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Ключі з Render Environment
const BIN_ID = "6919d96dd0ea881f40ec140f";
const API_KEY = process.env.JSONBIN_API_KEY;

app.post("/ping", async (req, res) => {
    try {
        const { ip, port, players } = req.body;

        const getResp = await axios.get(
            `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
            { headers: { "X-Master-Key": API_KEY } }
        );

        let servers = getResp.data.record.servers || [];

        const srv = servers.find(s => s.ip === ip && s.port === port);

        if (!srv) {
            return res.json({ ok: false, error: "Server not found" });
        }

        srv.lastPing = Date.now();
        if (players !== undefined) srv.players = players;

        await axios.put(
            `https://api.jsonbin.io/v3/b/${BIN_ID}`,
            { servers },
            { headers: { "X-Master-Key": API_KEY } }
        );

        res.json({ ok: true });

    } catch (err) {
        console.error(err.response?.data || err);
        res.json({ ok: false, error: err.message });
    }
});


app.get("/ping", async (req, res) => {
    try {
        const getReq = await axios.get(
            `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
            { headers: { "X-Master-Key": API_KEY } }   // ← тут виправлено
        );

        let servers = getReq.data.record.servers || [];

        const now = Date.now();
        const TIMEOUT = 3 * 60 * 1000;

        servers = servers.filter(s => {
        if (s.lastPing === undefined) return true; // 🔥 не видаляємо тестові сервери

        return now - s.lastPing <= TIMEOUT;
        });


        await axios.put(
            `https://api.jsonbin.io/v3/b/${BIN_ID}`,
            { servers },
            { headers: { "X-Master-Key": API_KEY } }   // ← тут виправлено
        );

        res.json({ ok: true });

    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});


app.post("/add", async (req, res) => {
    try { 
        const bannedWords = [
            "fuck",
            "shit",
            "bitch",
            "nigger",
            "hitler",
            "root"
        ];

        const nameLower = req.body.name.toLowerCase();

        for (const bad of bannedWords) {
            if (nameLower.includes(bad)) {
                return res.json({
                    ok: false,
                    error: `Server name contains forbidden word: ${bad}`
                });
            }
        }

        
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
        if(servers.find(s => s.name === req.body.name))
        {
            return res.json({ ok: false, error: "Server with that name already exists"});
        }
        
 function isLocalIp(ip) {
    return ip.startsWith("10.") ||
           ip.startsWith("192.168.") ||
           ip.startsWith("127.") || // localhost
           (ip.startsWith("172.") && is172Local(ip));
}

function is172Local(ip) {
    const parts = ip.split(".");
    if (parts.length < 2) return false;
    const second = Number(parts[1]);
    return second >= 16 && second <= 31;
}
        
        req.body.isLocal = isLocalIp(req.body.ip);
        
        req.body.lastPing = Date.now();
        
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
