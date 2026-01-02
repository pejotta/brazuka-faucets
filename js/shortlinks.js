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
        alert("Por favor, insira um endereço de carteira válido.");
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
        console.error("Erro ao conectar no Banco de Dados:", err);
    }
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
