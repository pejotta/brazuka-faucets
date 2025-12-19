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
            // Preenche os dados básicos
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

            // === AQUI ESTÁ O PULO DO GATO ===
            // 1. Ativa os botões de compartilhamento
            setupShareButtons(faucet.nome);

            // 2. Ativa o sistema de avaliação interativo
            initInteractiveRating();

        } else {
            document.body.innerHTML = "<h1>Faucet não encontrada!</h1>";
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
});

// FUNÇÃO PARA COMPARTILHAMENTO
function setupShareButtons(faucetNome) {
    const pageUrl = window.location.href;
    const title = `Confira a faucet ${faucetNome} no Brazuka Faucets!`;
    const message = `Ei, descobri essa faucet de ${faucetNome} que está pagando bem. Veja aqui: `;

    const shareLinks = {
        'share-wa': `https://api.whatsapp.com/send?text=${encodeURIComponent(message + pageUrl)}`,
        'share-tg': `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(message)}`,
        'share-fb': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
        'share-tw': `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`,
        'share-rd': `https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title)}`,
        'share-ml': `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message + pageUrl)}`
    };

    for (const [id, url] of Object.entries(shareLinks)) {
        const el = document.getElementById(id);
        if (el) {
            el.href = url;
            if (id !== 'share-ml') el.target = "_blank";
        }
    }
}

// FUNÇÃO PARA AVALIAÇÃO INTERATIVA (ESTRELAS)
function initInteractiveRating() {
    // Seleciona os iconify-icon dentro da div #user-rating
    const stars = document.querySelectorAll('#user-rating iconify-icon');
    const statusText = document.getElementById('rating-status');

    stars.forEach(star => {
        // Importante: forçar o cursor pointer no JS se o CSS falhar
        star.style.cursor = "pointer";
        
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'));
            
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'));
                if (sVal <= val) {
                    s.setAttribute('icon', 'ic:round-star'); // Estrela cheia
                } else {
                    s.setAttribute('icon', 'ic:round-star-border'); // Estrela vazia
                }
            });

            statusText.textContent = `Nota ${val}!`;
            statusText.style.color = "#1a73e8";
        });
    });
}
