// CONFIGURAÇÃO
const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('faucets_data.json');
        const data = await response.json();

        // --- 1. PREENCHER AS CATEGORIAS DA HOME ---
        const moedasHome = ['btc', 'eth', 'doge', 'trx', 'central', 'minerador', 'autofaucet'];

        moedasHome.forEach(moeda => {
            const container = document.getElementById(`grid-${moeda}`);
            if (!container) return;

            const filtered = data.filter(f => {
                if (Array.isArray(f.moeda)) return f.moeda.includes(moeda);
                return f.moeda === moeda;
            }).slice(0, 5);

            container.innerHTML = ''; 

            if (filtered.length === 0) {
                container.innerHTML = '<p style="color:#777; padding:10px;">Em breve novas faucets aqui!</p>';
                return;
            }

            filtered.forEach(faucet => {
                let tagsHTML = '';
                if (faucet.destaque === true || faucet.destaque === "true") {
                    tagsHTML += `<div class="tag-badge tag-destaque"><i class="fas fa-star"></i></div>`;
                }
                if (faucet.patrocinado === true || faucet.patrocinado === "true") {
                    tagsHTML += `<div class="tag-badge tag-patrocinado"><i class="fas fa-ad"></i></div>`;
                }

                const domain = faucet.url.replace(/^(https?:\/\/)/, '').split('/')[0];
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

                const card = `
                    <a href="faucet.html?id=${faucet.id}" class="faucet-card">
                        ${tagsHTML}
                        <div class="faucet-icon">
                            <img src="${faviconUrl}" alt="${faucet.nome}" 
                                 style="width: 32px; height: 32px; border-radius: 4px;"
                                 onerror="this.src='https://api.iconify.design/cryptocurrency:${Array.isArray(faucet.moeda) ? faucet.moeda[0] : faucet.moeda}.svg'">
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

        // --- 2. PREENCHER RECÉM ADICIONADOS (Agora dentro do escopo onde 'data' existe!) ---
        const recentContainer = document.getElementById('grid-recent');
        if (recentContainer) {
            const recentFaucets = [...data].reverse().slice(0, 5);
            recentContainer.innerHTML = recentFaucets.map(f => `
                <a href="faucet.html?id=${f.id}" class="mini-item">
                    <img src="https://www.google.com/s2/favicons?domain=${f.url.replace(/^(https?:\/\/)/, '').split('/')[0]}&sz=64" alt="">
                    <div class="mini-info">
                        <h4>${f.nome}</h4>
                        <p>Adicionada em: ${f.data_cadastro || 'Recente'}</p>
                    </div>
                </a>
            `).join('');
        }

        // --- 3. CHAMAR DADOS DO WORKER ---
        loadHomeStats();

    } catch (error) {
        console.error("Erro na Home:", error);
    }
});

// --- FUNÇÕES AUXILIARES (Fora do DOMContentLoaded) ---

async function loadHomeStats() {
    try {
        const res = await fetch(`${WORKER_URL}/get-global-stats`);
        if (!res.ok) throw new Error();
        const stats = await res.json();

        // Preencher Comentários
        const commContainer = document.getElementById('grid-comments');
        if (commContainer) {
            commContainer.innerHTML = stats.recentComments.map(c => `
                <div class="mini-item">
                    <div class="mini-info">
                        <h4>${c.nome} <small>em ${c.faucetNome}</small></h4>
                        <p>"${c.texto.substring(0, 40)}..."</p>
                    </div>
                </div>
            `).join('');
        }

        // Preencher Top Avaliados
        const topContainer = document.getElementById('grid-top-rated');
        if (topContainer) {
            topContainer.innerHTML = stats.topRated.map(f => `
                <a href="faucet.html?id=${f.id}" class="mini-item">
                    <div class="mini-info">
                        <h4>${f.nome}</h4>
                        <span class="rating-pill">⭐ ${f.media}</span>
                    </div>
                </a>
            `).join('');
        }
    } catch (e) {
        console.log("Worker ainda não tem a rota global ou está offline.");
    }
}
