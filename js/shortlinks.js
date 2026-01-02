// O endereço real do seu Worker
const API_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

function getActiveWallet() {
    const inputWallet = document.getElementById('user-wallet')?.value;
    const savedWallet = localStorage.getItem('brazuka_wallet');
    return inputWallet || savedWallet || null;
}

document.addEventListener('DOMContentLoaded', () => {
    const savedWallet = localStorage.getItem('brazuka_wallet');
    
    // Alerta de sucesso após o pagamento
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
        const amt = urlParams.get('amt');
        alert(`🚀 Show de bola, Pejotta! ${amt} DOGE foram enviados para sua FaucetPay!`);
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
        alert("Ei, coloca uma carteira ou e-mail válido aí antes!");
        return;
    }

    localStorage.setItem('brazuka_wallet', wallet);

    try {
        const response = await fetch(`${API_URL}/start-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ link_id: linkId, wallet: wallet })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            alert(data.message || "Erro ao processar link.");
        }
    } catch (err) {
        console.error("Erro de conexão com o Worker:", err);
        alert("Ops! O Worker não respondeu. Verifique se ele está ligado.");
    }
}

async function checkUser(manualWallet = null) {
    const wallet = manualWallet || document.getElementById('user-wallet').value;
    
    if (wallet && wallet.length > 5) {
        try {
            const response = await fetch(`${API_URL}/get-user-stats?wallet=${wallet}`);
            const data = await response.json();
            
            // Se o usuário já existe, mostra os dados dele
            if (data.success) {
                showDashboard(wallet, data.stats);
            } else {
                // Se o usuário é novo, abre o painel zerado para ele não ficar travado
                showDashboard(wallet, { clicks: 0, balance: 0 });
            }
            localStorage.setItem('brazuka_wallet', wallet);
        } catch (e) { 
            // Em caso de erro de conexão, ainda assim tentamos mostrar o painel zerado
            showDashboard(wallet, { clicks: 0, balance: 0 });
        }
    }
}

function showDashboard(wallet, stats) {
    const loginView = document.getElementById('login-view');
    const dashView = document.getElementById('dashboard-view');
    
    if (loginView && dashView) {
        loginView.style.display = 'none';
        dashView.style.display = 'block';
        document.getElementById('display-wallet').innerText = wallet;
        document.getElementById('stat-clicks').innerText = stats.clicks || 0;
        document.getElementById('stat-balance').innerText = (stats.balance || 0).toFixed(4);
    }
}

function logout() {
    localStorage.removeItem('brazuka_wallet');
    location.reload();
}
