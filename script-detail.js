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
            initInteractiveRating();
            initCommentsSystem(); // Inicia o sistema de comentários
        } else {
            document.body.innerHTML = "<h1>Faucet não encontrada!</h1>";
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
});

function fillPageData(faucet) {
    document.title = `${faucet.nome} | Brazuka Faucets`;
    document.getElementById('faucet-name').textContent = faucet.nome;
    document.getElementById('faucet-coin').textContent = faucet.moeda.toUpperCase();
    document.getElementById('faucet-type').textContent = faucet.tipo === 'auto' ? 'Auto Faucet' : 'Faucet Padrão';
    document.getElementById('faucet-min').textContent = faucet.minimo_saque;
    document.getElementById('faucet-time').textContent = faucet.tempo_saque;
    document.getElementById('faucet-visit-link').href = faucet.url;
    document.getElementById('faucet-payment').textContent = faucet.pagamento || 'Não especificado';
    
    const statusTag = document.getElementById('faucet-status');
    statusTag.textContent = faucet.status === 'paying' ? 'PAGA REGULARMENTE' : 'EM ANÁLISE';
    statusTag.className = `status-tag ${faucet.status} large-tag`;
}

function setupShareButtons(faucetNome) {
    const pageUrl = window.location.href;
    const title = `Confira a faucet ${faucetNome} no Brazuka Faucets!`;
    const message = `Ei, descobri essa faucet de ${faucetNome} que está pagando bem. Veja aqui: `;

    const links = {
        'share-wa': `https://api.whatsapp.com/send?text=${encodeURIComponent(message + pageUrl)}`,
        'share-tg': `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(message)}`,
        'share-fb': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
        'share-tw': `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`,
        'share-rd': `https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title)}`,
        'share-ml': `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message + pageUrl)}`
    };

    for (const [id, url] of Object.entries(links)) {
        const el = document.getElementById(id);
        if (el) { el.href = url; if (id !== 'share-ml') el.target = "_blank"; }
    }
}

function initInteractiveRating() {
    const stars = document.querySelectorAll('#user-rating iconify-icon');
    const statusText = document.getElementById('rating-status');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'));
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'));
                s.setAttribute('icon', sVal <= val ? 'ic:round-star' : 'ic:round-star-border');
            });
            statusText.textContent = `Nota ${val}!`;
            statusText.style.color = "#1a73e8";
        });
    });
}

function initCommentsSystem() {
    const form = document.getElementById('comment-form');
    const display = document.getElementById('comments-display-list');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('comm-name').value;
        const site = document.getElementById('comm-site').value;
        const text = document.getElementById('comm-text').value;
        const date = new Date().toLocaleDateString('pt-BR');

        const newComment = document.createElement('div');
        newComment.className = 'comment-item new-anim';
        newComment.innerHTML = `
            <strong>${name} ${site ? `<a href="${site}" target="_blank" style="font-size:0.8em; color:#1a73e8;">(Visitar Site)</a>` : ''}</strong>
            <small style="display:block; color:#999; font-size:0.7em;">Postado em ${date}</small>
            <p>${text}</p>
        `;

        display.prepend(newComment);
        form.reset();
        alert('Comentário enviado com sucesso!');
    });
}
