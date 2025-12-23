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
            
            // AQUI ESTAVA O ERRO: Passar o objeto 'faucet' e não o 'faucetId'
            initReportSystem(faucet); 
            
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
    
    // Verificamos se os elementos existem na página para não dar erro
    const hiddenId = document.getElementById('hidden-faucet-id');
    const hiddenNome = document.getElementById('hidden-faucet-nome');
    const subject = document.getElementById('report-subject');

    if(btn && modal) {
        btn.onclick = (e) => {
            e.preventDefault();
            
            // Preenche os campos se eles existirem no HTML
            if(hiddenId) hiddenId.value = faucet.id;
            if(hiddenNome) hiddenNome.value = faucet.nome;
            if(subject) subject.value = `[Report] - ${faucet.nome}`;
            
            modal.style.display = 'flex';
        };
    }
}
