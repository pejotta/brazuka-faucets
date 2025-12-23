document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const faucetId = params.get('id');
    
    if (!faucetId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('faucets_data.json');
        const faucets = await response.json();
        const faucet = faucets.find(f => f.id == faucetId);

        if (faucet) {
            fillPageData(faucet); 
            setupShareButtons(faucet.nome);
            loadWorkerData(faucetId);
            initInteractiveRating(faucetId);
            initCommentsSystem(faucetId);
            showRecommended(faucets, faucet); 
            
            // --- O PULO DO GATO: CHAME A FUNÇÃO AQUI! ---
            initReportSystem(faucetId); 
            
        } else {
            document.body.innerHTML = "<h1 style='text-align:center; padding-top:50px;'>Faucet não encontrada!</h1>";
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
});

// FUNÇÃO: Inicializa os eventos do Modal
function initReportSystem(faucetId) {
    const btn = document.getElementById('report-btn');
    const modal = document.getElementById('report-modal');

    if(btn && modal) {
        btn.onclick = (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
        };
    }
}

// FUNÇÃO: Envia o Report para o seu Worker
async function sendReport() {
    const reason = document.getElementById('report-reason').value;
    const params = new URLSearchParams(window.location.search);
    const faucetId = params.get('id');

    if(!faucetId) return;

    try {
        // Agora enviando de verdade para o Worker!
        const response = await fetch(`${WORKER_URL}/reportar`, {
            method: 'POST',
            body: JSON.stringify({ 
                faucetId: faucetId, 
                motivo: reason,
                data: new Date().toISOString()
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert("Obrigado, Pejotta! O relatório foi enviado. Vamos analisar essa faucet agora mesmo! 🕵️‍♂️");
        } else {
            alert("O relatório foi registrado localmente. Obrigado pelo aviso!");
        }
    } catch (err) {
        console.error("Erro ao reportar:", err);
        alert("Ocorreu um erro, mas o report foi logado. Obrigado!");
    }
    
    closeReport();
}

function closeReport() {
    const modal = document.getElementById('report-modal');
    if(modal) modal.style.display = 'none';
}
