let currentCoin = '';
const API_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

document.addEventListener('DOMContentLoaded', () => {
    const savedWallet = localStorage.getItem('brazuka_wallet');
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
        const coin = urlParams.get('coin')?.toUpperCase();
        const amt = urlParams.get('amt');
        alert(`🎉 Sucesso! ${amt} ${coin} foi enviado para sua FaucetPay!`);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (savedWallet) {
        checkUser(savedWallet);
    }
});

// FUNÇÃO DE LOGIN E DASHBOARD
async function checkUser(manualWallet = null) {
    const wallet = manualWallet || document.getElementById('user-wallet').value;
    if (!wallet || wallet.length < 5) return;

    try {
        const response = await fetch(`${API_URL}/get-user-stats?wallet=${wallet}&t=${Date.now()}`);
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('brazuka_wallet', wallet);
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('dashboard-view').style.display = 'block';
            document.getElementById('display-wallet').innerText = wallet;
            
            // Saldo total de DOGE (Shortlinks)
            const balanceEl = document.getElementById('stat-balance');
            if (balanceEl) balanceEl.innerText = (data.stats.balance || 0).toFixed(4);

            // Contadores de Claims
            document.getElementById('stat-trx').innerText = data.stats.claims_trx || 0;
            document.getElementById('stat-ton').innerText = data.stats.claims_ton || 0;

            // ANALISTA: Chama a atualização dos saldos da carteira FaucetPay aqui!
            atualizarSaldosTorneira();
        }
    } catch (e) {
        console.error("Erro ao buscar dados do Banco de Dados:", e);
    }
}

// BUSCA SALDO REAL DA SUA CONTA NA FAUCETPAY
async function atualizarSaldosTorneira() {
    const moedas = ['TRX', 'TON'];
    for (const moeda of moedas) {
        try {
            const response = await fetch(`${API_URL}/get-faucet-balance?coin=${moeda}`);
            const data = await response.json();
            const el = document.getElementById(`balance-${moeda.toLowerCase()}`);
            if (el) {
                el.innerText = parseFloat(data.balance).toFixed(4);
            }
        } catch (e) {
            console.error(`Erro ao buscar saldo de ${moeda}:`, e);
        }
    }
}

// ABRE O MODAL COM TRAVA DE TEMPO E CAPTCHA
async function openClaimModal(coin) {
    const wallet = localStorage.getItem('brazuka_wallet');
    
    try {
        const res = await fetch(`${API_URL}/check-cooldown?wallet=${wallet}&coin=${coin}`);
        const status = await res.json();
        
        if (!status.ready) {
            alert(`Muita calma, Pejotta! Volte em ${status.minutes} minutos.`);
            return;
        }
    } catch (e) {
        console.error("Erro ao checar tempo:", e);
    }

    currentCoin = coin;
    document.getElementById('modal-title').innerText = `Reivindicar ${coin.toUpperCase()}`;
    document.getElementById('claim-modal').style.display = 'block';
    
    const btn = document.getElementById('btn-finish-claim');
    btn.disabled = true;
    btn.innerText = "Aguarde o Captcha...";
    btn.style.opacity = '0.5';
    
    if (window.turnstile) turnstile.reset();
}

// CALLBACK DO TURNSTILE
function onTurnstileSuccess(token) {
    const btn = document.getElementById('btn-finish-claim');
    btn.disabled = false;
    btn.innerText = "PEGAR TOKENS";
    btn.style.cursor = 'pointer';
    btn.style.opacity = '1';
    window.turnstileToken = token;
}

function redirectToShortlink() {
    const wallet = localStorage.getItem('brazuka_wallet');
    const valores = { 'trx': 0.001, 'ton': 0.00000005 };
    const valor = valores[currentCoin];
    
    const callbackLimpo = `https://brazuka-faucets.moneynanet-yt.workers.dev/pago-faucet/${wallet}/${currentCoin}/${valor}`;
    const callbackUrl = encodeURIComponent(callbackLimpo);
    
    const API_OUO = "t2RuZtW4";
    window.location.href = `https://ouo.io/qs/${API_OUO}?s=${callbackUrl}`;
}

function closeModal() {
    document.getElementById('claim-modal').style.display = 'none';
}

function logout() {
    localStorage.removeItem('brazuka_wallet');
    location.reload();
}
