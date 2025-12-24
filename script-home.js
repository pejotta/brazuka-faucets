// CONFIGURAÇÃO
const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

// --- ARRAY DE ANÚNCIOS (900x250px) ---
const meusAnuncios = [
    { img: "alta-performance-moedas-digitais-brazuka.gif", link: "https://go.hotmart.com/T83952619I" },
    { img: "gif-faucetmaniacos.gif", link: "https://tenteiganhei.blogspot.com/p/curso-faucetmaniacos.html" }
];

let adIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
    // Inicia o rodízio de anúncios imediatamente ao carregar
    rotacionarAnuncios();
    setInterval(rotacionarAnuncios, 15 * 60 * 1000); // 15 minutos

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

        // --- 2. PREENCHER RECÉM ADICIONADOS ---
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
        loadHomeStats(data);

        // --- 4. CONFIGURAR CONTADORES ANIMADOS (Intersection Observer) ---
        const statsHero = document.querySelector('.stats-hero');
        if (statsHero) {
            const observer = new IntersectionObserver((entries) => {
                if(entries[0].isIntersecting) {
                    startCounters();
                    observer.disconnect(); 
                }
            }, { threshold: 0.5 });
            observer.observe(statsHero);
        }

    } catch (error) {
        console.error("Erro na Home:", error);
    }
});

// --- FUNÇÕES AUXILIARES ---

async function loadHomeStats(allFaucetsJson) {
    try {
        const res = await fetch(`${WORKER_URL}/get-global-stats`);
        if (!res.ok) throw new Error();
        const stats = await res.json();

        // --- COMENTÁRIOS ---
        const commContainer = document.getElementById('grid-comments');
        if (commContainer && stats.recentComments) {
            commContainer.innerHTML = stats.recentComments.map(c => {
                const faucetRef = allFaucetsJson.find(f => f.id == c.faucetId);
                const nomeExibicao = faucetRef ? faucetRef.nome : "Faucet";

                return `
                    <a href="faucet.html?id=${c.faucetId}" class="mini-item comment-link" style="text-decoration: none; color: inherit;">
                        <div class="mini-info">
                            <h4>${c.nome} <small>em ${nomeExibicao}</small></h4>
                            <p>"${c.texto.substring(0, 40)}..."</p>
                        </div>
                    </a>
                `;
            }).join('');
        }

        // --- TOP AVALIADOS ---
        const topContainer = document.getElementById('grid-top-rated');
        if (topContainer && stats.topRated) {
            topContainer.innerHTML = stats.topRated.map(f => {
                const faucetRef = allFaucetsJson.find(item => item.id == f.id);
                const nomeReal = faucetRef ? faucetRef.nome : `Faucet #${f.id}`;

                return `
                    <a href="faucet.html?id=${f.id}" class="mini-item">
                        <div class="mini-info">
                            <h4>${nomeReal}</h4>
                            <span class="rating-pill">⭐ ${f.media}</span>
                        </div>
                    </a>
                `;
            }).join('');
        }
    } catch (e) {
        console.log("Erro ao carregar estatísticas do Worker.");
    }
}

// Lógica dos Contadores
const startCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;
            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

// Lógica de Rotação de Anúncios
function rotacionarAnuncios() {
    const container = document.getElementById("ad-content");
    if (!container) return;

    container.style.opacity = "0";

    setTimeout(() => {
        container.innerHTML = `
            <a href="${meusAnuncios[adIndex].link}" target="_blank">
                <img src="${meusAnuncios[adIndex].img}" class="ad-image" style="width:100%; height:100%; object-fit:cover;">
            </a>
        `;
        container.style.opacity = "1";
        adIndex = (adIndex + 1) % meusAnuncios.length;
    }, 500);
}
