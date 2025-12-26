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
        // IMPLEMENTAÇÃO: Cache Busting com Timestamp (?t=...)
        // Isso força o navegador a buscar os dados MAIS RECENTES do Banco de Dados
        const response = await fetch(`${WORKER_URL}/get-all-faucets?t=${new Date().getTime()}`);
        const faucets = await response.json();
        const faucet = faucets.find(f => f.id == faucetId);

        if (faucet) {
            fillPageData(faucet); 
            setupShareButtons(faucet.nome);
            loadWorkerData(faucetId);
            initInteractiveRating(faucetId);
            initCommentsSystem(faucetId);
            showRecommended(faucets, faucet); 
            initReportSystem(faucet); 
            
        } else {
            document.body.innerHTML = "<h1 style='text-align:center; padding-top:50px;'>Ops! Item não encontrado.</h1>";
        }
    } catch (error) {
        console.error("Erro na comunicação com o Banco de Dados.");
    }
});

// 1. Preenche os dados fixos (Atualizado para o novo Banco de Dados)
function fillPageData(faucet) {
    document.title = `${faucet.nome} | Brazuka Faucets`;
    document.getElementById('faucet-name').textContent = faucet.nome;

    const moedaTexto = Array.isArray(faucet.moeda) ? faucet.moeda.join(' / ') : faucet.moeda;
    document.getElementById('faucet-coin').textContent = moedaTexto.toUpperCase();

    document.getElementById('faucet-type').textContent = faucet.tipo_principal || 'Faucet Padrão';
    document.getElementById('faucet-min').textContent = faucet.minimo_saque || '---';
    document.getElementById('faucet-time').textContent = faucet.tempo_saque || '---';
    document.getElementById('faucet-visit-link').href = faucet.url;
    document.getElementById('faucet-payment').textContent = faucet.pagamento || 'Não especificado';
    document.getElementById('faucet-interval').textContent = faucet.intervalo || 'N/A';
    document.getElementById('faucet-captcha').textContent = faucet.captcha || 'N/A';

    const statusTag = document.getElementById('faucet-status');
    statusTag.textContent = faucet.status === 'paying' ? 'PAGA REGULARMENTE' : (faucet.status === 'pending' ? 'PENDENTE' : 'SCAM/FECHADA');
    statusTag.className = `status-tag ${faucet.status} large-tag`;

    // SISTEMA DE RECURSOS ATUALIZADO
    const recursosContainer = document.getElementById('recursos-auditados'); 
    if (recursosContainer) {
        if (faucet.recursos && faucet.recursos.length > 0) {
            recursosContainer.innerHTML = faucet.recursos.map(rec => {
                // Deixa a primeira letra maiúscula para ficar bonitão
                const nomeLimpo = rec.charAt(0).toUpperCase() + rec.slice(1).replace('_', ' ');
                return `<span class="badge-recurso">${nomeLimpo}</span>`;
            }).join('');
        } else {
            recursosContainer.innerHTML = '<span style="color:#999; font-size:0.9em;">Nenhum recurso listado.</span>';
        }
    }
}

// FUNÇÃO: Mostrar Faucets Recomendadas
function showRecommended(allFaucets, currentFaucet) {
    const container = document.getElementById('recommended-grid');
    if (!container) return;

    const related = allFaucets.filter(f => {
        if (f.id === currentFaucet.id) return false;
        const currentMoedas = Array.isArray(currentFaucet.moeda) ? currentFaucet.moeda : [currentFaucet.moeda];
        const targetMoedas = Array.isArray(f.moeda) ? f.moeda : [f.moeda];
        return currentMoedas.some(m => targetMoedas.includes(m));
    }).slice(0, 4);

    if (related.length === 0) {
        container.innerHTML = '<p>Continue explorando para ganhar mais!</p>';
        return;
    }

    container.innerHTML = related.map(f => {
        const domain = f.url.replace(/^(https?:\/\/)/, '').split('/')[0];
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        return `
            <a href="faucet.html?id=${f.id}" class="faucet-card">
                <div class="faucet-icon">
                    <img src="${faviconUrl}" alt="${f.nome}" style="width:32px;height:32px;">
                </div>
                <div class="faucet-info">
                    <h3>${f.nome}</h3>
                    <p class="url">${domain}</p>
                </div>
                <span class="status-tag ${f.status}">${f.status === 'paying' ? 'Paga' : 'Análise'}</span>
            </a>
        `;
    }).join('');
}

