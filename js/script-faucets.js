let currentCoin = '';
const API_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const savedWallet = localStorage.getItem('brazuka_wallet');
    if (savedWallet) {
        document.getElementById('user-wallet').value = savedWallet;
        checkUser(savedWallet);
    }
});

async function checkUser(manualWallet = null) {
    const wallet = manualWallet || document.getElementById('user-wallet').value;
    if (wallet.length < 5) return alert("E-mail inválido");

    try {
        const res = await fetch(`${API_URL}/get-user-stats?wallet=${wallet}`);
        const data = await res.json();
        
        localStorage.setItem('brazuka_wallet', wallet);
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-view').style.display = 'block';
        document.getElementById('display-wallet').innerText = wallet;
        
        // Atualiza stats de Faucets (precisaremos criar essas chaves no Worker)
        document.getElementById('stat-trx').innerText = data.stats.claims_trx || 0;
        document.getElementById('stat-ton').innerText = data.stats.claims_ton || 0;
        
        atualizarSaldos();
    } catch (e) { console.error(e); }
}

function openClaimModal(coin) {
    currentCoin = coin;
    document.getElementById('modal-title').innerText = `Reivindicar ${coin.toUpperCase()}`;
    document.getElementById('claim-modal').style.display = 'block';
    
    // Simula validação do Captcha (depois integramos o código real do Turnstile)
    setTimeout(() => {
        const btn = document.getElementById('btn-finish-claim');
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1';
    }, 3000); 
}

function redirectToShortlink() {
    const wallet = localStorage.getItem('brazuka_wallet');
    const precos = { 'trx': 0.001, 'ton': 0.00000005 };
    const valor = precos[currentCoin];
    const API_OUO = "t2RuZtW4"; // Sua key do Ouo

    // URL de retorno com os dados para o Worker processar
    const callback = encodeURIComponent(`https://brazuka-faucets.moneynanet-yt.workers.dev/success-faucet?wallet=${wallet}&coin=${currentCoin}&amount=${valor}`);
    
    window.location.href = `https://ouo.io/qs/${API_OUO}?s=${callback}`;
}

function closeModal() { document.getElementById('claim-modal').style.display = 'none'; }
function logout() { localStorage.removeItem('brazuka_wallet'); location.reload(); }
