let currentCoin = '';
const API_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

document.addEventListener('DOMContentLoaded', () => {
    const savedWallet = localStorage.getItem('brazuka_wallet');
    
    // Verifica se veio de um pagamento com sucesso
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

async function checkUser(manualWallet = null) {
    const wallet = manualWallet || document.getElementById('user-wallet').value;
    if (!wallet || wallet.length < 5) return alert("Digite um e-mail válido!");

    try {
        const response = await fetch(`${API_URL}/get-user-stats?wallet=${wallet}&t=${Date.now()}`);
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('brazuka_wallet', wallet);
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('dashboard-view').style.display = 'block';
            document.getElementById('display-wallet').innerText = wallet;
            
            // Atualiza contadores de claims vindos do Banco de Dados
            document.getElementById('stat-trx').innerText = data.stats.claims_trx || 0;
            document.getElementById('stat-ton').innerText = data.stats.claims_ton || 0;
        }
    } catch (e) {
        console.error("Erro ao logar:", e);
    }
}

async function openClaimModal(coin) {
    const wallet = localStorage.getItem('brazuka_wallet');
    
    // ANALISTA: Verifica cooldown de 20 min no Worker antes de abrir o modal
    try {
        const res = await fetch(`${API_URL}/check-cooldown?wallet=${wallet}&coin=${coin}`);
        const status = await res.json();
        
        if (!status.ready) {
            alert(`Muita calma, Pejotta! Você já reivindicou esta moeda. Volte em ${status.minutes} minutos.`);
            return;
        }
    } catch (e) {
        console.error("Erro ao checar tempo:", e);
    }

    currentCoin = coin;
    document.getElementById('modal-title').innerText = `Reivindicar ${coin.toUpperCase()}`;
    document.getElementById('claim-modal').style.display = 'block';
    
    // Lógica do botão (Habilita após 5 segundos para forçar ver o anúncio)
    const btn = document.getElementById('btn-finish-claim');
    btn.disabled = true;
    btn.innerText = "Aguarde o Captcha...";
    
    setTimeout(() => {
        btn.disabled = false;
        btn.innerText = "PEGAR TOKENS";
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1';
    }, 5000); 
}

function redirectToShortlink() {
    const wallet = localStorage.getItem('brazuka_wallet');
    const valores = { 'trx': 0.001, 'ton': 0.00000005 };
    const valor = valores[currentCoin];
    
    // Rota escudo do Worker para evitar erro no Ouo.io
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
