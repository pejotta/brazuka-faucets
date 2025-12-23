// CONFIGURAÇÃO
const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

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
            fillPageData(faucet); // Preenche tudo (incluindo recursos)
            setupShareButtons(faucet.nome);
            loadWorkerData(faucetId);
            initInteractiveRating(faucetId);
            initCommentsSystem(faucetId);
        } else {
            document.body.innerHTML = "<h1 style='text-align:center; padding-top:50px;'>Faucet não encontrada!</h1>";
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
});

// 1. Preenche os dados fixos
function fillPageData(faucet) {
    document.title = `${faucet.nome} | Brazuka Faucets`;
    document.getElementById('faucet-name').textContent = faucet.nome;
    
    // Tratamento para quando moeda é um Array (ex: FireFaucet)
    const moedaTexto = Array.isArray(faucet.moeda) ? faucet.moeda.join(' / ') : faucet.moeda;
    document.getElementById('faucet-coin').textContent = moedaTexto.toUpperCase();
    
    document.getElementById('faucet-type').textContent = faucet.tipo_principal || 'Faucet Padrão';
    document.getElementById('faucet-min').textContent = faucet.minimo_saque || '---';
    document.getElementById('faucet-time').textContent = faucet.tempo_saque || '---';
    document.getElementById('faucet-visit-link').href = faucet.url;
    document.getElementById('faucet-payment').textContent = faucet.pagamento || 'Não especificado';
    
    const statusTag = document.getElementById('faucet-status');
    statusTag.textContent = faucet.status === 'paying' ? 'PAGA REGULARMENTE' : (faucet.status === 'pending' ? 'PENDENTE' : 'SCAM/FECHADA');
    statusTag.className = `status-tag ${faucet.status} large-tag`;

    // --- RENDERIZAR RECURSOS AUDITADOS (Agora dentro da função correta!) ---
    const recursosContainer = document.getElementById('recursos-auditados'); 
    if (recursosContainer) {
        if (faucet.recursos && faucet.recursos.length > 0) {
            recursosContainer.innerHTML = faucet.recursos.map(rec => 
                `<span class="badge-recurso">${rec.replace('_', ' ')}</span>`
            ).join('');
        } else {
            recursosContainer.innerHTML = '<span style="color:#999; font-size:0.9em;">Nenhum recurso listado para esta auditoria.</span>';
        }
    }
}

// 2. Busca dados globais no Cloudflare KV
async function loadWorkerData(faucetId) {
    try {
        const response = await fetch(`${WORKER_URL}/get-data?id=${faucetId}`);
        if (!response.ok) return;
        const data = await response.json();

        if (data.totalVotos > 0) {
            document.getElementById('rating-status').textContent = `Média: ${data.media} (${data.totalVotos} votos)`;
            const meuVoto = localStorage.getItem(`voto_faucet_${faucetId}`);
            updateStarsVisual(meuVoto ? parseInt(meuVoto) : Math.round(data.media));
        }

        if (data.comentarios && data.comentarios.length > 0) {
            const display = document.getElementById('comments-display-list');
            display.innerHTML = ''; 
            data.comentarios.forEach(c => renderComment(c));
        }
    } catch (e) {
        console.log("Worker ainda sem dados.");
    }
}

// 3. Sistema de Voto
function initInteractiveRating(faucetId) {
    const stars = document.querySelectorAll('#user-rating iconify-icon');
    const statusText = document.getElementById('rating-status');

    stars.forEach(star => {
        star.addEventListener('click', async () => {
            if (localStorage.getItem(`voto_faucet_${faucetId}`)) {
                alert("Pejotta, você já avaliou essa faucet! 😉");
                return;
            }
            const val = parseInt(star.getAttribute('data-value'));
            try {
                const response = await fetch(`${WORKER_URL}/votar`, {
                    method: 'POST',
                    body: JSON.stringify({ faucetId, nota: val }),
                    headers: { 'Content-Type': 'application/json' }
                });
                const resData = await response.json();
                if (response.ok) {
                    localStorage.setItem(`voto_faucet_${faucetId}`, val);
                    updateStarsVisual(val);
                    statusText.textContent = `Média: ${resData.media} (${resData.total} votos)`;
                    alert("Obrigado pelo seu voto!");
                }
            } catch (err) {
                console.error(err);
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

// 4. Sistema de Comentários
function initCommentsSystem(faucetId) {
    const form = document.getElementById('comment-form');
    if (!form) return;

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
            const response = await fetch(`${WORKER_URL}/comentar`, {
                method: 'POST',
                body: JSON.stringify(commentData),
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                renderComment(commentData);
                form.reset();
                alert('Comentário publicado!');
            }
        } catch (err) {
            alert('Erro ao enviar.');
        }
    });
}

function renderComment(c) {
    const display = document.getElementById('comments-display-list');
    if (!display) return;
    const div = document.createElement('div');
    div.className = 'comment-item new-anim';
    div.innerHTML = `
        <strong>${c.nome} ${c.site ? `<a href="${c.site}" target="_blank" style="font-size:0.8em; color:#1a73e8;">(Site)</a>` : ''}</strong>
        <small style="display:block; color:#999; font-size:0.7em;">Postado em ${c.data}</small>
        <p>${c.texto}</p>
    `;
    display.prepend(div);
}

// 5. Compartilhamento
function setupShareButtons(faucetNome) {
    const pageUrl = window.location.href;
    const message = `Ei, descobri essa faucet no Brazuka Faucets: `;
    const links = {
        'share-wa': `https://api.whatsapp.com/send?text=${encodeURIComponent(message + pageUrl)}`,
        'share-tg': `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(message)}`,
        'share-fb': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
        'share-tw': `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}`,
        'share-rd': `https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}`,
        'share-ml': `mailto:?subject=Faucets&body=${encodeURIComponent(pageUrl)}`
    };
    for (const [id, url] of Object.entries(links)) {
        const el = document.getElementById(id);
        if (el) { el.href = url; el.target = "_blank"; }
    }
}
