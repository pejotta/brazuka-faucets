// Função para buscar a carteira salva ou o valor do input
function getActiveWallet() {
    const inputWallet = document.getElementById('user-wallet').value;
    const savedWallet = localStorage.getItem('brazuka_wallet');
    return inputWallet || savedWallet || null;
}

// Carrega a carteira ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    const savedWallet = localStorage.getItem('brazuka_wallet');
    if (savedWallet) {
        const inputField = document.getElementById('user-wallet');
        if (inputField) {
            inputField.value = savedWallet;
            // Opcional: Mostrar uma mensagem amigável usando a carteira
            console.log(`Sessão ativa para: ${savedWallet.substring(0, 6)}...`);
        }
    }
});

async function startShortlink(linkId) {
    const wallet = document.getElementById('user-wallet').value;

    if (!wallet || wallet.length < 10) {
        alert("Por favor, insira um endereço de carteira válido para continuar.");
        return;
    }

    // Salva a carteira para "logar" o usuário automaticamente nas próximas vezes
    localStorage.setItem('brazuka_wallet', wallet);

    try {
        // Envia para o Worker registrar o início do desafio no Banco de Dados
        const response = await fetch(`https://api.brazukafaucets.com.br/start-link`, {
            method: 'POST',
            body: JSON.stringify({
                link_id: linkId,
                wallet: wallet
            })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            alert(data.message || "Erro ao processar link.");
        }
    } catch (err) {
        console.error("Falha na conexão com o Banco de Dados.", err);
    }
}
