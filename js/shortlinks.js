// O endereço real do seu Worker que você me passou
const API_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

function getActiveWallet() {
    const inputWallet = document.getElementById('user-wallet')?.value;
    const savedWallet = localStorage.getItem('brazuka_wallet');
    return inputWallet || savedWallet || null;
}

document.addEventListener('DOMContentLoaded', () => {
    const savedWallet = localStorage.getItem('brazuka_wallet');
    
    // Verifica se voltou de um pagamento com sucesso
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
        const amt = urlParams.get('amt');
        alert(`🎉 Sucesso! Enviamos ${amt} DOGE para sua FaucetPay.`);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (savedWallet) {
        const inputField = document.getElementById('user-wallet');
        if (inputField) inputField.value = savedWallet;
        checkUser(savedWallet);
    }
});

async function startShortlink(linkId) {
    const wallet = getActiveWallet();
    if (!wallet || wallet.length < 5) {
        alert("Ei, coloca seu e-mail ou carteira primeiro!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/start-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ link_id: linkId, wallet: wallet })
        });

        const data = await response.json();

        if (data.url) {
            // 1. Abre o encurtador em uma nova aba
            window.open(data.url, '_blank');

            // 2. Ativa o Blur e o Overlay no painel principal
            activateLock();
        } else {
            alert(data.message || "Link em manutenção, tente outro!");
        }
    } catch (err) {
        console.error("Erro ao iniciar link:", err);
    }
}

function activateLock() {
    const mainContainer = document.querySelector('main');
    const overlay = document.getElementById('lock-overlay');
    const timerDisplay = document.getElementById('timer-display');
    
    mainContainer.classList.add('blur-active');
    overlay.style.display = 'block';
    
    let timeLeft = 60; // Tempo de bloqueio (ex: 60 segundos)
    
    const countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft + "s";
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            mainContainer.classList.remove('blur-active');
            overlay.style.display = 'none';
            // Recarrega os dados do Banco de Dados para ver se o saldo caiu
            checkUser(); 
        }
    }, 1000);
}

async function checkUser(manualWallet = null) {
    const wallet = manualWallet || document.getElementById('user-wallet').value;
    
    if (wallet && wallet.length > 5) {
        try {
            // Agora chamando o endereço correto do Worker
            const response = await fetch(`${API_URL}/get-user-stats?wallet=${wallet}`);
            const data = await response.json();
            
            if (data.success) {
                showDashboard(wallet, data.stats);
            } else {
                // Se o usuário for novo (erro 404), abre o painel zerado
                showDashboard(wallet, { clicks: 0, balance: 0 });
            }
            localStorage.setItem('brazuka_wallet', wallet);
        } catch (e) { 
            console.log("Usuário novo, abrindo painel padrão.");
            // Garante que o painel abra mesmo se a busca falhar
            showDashboard(wallet, { clicks: 0, balance: 0 });
        }
    } else {
        alert("Digite um e-mail ou carteira válida!");
    }
}

async function showDashboard(wallet, stats) {
    const loginView = document.getElementById('login-view');
    const dashView = document.getElementById('dashboard-view');
    const faucetDiv = document.getElementById('faucet-liquidity');
    
    if (loginView && dashView) {
        loginView.style.display = 'none';
        dashView.style.display = 'block';
        if (faucetDiv) faucetDiv.style.display = 'block'; // Mostra o saldo da torneira
        
        document.getElementById('display-wallet').innerText = wallet;
        document.getElementById('stat-clicks').innerText = stats.clicks || 0;
        document.getElementById('stat-balance').innerText = (stats.balance || 0).toFixed(4);
    }

    // --- BUSCA SALDO REAL DA TORNEIRA ---
    try {
        // Criaremos essa rota no seu Worker para pegar o saldo via API da FaucetPay
        const response = await fetch(`${API_URL}/get-faucet-balance`);
        const data = await response.json();
        if (data.balance) {
            document.getElementById('faucet-balance-display').innerText = parseFloat(data.balance).toFixed(2);
        }
    } catch (e) {
        document.getElementById('faucet-balance-display').innerText = "Indisponível";
    }

    // --- LÓGICA DE LIMITES DIÁRIOS ---
    const limites = { "link_1": 10, "link_2": 5, "link_3": 3 };
    const clicks = stats.daily_clicks || {};
    const hoje = new Date().toLocaleDateString('pt-BR');

    // Se mudou o dia no Banco de Dados, o JS mostra tudo cheio
    const isNovoDia = stats.last_reset !== hoje;

    Object.keys(limites).forEach(id => {
        const feitos = isNovoDia ? 0 : (clicks[id] || 0);
        const restantes = limites[id] - feitos;
        
        const statusEl = document.getElementById(`${id}_status`);
        if (statusEl) {
            statusEl.innerText = `Disponível: ${restantes}/${limites[id]}`;
            
            // Localiza o botão dentro do card pai
            const btn = statusEl.closest('.link-card').querySelector('button');
            
            if (restantes <= 0) {
                btn.disabled = true;
                btn.innerText = "Limite Atingido";
                btn.style.background = "#ccc";
                btn.style.cursor = "not-allowed";
            } else {
                // Reseta o botão caso mude o dia sem dar refresh
                btn.disabled = false;
                btn.style.cursor = "pointer";
            }
        }
    });
}

function logout() {
    localStorage.removeItem('brazuka_wallet');
    location.reload();
}
