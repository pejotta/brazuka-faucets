async function reivindicarPremio(moeda, valorFixo) {
    const carteira = document.getElementById('user-wallet').value;

    if (!carteira || carteira.length < 10) {
        alert("Ei, Brazuka avisou: Insira uma carteira válida da FaucetPay! 😉");
        return;
    }

    // Feedback visual de carregamento
    const btn = event.target;
    const textoOriginal = btn.innerText;
    btn.innerText = "PROCESSANDO...";
    btn.disabled = true;

    try {
        const response = await fetch(`${WORKER_URL}/claim-payout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wallet: carteira,
                coin: moeda, // Aqui vai 'TRX', 'DOGE', 'PEPE', etc.
                amount: valorFixo
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Sucesso! ${valorFixo} ${moeda} foram enviados para sua conta! 🚀`);
        } else {
            alert("Opa: " + data.message);
        }
    } catch (error) {
        alert("Erro na rede. Tente novamente em instantes.");
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}
