// CONFIGURAÇÃO: Coloque sua URL da Cloudflare (com https:// e sem / no final)
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
            fillPageData(faucet);
            setupShareButtons(faucet.nome);
            
            // Busca dados reais (Votos e Comentários) no Worker
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

// 1. Preenche os dados fixos que vêm do JSON
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
    statusTag.textContent = faucet.status === 'paying' ? 'PAGA REGULARMENTE' : (faucet.status === 'pending' ? 'PENDENTE' : 'SCAM/FECHADA');
    statusTag.className = `status-tag ${faucet.status} large-tag`;
}

const recursosContainer = document.getElementById('recursos-auditados'); // Ajuste para o seu ID
if (faucet.recursos && faucet.recursos.length > 0) {
    recursosContainer.innerHTML = faucet.recursos.map(rec => 
        `<span class="badge-recurso">${rec}</span>`
    ).join('');
} else {
    recursosContainer.innerHTML = 'Nenhum recurso listado.';
}

// 2. Busca dados globais no Cloudflare KV (Média e Comentários Reais)
async function loadWorkerData(faucetId) {
    try {
        const response = await fetch(`${WORKER_URL}/get-data?id=${faucetId}`);
        if (!response.ok) return;
        
        const data = await response.json();

        // Atualiza a média global de estrelas
        if (data.totalVotos > 0) {
            document.getElementById('rating-status').textContent = `Média: ${data.media} (${data.totalVotos} votos)`;
            // Se o usuário já votou antes, a gente pinta as estrelas com a nota dele
            const meuVoto = localStorage.getItem(`voto_faucet_${faucetId}`);
            updateStarsVisual(meuVoto ? parseInt(meuVoto) : Math.round(data.media));
        }

        // Carrega os comentários reais salvos
        if (data.comentarios && data.comentarios.length > 0) {
            const display = document.getElementById('comments-display-list');
            display.innerHTML = ''; // Limpa a mensagem de "Seja o primeiro"
            data.comentarios.forEach(c => renderComment(c));
        }
    } catch (e) {
        console.log("Worker ainda sem dados para esta faucet.");
    }
}

// 3. Sistema de Voto Anti-Fraude
function initInteractiveRating(faucetId) {
    const stars = document.querySelectorAll('#user-rating iconify-icon');
    const statusText = document.getElementById('rating-status');

    stars.forEach(star => {
        star.addEventListener('click', async () => {
            // Verifica se o usuário já votou (Bloqueio Local)
            if (localStorage.getItem(`voto_faucet_${faucetId}`)) {
                alert("Pejotta, você já avaliou essa faucet! 😉");
                return;
            }

            const val = parseInt(star.getAttribute('data-value'));
            statusText.textContent = "Processando seu voto...";
            
            try {
                const response = await fetch(`${WORKER_URL}/votar`, {
                    method: 'POST',
                    body: JSON.stringify({ faucetId, nota: val }),
                    headers: { 'Content-Type': 'application/json' }
                });

                const resData = await response.json();

                if (response.ok) {
                    // Salva no navegador para bloquear cliques futuros
                    localStorage.setItem(`voto_faucet_${faucetId}`, val);
                    
                    statusText.textContent = `Média: ${resData.media} (${resData.total} votos)`;
                    updateStarsVisual(val);
                    alert("Obrigado pelo seu voto!");
                } else {
                    // Caso o Worker bloqueie pelo IP
                    alert(resData.error || "Erro ao computar voto.");
                    statusText.textContent = "Voto não permitido.";
                }
            } catch (err) {
                console.error(err);
                statusText.textContent = "Erro de conexão.";
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

// 4. Sistema de Comentários Reais
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
            const response = await fetch(`${WORKER_URL}/comentar`, {
                method: 'POST',
                body: JSON.stringify(commentData),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                renderComment(commentData);
                form.reset();
                alert('Comentário publicado com sucesso!');
            }
        } catch (err) {
            alert('Erro ao enviar comentário.');
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

// 5. Compartilhamento
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

// Quando carregar a faucet pelo ID:
function displayFaucetDetails(f) {
    document.getElementById('faucet-name').innerText = f.nome;
    // ... outros campos ...

    // Renderizar os Recursos (Badges)
    const recursosDiv = document.getElementById('recursos-list');
    if (f.recursos) {
        recursosDiv.innerHTML = f.recursos.map(r => 
            `<span class="badge-recurso">${r.replace('_', ' ')}</span>`
        ).join('');
    }
}
