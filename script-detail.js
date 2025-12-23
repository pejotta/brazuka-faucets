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

function initReportSystem(faucet) {
    const btn = document.getElementById('report-btn');
    const modal = document.getElementById('report-modal');
    
    // Campos hidden do Formspree
    const hiddenId = document.getElementById('hidden-faucet-id');
    const hiddenNome = document.getElementById('hidden-faucet-nome');
    const subject = document.getElementById('report-subject');

    if(btn && modal) {
        btn.onclick = (e) => {
            e.preventDefault();
            
            // Preenche os dados da faucet atual nos campos escondidos
            hiddenId.value = faucet.id;
            hiddenNome.value = faucet.nome;
            subject.value = `[Report] - ${faucet.nome}`; // Deixa o assunto do e-mail bonitinho
            
            modal.style.display = 'flex';
        };
    }
}

// Lógica de envio com alerta para o usuário
const reportForm = document.getElementById('report-form');
if (reportForm) {
    reportForm.addEventListener('submit', function() {
        alert("Valeu, Pejotta! Report enviado. Vou checar isso o quanto antes! 👊");
        closeReport();
    });
}
