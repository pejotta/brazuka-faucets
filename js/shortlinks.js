// ANALISTA: Configurações Gerais e Padronização
const API_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";
const STORAGE_KEY = 'brazuka_wallet'; // Chave única para o Banco de Dados local [cite: 2025-12-26]

// 1. Função para pegar o e-mail ativo (Input ou Cache)
function getActiveWallet() {
    const inputWallet = document.getElementById('user-wallet')?.value;
    const savedWallet = localStorage.getItem(STORAGE_KEY);
    return inputWallet || savedWallet || null;
}

// 2. Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // ANALISTA: Espera 300ms para garantir que o HTML desenhou tudo
    setTimeout(() => {
        const emailLogado = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('brazuka_user_email');
        
        if (emailLogado) {
            localStorage.setItem(STORAGE_KEY, emailLogado);
            const inputField = document.getElementById('user-wallet');
            if (inputField) inputField.value = emailLogado;
            
            console.log("Login automático detectado no Banco de Dados: " + emailLogado); [cite: 2025-12-26]
            checkUser(emailLogado);
        }

        // Fecha o preloader se ele ainda estiver lá (ajuda na UX)
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('fade-out');
    }, 300);

    // Verifica se voltou de um pagamento
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
        const amt = urlParams.get('amt');
        alert(`🎉 Sucesso! Enviamos ${amt} DOGE para sua FaucetPay.`);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// 3. Iniciar o Shortlink (POST para o Worker)
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

// 4. Bloqueio visual e Timer de 60s
function activateLock() {
    const mainContainer = document.getElementById('content-to-blur'); 
    const overlay = document.getElementById('lock-overlay');
    const timerDisplay = document.getElementById('timer-display');
    
    if(!mainContainer || !overlay) return;

    mainContainer.classList.add('blur-active');
    overlay.style.display = 'block';
    
    let timeLeft = 60; 
    
    const countdown = setInterval(() => {
        timeLeft--;
        if(timerDisplay) timerDisplay.innerText = timeLeft + "s";
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            mainContainer.classList.remove('blur-active');
            overlay.style.display = 'none';
            // Recarrega os dados reais após o tempo
            checkUser(); 
        }
    }, 1000);
}

// 5. Verificar Usuário no Banco de Dados
async function checkUser(manualWallet = null) {
    // ANALISTA: Tenta encontrar o campo de e-mail por todos os IDs que você já usou
    const inputEl = document.getElementById('user-wallet') || 
                    document.getElementById('wallet-input') || 
                    document.getElementById('walletAddr');
    
    const wallet = manualWallet || (inputEl ? inputEl.value : null);
    
    console.log("Tentando login com:", wallet); // Para você ver no console (F12)

    if (wallet && wallet.length > 5) {
        try {
            // Sincroniza logo as chaves antes do fetch para garantir
            localStorage.setItem(STORAGE_KEY, wallet);
            localStorage.setItem('brazuka_user_email', wallet);

            const response = await fetch(`${API_URL}/get-user-stats?wallet=${wallet}&t=${Date.now()}`);
            const data = await response.json();
            
            if (data.success) {
                showDashboard(wallet, data.stats);
            } else {
                // ANALISTA: Se o Worker retornar success:false, o auto-create do Worker (que ajustamos)
                // deveria ter resolvido. Se chegar aqui, forçamos a exibição do dash zerado.
                showDashboard(wallet, { clicks: 0, balance: 0, daily_clicks: {} });
            }
        } catch (e) { 
            console.error("Erro ao conectar no Banco de Dados:", e);
        }
    } else {
        alert("Digite um e-mail ou carteira válida!");
    }
}

// 6. Mostrar Painel (Dashboard)
async function showDashboard(wallet, stats) {
    const loginView = document.getElementById('login-view');
    const dashView = document.getElementById('dashboard-view');
    const faucetDiv = document.getElementById('faucet-liquidity');
    
    if (loginView && dashView) {
        loginView.style.display = 'none';
        dashView.style.display = 'block';
        if (faucetDiv) faucetDiv.style.display = 'block';
        
        const displayWallet = document.getElementById('display-wallet');
        const statClicks = document.getElementById('stat-clicks');
        const statBalance = document.getElementById('stat-balance');

        if(displayWallet) displayWallet.innerText = wallet;
        if(statClicks) statClicks.innerText = stats.clicks || 0;
        if(statBalance) statBalance.innerText = (stats.balance || 0).toFixed(4);
    }

    // Busca saldo real da FaucetPay via Worker
    try {
        const response = await fetch(`${API_URL}/get-faucet-balance`);
        const data = await response.json();
        const balanceDisplay = document.getElementById('faucet-balance-display');
        if (data.balance && balanceDisplay) {
            let valorReal = parseFloat(data.balance);
            if (valorReal > 1000) valorReal = valorReal / 100000000; 
            balanceDisplay.innerText = valorReal.toFixed(4);
        }
    } catch (e) {
        if(document.getElementById('faucet-balance-display')) 
            document.getElementById('faucet-balance-display').innerText = "---";
    }

    // Lógica de Limites Diários
    const limites = { "link_1": 10, "link_2": 5, "link_3": 3 };
    const clicksFeitos = stats.daily_clicks || {};

    Object.keys(limites).forEach(id => {
        const total = limites[id];
        const realizados = clicksFeitos[id] || 0;
        const disponiveis = total - realizados;
        
        const statusEl = document.getElementById(`${id}_status`);
        const btn = document.getElementById(`btn_${id}`);

        if (statusEl) {
            statusEl.innerText = `Disponível: ${disponiveis}/${total}`;
            if (btn) {
                if (disponiveis <= 0) {
                    btn.disabled = true;
                    btn.innerText = "LIMITE ATINGIDO";
                    btn.style.background = "#7f8c8d";
                    btn.style.cursor = "not-allowed";
                } else {
                    btn.disabled = false;
                    btn.innerText = "ABRIR LINK";
                    btn.style.cursor = "pointer";
                }
            }
        }
    });
}

// 7. Função de Logout (Limpa todas as chaves possíveis)
function logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('brazuka_wallet');
    localStorage.removeItem('brazuka_user_email');
    location.reload();
}
