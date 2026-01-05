// O endereço real do seu Worker
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
        // Limpa a URL para não ficar repetindo o alerta
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
            // Recarrega os dados reais do Banco de Dados após o tempo
            checkUser(); 
        }
    }, 1000);
}

async function checkUser(manualWallet = null) {
    const wallet = manualWallet || document.getElementById('user-wallet').value;
    
    if (wallet && wallet.length > 5) {
        try {
            // Adicionado timestamp (t=) para evitar cache do navegador e pegar dado novo do Banco de Dados
            const response = await fetch(`${API_URL}/get-user-stats?wallet=${wallet}&t=${Date.now()}`);
            const data = await response.json();
            
            if (data.success) {
                showDashboard(wallet, data.stats);
            } else {
                showDashboard(wallet, { clicks: 0, balance: 0, daily_clicks: {} });
            }
            localStorage.setItem('brazuka_wallet', wallet);
        } catch (e) { 
            console.error("Erro ao buscar stats:", e);
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

    // --- LÓGICA DE LIMITES DIÁRIOS (IDÊNTICA AO PRINT) ---
    const limites = { "link_1": 10, "link_2": 5, "link_3": 3 };
    const clicksFeitos = stats.daily_clicks || {};

    Object.keys(limites).forEach(id => {
        const total = limites[id];
        const realizados = clicksFeitos[id] || 0;
        
        // No seu print, se o cara fez 3 de 5, aparece "Disponível: 2/5"
        // Então a conta é: Total - Realizados
        const disponiveis = total - realizados;
        
        const statusEl = document.getElementById(`${id}_status`);
        const btn = document.getElementById(`btn_${id}`);

        if (statusEl) {
            // Isso aqui vai renderizar o "Disponível: X/Y" do seu print
            statusEl.innerText = `Disponível: ${disponiveis}/${total}`;
            
            if (btn) {
                if (disponiveis <= 0) {
                    btn.disabled = true;
                    btn.innerText = "Limite Atingido";
                    btn.style.background = "#7f8c8d"; // Cor cinza do print
                    btn.style.cursor = "not-allowed";
                } else {
                    btn.disabled = false;
                    btn.innerText = "ABRIR LINK";
                    btn.style.cursor = "pointer";
                    // Cores vibrantes do seu print
                    if(id === 'link_1') btn.style.background = "#f1c40f"; 
                    if(id === 'link_2') btn.style.background = "#e67e22";
                    if(id === 'link_3') btn.style.background = "#9b59b6";
                }
            }
        }
    });
}

function logout() {
    localStorage.removeItem('brazuka_wallet');
    location.reload();
}
