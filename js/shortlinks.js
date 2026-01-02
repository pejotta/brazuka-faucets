// O endereço real do seu Worker com o hífen que resolveu o problema!
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
        // Limpa a URL para não ficar repetindo o alerta no refresh
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
            window.open(data.url, '_blank');
            activateLock();
        } else {
            alert(data.message || "Link em manutenção, tente outro!");
        }
    } catch (err) {
        console.error("Erro ao iniciar link:", err);
        alert("Ocorreu um erro ao conectar com o servidor.");
    }
}

function activateLock() {
    const mainContainer = document.querySelector('main');
    const overlay = document.getElementById('lock-overlay');
    const timerDisplay = document.getElementById('timer-display');
    
    if(!mainContainer || !overlay) return;

    mainContainer.classList.add('blur-active');
    overlay.style.display = 'block';
    
    let timeLeft = 60; 
    
    const countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft + "s";
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            mainContainer.classList.remove('blur-active');
            overlay.style.display = 'none';
            // Recarrega os dados do Banco de Dados após o tempo
            checkUser(); 
        }
    }, 1000);
}

async function checkUser(manualWallet = null) {
    const wallet = manualWallet || document.getElementById('user-wallet').value;
    
    if (wallet && wallet.length > 5) {
        try {
            const response = await fetch(`${API_URL}/get-user-stats?wallet=${wallet}`);
            const data = await response.json();
            
            if (data.success) {
                showDashboard(wallet, data.stats);
            } else {
                showDashboard(wallet, { clicks: 0, balance: 0, daily_clicks: {} });
            }
            localStorage.setItem('brazuka_wallet', wallet);
        } catch (e) { 
            showDashboard(wallet, { clicks: 0, balance: 0, daily_clicks: {} });
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
        if (faucetDiv) faucetDiv.style.display = 'block';
        
        document.getElementById('display-wallet').innerText = wallet;
        document.getElementById('stat-clicks').innerText = stats.clicks || 0;
        document.getElementById('stat-balance').innerText = (stats.balance || 0).toFixed(4);
    }

    // --- BUSCA SALDO REAL DA TORNEIRA ---
    try {
        const response = await fetch(`${API_URL}/get-faucet-balance`);
        const data = await response.json();
        if (data.balance) {
            let valorReal = parseFloat(data.balance);
            if (valorReal > 1000) valorReal = valorReal / 100000000; 
            document.getElementById('faucet-balance-display').innerText = valorReal.toFixed(4);
        }
    } catch (e) {
        document.getElementById('faucet-balance-display').innerText = "Indisponível";
    }

    // --- LÓGICA DE LIMITES DIÁRIOS ---
    const limites = { "link_1": 10, "link_2": 5, "link_3": 3 };
    const clicks = stats.daily_clicks || {};
    const hoje = new Date().toLocaleDateString('pt-BR');

    // AJUSTE: Verifica se o reset diário bate com a data de hoje
    const isNovoDia = stats.last_reset !== hoje;

    Object.keys(limites).forEach(id => {
        const feitos = isNovoDia ? 0 : (clicks[id] || 0);
        const restantes = limites[id] - feitos;
        
        const statusEl = document.getElementById(`${id}_status`);
        if (statusEl) {
            statusEl.innerText = `Disponível: ${restantes}/${limites[id]}`;
            
            const card = statusEl.closest('.link-card');
            const btn = card ? card.querySelector('button') : null;
            
            if (btn) {
                if (restantes <= 0) {
                    btn.disabled = true;
                    btn.innerText = "Limite Atingido";
                    btn.style.background = "#ccc";
                    btn.style.cursor = "not-allowed";
                } else {
                    btn.disabled = false;
                    btn.innerText = "ABRIR LINK";
                    // Mantém a cor original baseada no ID (se aplicável)
                    btn.style.cursor = "pointer";
                }
            }
        }
    });
}

function logout() {
    localStorage.removeItem('brazuka_wallet');
    location.reload();
}

async function atualizarContadores() {
    const wallet = localStorage.getItem('userWallet'); // Ou onde você guarda a carteira
    if (!wallet) return;

    try {
        const response = await fetch(`https://brazuka-faucets.moneynanet-yt.workers.dev/get-user-stats?wallet=${wallet}`);
        const data = await response.json();

        if (data.success && data.stats) {
            const stats = data.stats;
            const dailyClicks = stats.daily_clicks || {};

            // Defina aqui os mesmos limites que estão no Worker
            const limites = { "link_1": 10, "link_2": 5, "link_3": 3 };

            // Atualiza cada contador na tela
            for (let id in limites) {
                const realizados = dailyClicks[id] || 0;
                const disponiveis = limites[id] - realizados;
                const statusElement = document.getElementById(`${id}_status`);
                const btnElement = document.getElementById(`btn_${id}`);

                if (statusElement) {
                    statusElement.innerText = `Disponível: ${disponiveis}/${limites[id]}`;
                }

                // Se acabar os cliques, desativa o botão
                if (disponiveis <= 0 && btnElement) {
                    btnElement.disabled = true;
                    btnElement.innerText = "LIMITE ATINGIDO";
                    btnElement.style.background = "#7f8c8d";
                }
            }
        }
    } catch (err) {
        console.error("Erro ao atualizar contadores:", err);
    }
}

// Chama a função ao carregar a página
window.onload = atualizarContadores;
