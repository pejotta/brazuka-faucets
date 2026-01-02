// Função para buscar a carteira salva ou o valor do input
function getActiveWallet() {
    const inputWallet = document.getElementById('user-wallet')?.value;
    const savedWallet = localStorage.getItem('brazuka_wallet');
    return inputWallet || savedWallet || null;
}

// Carrega a carteira ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    const savedWallet = localStorage.getItem('brazuka_wallet');
    
    // Verifica se voltou de um pagamento com sucesso
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
        const amt = urlParams.get('amt');
        alert(`🎉 Sucesso! Enviamos ${amt} DOGE para sua FaucetPay.`);
        // Limpa a URL para não ficar repetindo o alerta se der F5
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (savedWallet) {
        const inputField = document.getElementById('user-wallet');
        if (inputField) {
            inputField.value = savedWallet;
        }
        // Se já tem carteira salva, já busca os dados no Banco de Dados automaticamente
        checkUser(savedWallet);
    }
});

async function startShortlink(linkId) {
    const wallet = getActiveWallet();

    if (!wallet || wallet.length < 10) {
        alert("Por favor, insira um endereço de carteira válido para continuar.");
        return;
    }

    localStorage.setItem('brazuka_wallet', wallet);

    try {
        const response = await fetch(`https://api.brazukafaucets.com.br/start-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                link_id: linkId,
                wallet: wallet
            })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            // Aqui entra a mensagem do FREEZE caso o usuário tente clicar rápido demais
            alert(data.message || "Erro ao processar link.");
        }
    } catch (err) {
        console.error("Falha na conexão com o Banco de Dados.", err);
    }
}

// Modifiquei para aceitar uma carteira opcional como argumento
async function checkUser(manualWallet = null) {
    const wallet = manualWallet || document.getElementById('user-wallet').value;
    
    if (wallet && wallet.length > 5) {
        try {
            const response = await fetch(`https://api.brazukafaucets.com.br/get-user-stats?wallet=${wallet}`);
            const data = await response.json();
            
            if (data.success) {
                showDashboard(wallet, data.stats);
                localStorage.setItem('brazuka_wallet', wallet);
            }
        } catch (e) { 
            console.log("Usuário novo ou ainda não registrado no Banco de Dados."); 
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
