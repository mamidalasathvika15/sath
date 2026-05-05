const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// API mappin
const fetchNumbers = async (url) => {
  // MOCK DATA (for practice)
  if (url.includes("primes")) return [2, 3, 5, 7];
  if (url.includes("fibo")) return [1, 1, 2, 3, 5];
  if (url.includes("odd")) return [1, 3, 5, 7];
  if (url.includes("random")) return [4, 6, 9];

  return [];
};

// Get data with caching
const getCachedData = async (key, urls) => {
  const now = Date.now();

  if (cache[key] && now - cache[key].time < CACHE_TTL) {
    return cache[key].data;
  }

  const results = await Promise.all(urls.map(fetchNumbers));
  const merged = results.flat();

  const uniqueSorted = [...new Set(merged)].sort((a, b) => a - b);

  cache[key] = {
    data: uniqueSorted,
    time: now
  };

  return uniqueSorted;
};

// MAIN API
app.get("/numbers", async (req, res) => {
  try {
    const types = req.query.type;

    if (!types) {
      return res.status(400).json({ error: "type query is required" });
    }

    const urls = types
      .split(",")
      .map((t) => API_MAP[t])
      .filter(Boolean);

    if (urls.length === 0) {
      return res.status(400).json({ error: "invalid types" });
    }

    const numbers = await getCachedData(types, urls);

    res.json({ numbers });

  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// PREFIX API
app.get("/numbers/prefix", async (req, res) => {
  try {
    const prefix = req.query.value;

    if (!prefix) {
      return res.status(400).json({ error: "value required" });
    }

    const urls = Object.values(API_MAP);

    const numbers = await getCachedData("all", urls);

    const filtered = numbers.filter(num =>
      num.toString().startsWith(prefix)
    );

    res.json({ numbers: filtered });

  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// ROOT CHECK
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});