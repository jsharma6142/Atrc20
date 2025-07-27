const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Root route to confirm backend is live
app.get("/", (req, res) => {
  res.json({ status: "Backend live" });
});

// ✅ Route: Log Approval (from frontend)
app.post("/log-approval", async (req, res) => {
  try {
    const { wallet_address, amount, balance } = req.body;

    const { data, error } = await supabase.from("Approvals").insert([
      {
        wallet_address,
        amount,
        balance,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Backend is running on port ${PORT}`);
});
