// script-detail.js
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const faucetId = params.get('id');
    
    if (!faucetId) {
        window.location.href = 'index.html'; // Se não tiver ID, volta pra home
        return;
    }

    try {
        const response = await fetch('faucets_data.json');
        const faucets = await response.json();
        
        // Encontra a faucet pelo ID (convertendo pra número)
        const faucet = faucets.find(f => f.id == faucetId);

        if (faucet) {
            // Preenche os dados na página
            document.title = `${faucet.nome} | Brazuka Faucets`;
            document.getElementById('faucet-name').textContent = faucet.nome;
            document.getElementById('faucet-coin').textContent = faucet.moeda.toUpperCase();
            document.getElementById('faucet-type').textContent = faucet.tipo === 'auto' ? 'Auto Faucet' : 'Faucet Padrão';
            document.getElementById('faucet-min').textContent = faucet.minimo_saque;
            document.getElementById('faucet-time').textContent = faucet.tempo_saque;
            document.getElementById('faucet-visit-link').href = faucet.url;
            document.getElementById('faucet-payment').textContent = faucet.pagamento || 'Não especificado';
            
            // Status Tag
            const statusTag = document.getElementById('faucet-status');
            statusTag.textContent = faucet.status === 'paying' ? 'PAGA REGULARMENTE' : (faucet.status === 'pending' ? 'PENDENTE' : 'SCAM/FECHADA');
            statusTag.className = `status-tag ${faucet.status} large-tag`;

            // Estrelas (Reaproveitando a lógica de estrelas que criamos antes)
            renderStars(faucet.avaliacao);

        } else {
            document.body.innerHTML = "<h1>Faucet não encontrada!</h1>";
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
});

function renderStars(rating) {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHtml += '<i class="fa-solid fa-star rated"></i>';
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
            starsHtml += '<i class="fa-solid fa-star-half-stroke rated"></i>';
        } else {
            starsHtml += '<i class="fa-regular fa-star"></i>';
        }
    }
    starsContainer.innerHTML = `${starsHtml} <span class="score">${rating} / 5.0</span>`;
}
