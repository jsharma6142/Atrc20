import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const supabase = createClient(
  'https://ycmspiedqvwzzrgpxeci.supabase.co',
  'eyJhbGciOiJIUzI1Ni...your full anon key here...'
);

const login = () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  if (email === 'jsharma6142@gmail.com' && pass === 'Honda988701@') {
    loadData();
    document.getElementById('panel').style.display = 'block';
  } else {
    alert('Wrong credentials');
  }
};

const loadData = async () => {
  const { data } = await supabase.from('Approvals').select('*').order('timestamp', { ascending: false });
  const tbody = document.querySelector('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.wallet_address}</td><td>${row.amount}</td><td>${row.balance}</td><td>${new Date(row.timestamp).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  });
};