// 1. Preenche os dados fixos
function fillPageData(faucet) {
    document.title = `${faucet.nome} | Brazuka Faucets`;
    document.getElementById('faucet-name').textContent = faucet.nome;

    const moedaTexto = Array.isArray(faucet.moeda) ? faucet.moeda.join(' / ') : faucet.moeda;
    document.getElementById('faucet-coin').textContent = moedaTexto.toUpperCase();

    document.getElementById('faucet-type').textContent = faucet.tipo_principal || 'Faucet Padrão';
    document.getElementById('faucet-min').textContent = faucet.minimo_saque || '---';
    document.getElementById('faucet-time').textContent = faucet.tempo_saque || '---';
    document.getElementById('faucet-visit-link').href = faucet.url;
    document.getElementById('faucet-payment').textContent = faucet.pagamento || 'Não especificado';
    document.getElementById('faucet-interval').textContent = faucet.intervalo || 'N/A';
    document.getElementById('faucet-captcha').textContent = faucet.captcha || 'N/A';

    const statusTag = document.getElementById('faucet-status');
    statusTag.textContent = faucet.status === 'paying' ? 'PAGA REGULARMENTE' : (faucet.status === 'pending' ? 'PENDENTE' : 'SCAM/FECHADA');
    statusTag.className = `status-tag ${faucet.status} large-tag`;

    const recursosContainer = document.getElementById('recursos-auditados'); 
    if (recursosContainer) {
        if (faucet.recursos && faucet.recursos.length > 0) {
            recursosContainer.innerHTML = faucet.recursos.map(rec => 
                `<span class="badge-recurso">${rec.replace('_', ' ')}</span>`
            ).join('');
        } else {
            recursosContainer.innerHTML = '<span style="color:#999; font-size:0.9em;">Nenhum recurso listado.</span>';
        }
    }
}

// 2. Busca dados dinâmicos no Banco de Dados
async function loadWorkerData(faucetId) {
    try {
        const response = await fetch(`${WORKER_URL}/get-data?id=${faucetId}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.totalVotos > 0) {
            document.getElementById('rating-status').textContent = `Média: ${data.media} (${data.totalVotos} votos)`;
            const meuVoto = localStorage.getItem(`voto_f_id_${faucetId}`);
            updateStarsVisual(meuVoto ? parseInt(meuVoto) : Math.round(data.media));
        }
        if (data.comentarios && data.comentarios.length > 0) {
            const display = document.getElementById('comments-display-list');
            if(display) {
                display.innerHTML = ''; 
                data.comentarios.forEach(c => renderComment(c));
            }
        }
    } catch (e) { console.log("Aguardando atualizações."); }
}

// 3. Sistema de Voto
function initInteractiveRating(faucetId) {
    const stars = document.querySelectorAll('#user-rating iconify-icon');
    const statusText = document.getElementById('rating-status');
    stars.forEach(star => {
        star.addEventListener('click', async () => {
            if (localStorage.getItem(`voto_f_id_${faucetId}`)) {
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
                    localStorage.setItem(`voto_f_id_${faucetId}`, val);
                    updateStarsVisual(val);
                    statusText.textContent = `Média: ${resData.media} (${resData.total} votos)`;
                    alert("Obrigado pelo seu voto!");
                }
            } catch (err) { console.error(err); }
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
            }
        } catch (err) { alert('Erro ao processar envio.'); }
    });
}

function renderComment(c) {
    const display = document.getElementById('comments-display-list');
    if (!display) return;
    const div = document.createElement('div');
    div.className = 'comment-item new-anim';
    div.innerHTML = `<strong>${c.nome}</strong> <p>${c.texto}</p>`;
    display.prepend(div);
}

// 5. Compartilhamento
function setupShareButtons(faucetNome) {
    const pageUrl = window.location.href;
    const message = `Dá uma olhada nessa faucet: `;
    const links = {
        'share-wa': `https://api.whatsapp.com/send?text=${encodeURIComponent(message + pageUrl)}`,
        'share-tg': `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(message)}`,
        'share-fb': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
        'share-tw': `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}`,
        'share-rd': `https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}`,
        'share-ml': `mailto:?subject=Dica de Faucet&body=${encodeURIComponent(pageUrl)}`
    };
    for (const [id, url] of Object.entries(links)) {
        const el = document.getElementById(id);
        if (el) { el.href = url; el.target = "_blank"; }
    }
}

// 6. Report
function initReportSystem(faucet) {
    const btn = document.getElementById('report-btn');
    const modal = document.getElementById('report-modal');
    
    const hiddenId = document.getElementById('hidden-faucet-id');
    const hiddenNome = document.getElementById('hidden-faucet-nome');
    const subject = document.getElementById('report-subject');

    if(btn && modal) {
        btn.onclick = (e) => {
            e.preventDefault();
            if(hiddenId) hiddenId.value = faucet.id;
            if(hiddenNome) hiddenNome.value = faucet.nome;
            if(subject) subject.value = `[Inconsistência] - ${faucet.nome}`;
            modal.style.display = 'flex';
        };
    }

    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        reportForm.onsubmit = () => {
            alert("Recebido! Vamos analisar as informações. 👊");
            setTimeout(closeReport, 500); 
        };
    }
}

function closeReport() {
    const modal = document.getElementById('report-modal');
    if(modal) modal.style.display = 'none';
}
