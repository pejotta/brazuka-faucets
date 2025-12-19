// CONFIGURAÇÃO: Substitua pela URL que a Cloudflare te deu
const WORKER_URL = "brazuka-faucets.moneynanet-yt.workers.dev";

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
            
            // Carrega os dados reais do Worker (Votos e Comentários)
            loadWorkerData(faucetId);
            
            // Inicia os sistemas interativos
            initInteractiveRating(faucetId);
            initCommentsSystem(faucetId);
        } else {
            document.body.innerHTML = "<h1>Faucet não encontrada!</h1>";
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
});

// 1. Preenche os dados fixos do JSON
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

// 2. Busca votos e comentários salvos no Cloudflare KV
async function loadWorkerData(faucetId) {
    try {
        const response = await fetch(`${WORKER_URL}/get-data?id=${faucetId}`);
        const data = await response.json();

        // Atualiza média de estrelas se houver
        if (data.media) {
            document.getElementById('rating-status').textContent = `Média: ${data.media} (${data.totalVotos} votos)`;
            updateStarsVisual(Math.round(data.media));
        }

        // Carrega comentários reais
        if (data.comentarios && data.comentarios.length > 0) {
            const display = document.getElementById('comments-display-list');
            display.innerHTML = ''; // Limpa o "Seja o primeiro"
            data.comentarios.forEach(c => renderComment(c));
        }
    } catch (e) {
        console.log("Worker ainda não configurado ou sem dados.");
    }
}

// 3. Sistema de Voto (Envia para o Worker)
function initInteractiveRating(faucetId) {
    const stars = document.querySelectorAll('#user-rating iconify-icon');
    const statusText = document.getElementById('rating-status');

    stars.forEach(star => {
        star.addEventListener('click', async () => {
            const val = parseInt(star.getAttribute('data-value'));
            
            statusText.textContent = "Enviando voto...";
            
            try {
                const response = await fetch(`${WORKER_URL}/votar`, {
                    method: 'POST',
                    body: JSON.stringify({ faucetId, nota: val }),
                    headers: { 'Content-Type': 'application/json' }
                });
                const resData = await response.json();
                
                statusText.textContent = `Média: ${resData.media} (${resData.total} votos)`;
                updateStarsVisual(val);
                alert("Voto registrado com sucesso!");
            } catch (err) {
                statusText.textContent = "Erro ao votar.";
            }
        });
    });
}

function updateStarsVisual(val) {
    const stars = document.querySelectorAll('#user-rating iconify-icon');
    stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-value'));
        s.setAttribute('icon', sVal <= val ? 'ic:round-star' : 'ic:round-star-border');
    });
}

// 4. Sistema de Comentários (Envia para o Worker)
function initCommentsSystem(faucetId) {
    const form = document.getElementById('comment-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const commentData = {
            faucetId,
            nome: document.getElementById('comm-name').value,
            site: document.getElementById('comm-site').value,
            texto: document.getElementById('comm-text').value,
            data: new Date().toLocaleDateString('pt-BR')
        };

        try {
            await fetch(`${WORKER_URL}/comentar`, {
                method: 'POST',
                body: JSON.stringify(commentData),
                headers: { 'Content-Type': 'application/json' }
            });

            renderComment(commentData);
            form.reset();
            alert('Comentário publicado!');
        } catch (err) {
            alert('Erro ao publicar comentário.');
        }
    });
}

function renderComment(c) {
    const display = document.getElementById('comments-display-list');
    const div = document.createElement('div');
    div.className = 'comment-item new-anim';
    div.innerHTML = `
        <strong>${c.nome} ${c.site ? `<a href="${c.site}" target="_blank" style="font-size:0.8em; color:#1a73e8;">(Visitar Site)</a>` : ''}</strong>
        <small style="display:block; color:#999; font-size:0.7em;">Postado em ${c.data}</small>
        <p>${c.texto}</p>
    `;
    display.prepend(div);
}

// 5. Botões de Compartilhamento (Não mudou)
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
