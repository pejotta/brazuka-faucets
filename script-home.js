document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('faucets_data.json');
        const data = await response.json();

        // Lista de moedas que aparecem na Home
        const moedasHome = ['btc', 'eth', 'doge', 'trx', 'central', 'minerador', 'autofaucet'];

        moedasHome.forEach(moeda => {
            const container = document.getElementById(`grid-${moeda}`);
            if (!container) return;

            // Agora ele verifica se a moeda que a Home quer está dentro da lista da Faucet
const filtered = data.filter(f => {
    // Se for um array (lista), ele usa o .includes()
    if (Array.isArray(f.moeda)) {
        return f.moeda.includes(moeda);
    }
    // Se ainda for um texto simples (para as antigas), ele compara normal
    return f.moeda === moeda;
}).slice(0, 5);

            container.innerHTML = ''; // Limpa o "Carregando..."

            if (filtered.length === 0) {
                container.innerHTML = '<p style="color:#777; padding:10px;">Em breve novas faucets aqui!</p>';
                return;
            }

            filtered.forEach(faucet => {
                // --- LÓGICA DE TAGS (Destaque e Patrocinado) ---
                let tagsHTML = '';
                if (faucet.destaque === true || faucet.destaque === "true") {
                    tagsHTML += `<div class="tag-badge tag-destaque"><i class="fas fa-star"></i></div>`;
                }
                if (faucet.patrocinado === true || faucet.patrocinado === "true") {
                    tagsHTML += `<div class="tag-badge tag-patrocinado"><i class="fas fa-ad"></i></div>`;
                }

                // Pegamos a URL limpa para buscar o favicon
                const domain = faucet.url.replace(/^(https?:\/\/)/, '').split('/')[0];
                // API do Google para buscar Favicons
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

                const card = `
                    <a href="faucet.html?id=${faucet.id}" class="faucet-card">
                        ${tagsHTML}
                        <div class="faucet-icon">
                            <img src="${faviconUrl}" alt="${faucet.nome}" 
                                 style="width: 32px; height: 32px; border-radius: 4px;"
                                 onerror="this.src='https://api.iconify.design/cryptocurrency:${faucet.moeda}.svg'">
                        </div>
                        <div class="faucet-info">
                            <h3>${faucet.nome}</h3>
                            <p class="url">${domain}</p>
                        </div>
                        <span class="status-tag ${faucet.status}">
                            ${faucet.status === 'paying' ? 'Paga' : 'Análise'}
                        </span>
                    </a>
                `;
                container.innerHTML += card;
            });
        });
    } catch (error) {
        console.error("Erro na Home:", error);
    }
});

// Função auxiliar para ícones de moedas
function getIconTag(moeda) {
    const icons = {
        'btc': 'cryptocurrency:btc',
        'eth': 'cryptocurrency:eth',
        'doge': 'cryptocurrency:doge',
        'trx': 'cryptocurrency:trx',
        'central': 'fa6-solid:building-columns',
        'autofaucet': 'fa6-solid:building-columns',
        'minerador': 'fa6-solid:building-columns'
    };
    const iconName = icons[moeda] || 'fa6-solid:wallet';
    return `<iconify-icon icon="${iconName}" style="font-size: 30px; color: #1a73e8;"></iconify-icon>`;
}

// --- 1. PREENCHER RECÉM ADICIONADOS (Do seu JSON data) ---
// Pega as últimas 5 faucets cadastradas (considerando que as últimas estão no fim do JSON)
const recentFaucets = [...data].reverse().slice(0, 5);
const recentContainer = document.getElementById('grid-recent');
recentContainer.innerHTML = recentFaucets.map(f => `
    <a href="faucet.html?id=${f.id}" class="mini-item">
        <img src="https://www.google.com/s2/favicons?domain=${f.url}&sz=64" alt="">
        <div class="mini-info">
            <h4>${f.nome}</h4>
            <p>Adicionada em: ${f.data_cadastro || 'Recente'}</p>
        </div>
    </a>
`).join('');

// --- 2. BUSCAR DADOS DO WORKER (Comentários e Top Votos) ---
async function loadHomeStats() {
    try {
        const res = await fetch(`${WORKER_URL}/get-global-stats`);
        const stats = await res.json();

        // Preencher Comentários
        const commContainer = document.getElementById('grid-comments');
        commContainer.innerHTML = stats.recentComments.map(c => `
            <div class="mini-item">
                <div class="mini-info">
                    <h4>${c.nome} <small>em ${c.faucetNome}</small></h4>
                    <p>"${c.texto.substring(0, 40)}..."</p>
                </div>
            </div>
        `).join('');

        // Preencher Top Avaliados
        const topContainer = document.getElementById('grid-top-rated');
        topContainer.innerHTML = stats.topRated.map(f => `
            <a href="faucet.html?id=${f.id}" class="mini-item">
                <div class="mini-info">
                    <h4>${f.nome}</h4>
                    <span class="rating-pill">⭐ ${f.media}</span>
                </div>
            </a>
        `).join('');

    } catch (e) {
        console.log("Erro ao carregar estatísticas globais.");
    }
}
loadHomeStats();
