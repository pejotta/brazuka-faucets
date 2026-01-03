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
            
            // Contadores de Claims
            document.getElementById('stat-trx').innerText = data.stats.claims_trx || 0;
            document.getElementById('stat-ton').innerText = data.stats.claims_ton || 0;

            // ANALISTA: Chama todas as atualizações de uma vez
            atualizarSaldosTorneira();
            carregarDadosExtras();
            aplicarCooldownBotoes(); // Ativa o cronômetro nos botões
        }
    } catch (e) {
        console.error("Erro ao buscar dados do Banco de Dados:", e);
    }
}

// BUSCA SALDO REAL DA CONTA NA FAUCETPAY
async function atualizarSaldosTorneira() {
    const moedas = ['TRX', 'TON'];
    for (const moeda of moedas) {
        try {
            const response = await fetch(`${API_URL}/get-faucet-balance?coin=${moeda}`);
            const data = await response.json();
            const el = document.getElementById(`balance-${moeda.toLowerCase()}`);
            
            if (el && data.balance) {
                const saldoReal = parseFloat(data.balance) / 100000000;
                el.innerText = saldoReal.toFixed(8);
            }
        } catch (e) {
            console.error(`Erro ao buscar saldo de ${moeda}:`, e);
        }
    }
}

// CRONÔMETRO REGRESSIVO NOS BOTÕES
async function aplicarCooldownBotoes() {
    const moedas = ['trx', 'ton'];
    const wallet = localStorage.getItem('brazuka_wallet');
    if (!wallet) return;

    for (const moeda of moedas) {
        try {
            const response = await fetch(`${API_URL}/check-cooldown?wallet=${wallet}&coin=${moeda}`);
            const data = await response.json();
            
            const btn = document.querySelector(`button[onclick="openClaimModal('${moeda}')"]`);
            if (btn && !data.ready) {
                iniciarContagemRegressiva(btn, data.minutes, moeda);
            }
        } catch (e) {
            console.error("Erro no cooldown:", e);
        }
    }
}

function iniciarContagemRegressiva(btn, minutos, moeda) {
    let segundosTotais = minutos * 60;
    btn.disabled = true;
    btn.style.opacity = "0.7";
    btn.style.cursor = "not-allowed";

    const intervalo = setInterval(() => {
        const m = Math.floor(segundosTotais / 60);
        const s = segundosTotais % 60;
        btn.innerText = `AGUARDE ${m}m ${s}s`;
        segundosTotais--;

        if (segundosTotais < 0) {
            clearInterval(intervalo);
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.innerText = `REIVINDICAR ${moeda.toUpperCase()}`;
            btn.style.background = moeda === 'trx' ? "#ff0013" : "#0088cc";
        }
    }, 1000);
}

// ABRE O MODAL
async function openClaimModal(coin) {
    currentCoin = coin;
    document.getElementById('modal-title').innerText = `Reivindicar ${coin.toUpperCase()}`;
    document.getElementById('claim-modal').style.display = 'block';
    
    const btn = document.getElementById('btn-finish-claim');
    btn.disabled = true;
    btn.innerText = "Aguarde o Captcha...";
    btn.style.opacity = '0.5';
    
    if (window.turnstile) turnstile.reset();
}

function onTurnstileSuccess(token) {
    const btn = document.getElementById('btn-finish-claim');
    btn.disabled = false;
    btn.innerText = "PEGAR TOKENS";
    btn.style.cursor = 'pointer';
    btn.style.opacity = '1';
}

function redirectToShortlink() {
    const wallet = localStorage.getItem('brazuka_wallet');
    const valores = { 'trx': 0.001, 'ton': 0.00000005 };
    const valor = valores[currentCoin];
    const callbackLimpo = `${API_URL}/pago-faucet/${wallet}/${currentCoin}/${valor}`;
    const API_OUO = "t2RuZtW4";
    window.location.href = `https://ouo.io/qs/${API_OUO}?s=${encodeURIComponent(callbackLimpo)}`;
}

function closeModal() {
    document.getElementById('claim-modal').style.display = 'none';
}

function logout() {
    localStorage.removeItem('brazuka_wallet');
    location.reload();
}

// CARREGA PAGAMENTOS E RANKING (CORRIGIDO)
async function carregarDadosExtras() {
    try {
        // 1. Pagamentos
        const resPagamentos = await fetch(`${API_URL}/get-recent-payouts`);
        const pagamentos = await resPagamentos.json();
        const tabela = document.getElementById('payout-rows');
        
        if (tabela) {
            tabela.innerHTML = ''; // ANALISTA: Corrigido de 'tela' para 'tabela'
            pagamentos.forEach(pago => {
            const logoMap = {
    'TRX': 'tron-trx-logo.svg',
    'TON': 'toncoin-ton-logo.svg',
    'DOGE': 'dogecoin-doge-logo.svg'
};

const logoFile = logoMap[pago.coin.toUpperCase()] || `${pago.coin.toLowerCase()}-logo.svg`;

const row = `
    <tr>
        <td>${mascararEmail(pago.email)}</td>
        <td>${(pago.amount / 100000000).toFixed(8)}</td>
        <td>
            <img src="https://cryptologos.cc/logos/${logoFile}?v=040" 
                 width="20" 
                 onerror="this.src='https://via.placeholder.com/20?text=$'"> 
            ${pago.coin}
        </td>
        <td>${formatarData(pago.timestamp)}</td>
    </tr>`;
                tabela.innerHTML += row;
            });
        }

        // 2. Ranking
        const resRanking = await fetch(`${API_URL}/get-leaderboard`);
        const ranking = await resRanking.json();
        const listaRanking = document.getElementById('leaderboard-list');
        
        if (listaRanking) {
            listaRanking.innerHTML = '';
            ranking.forEach(user => {
                const item = `<li><strong>${mascararEmail(user.email)}</strong> - ${user.claims} Claims</li>`;
                listaRanking.innerHTML += item;
            });
        }
    } catch (error) {
        console.error("Erro ao carregar dados extras:", error);
    }
}

function mascararEmail(email) {
    if (!email) return "---";
    const [user, domain] = email.split('@');
    return user.substring(0, 4) + '***@' + domain;
}

function formatarData(timestamp) {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
