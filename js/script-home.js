/**
 * BRAZUKA FAUCETS - HOME SCRIPT
 * Analista responsável: Gemini
 */

const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

// --- CONFIGURAÇÃO DO SLIDER DE CURSOS (Focado em Mobile) ---
const meusAnuncios = [
    { img: "assets/alta-performance-moedas-digitais-brazuka.gif", link: "https://go.hotmart.com/T83952619I" },
    { img: "assets/gif-faucetmaniacos.gif", link: "https://tenteiganhei.blogspot.com/p/curso-faucetmaniacos.html" }
];

let adIndex = Math.floor(Math.random() * meusAnuncios.length);
let adTimer;

/**
 * Renderiza o anúncio mantendo a altura fixa para não quebrar no mobile
 */
function renderizarAd(index) {
    const container = document.getElementById("ad-content");
    if (!container) return;

    container.style.opacity = "0";

    setTimeout(() => {
        // ANALISTA: object-fit: cover garante que o GIF não achate no celular
        container.innerHTML = `
            <a href="${meusAnuncios[index].link}" target="_blank">
                <img src="${meusAnuncios[index].img}" 
                     class="ad-image" 
                     style="width:100%; height:250px; object-fit:cover; object-position:center; display:block; border-radius:12px;">
            </a>
        `;
        container.style.opacity = "1";
    }, 400);
}

function proximoAd() {
    adIndex = (adIndex + 1) % meusAnuncios.length;
    renderizarAd(adIndex);
    resetarTimer();
}

function anteriorAd() {
    adIndex = (adIndex - 1 + meusAnuncios.length) % meusAnuncios.length;
    renderizarAd(adIndex);
    resetarTimer();
}

function resetarTimer() {
    clearInterval(adTimer);
    adTimer = setInterval(proximoAd, 15000); // 15 segundos
}

// --- EVENTO PRINCIPAL ---
document.addEventListener('DOMContentLoaded', async () => {
    // Inicia o Slider
    renderizarAd(adIndex);
    resetarTimer();

    // Listeners dos botões do Slider
    const btnNext = document.getElementById('ad-next');
    const btnPrev = document.getElementById('ad-prev');
    if (btnNext) btnNext.onclick = proximoAd;
    if (btnPrev) btnPrev.onclick = anteriorAd;

    try {
        // Busca dados no Banco de Dados [cite: 2025-12-26]
        const response = await fetch(`${WORKER_URL}/get-all-faucets?t=${Date.now()}`);
        const data = await response.json();

        // 1. PREENCHER CATEGORIAS (BTC, ETH, etc)
        const moedasHome = ['btc', 'eth', 'doge', 'trx', 'central', 'minerador', 'autofaucet', 'airdrop', 'ipo'];

        moedasHome.forEach(moeda => {
            const container = document.getElementById(`grid-${moeda}`);
            if (!container) return;

            const allInCategory = data.filter(f => Array.isArray(f.moeda) ? f.moeda.includes(moeda) : f.moeda === moeda);
            
            // Separa VIPs (Patrocinados e Destaques)
            const vips = allInCategory.filter(f => f.patrocinado == "true" || f.patrocinado === true || f.destaque == "true" || f.destaque === true);
            const normais = allInCategory.filter(f => !(f.patrocinado == "true" || f.patrocinado === true || f.destaque == "true" || f.destaque === true));
            
            const normaisEmbaralhados = normais.sort(() => Math.random() - 0.5);
            vips.sort((a, b) => (a.patrocinado == "true" || a.patrocinado === true) ? -1 : 1);

            const finalLista = [...vips, ...normaisEmbaralhados].slice(0, 5);
            container.innerHTML = ''; 

            if (!finalLista.length) {
                container.innerHTML = '<p style="color:#777; padding:10px;">Novas oportunidades em breve!</p>';
                return;
            }

            finalLista.forEach(faucet => {
                let tagsHTML = '';
                let destaqueClass = ''; 

                if (faucet.patrocinado == "true" || faucet.patrocinado === true) {
                    tagsHTML = `<div class="tag-badge tag-patrocinado"><i class="fas fa-ad"></i></div>`;
                    destaqueClass = 'card-patrocinado';
                } else if (faucet.destaque == "true" || faucet.destaque === true) {
                    tagsHTML = `<div class="tag-badge tag-destaque"><i class="fas fa-star"></i></div>`;
                    destaqueClass = 'card-destaque';
                }

                const domain = faucet.url.replace(/^(https?:\/\/)/, '').split('/')[0];
                const statusLabels = { 'paying': 'Paga', 'pending': 'Análise', 'scam': 'SCAM' };

                container.innerHTML += `
                    <a href="faucet.html?id=${faucet.id}" class="faucet-card ${destaqueClass}">
                        ${tagsHTML}
                        <div class="faucet-icon">
                            <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=128" 
                                 style="width:32px; height:32px; border-radius:4px;"
                                 onerror="this.src='https://api.iconify.design/cryptocurrency:${Array.isArray(faucet.moeda) ? faucet.moeda[0] : faucet.moeda}.svg'">
                        </div>
                        <div class="faucet-info">
                            <h3>${faucet.nome}</h3>
                            <p class="url">${domain}</p>
                        </div>
                        <span class="status-tag ${faucet.status}">${statusLabels[faucet.status] || 'Análise'}</span>
                    </a>
                `;
            });
        });

        // 2. RECÉM ADICIONADOS
        const recentContainer = document.getElementById('grid-recent');
        if (recentContainer) {
            recentContainer.innerHTML = [...data].reverse().slice(0, 5).map(f => `
                <a href="faucet.html?id=${f.id}" class="mini-item">
                    <img src="https://www.google.com/s2/favicons?domain=${f.url.replace(/^(https?:\/\/)/, '').split('/')[0]}&sz=64">
                    <div class="mini-info">
                        <h4>${f.nome}</h4>
                        <p>Adicionada em: ${f.data_cadastro || 'Recente'}</p>
                    </div>
                </a>
            `).join('');
        }

        // 3. ESTATÍSTICAS E RANKING
        loadHomeStats(data);

        // Observer para os contadores
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
        console.error("Erro ao carregar dados do Banco de Dados.");
    }
});

// --- FUNÇÕES AUXILIARES ---

async function loadHomeStats(allFaucetsJson) {
    try {
        const res = await fetch(`${WORKER_URL}/get-global-stats`);
        const stats = await res.json();

        // Comentários Recentes
        const commContainer = document.getElementById('grid-comments');
        if (commContainer && stats.recentComments) {
            commContainer.innerHTML = stats.recentComments.map(c => {
                const faucetRef = allFaucetsJson.find(f => f.id == c.faucetId);
                return `
                    <a href="faucet.html?id=${c.faucetId}" class="mini-item comment-link">
                        <div class="mini-info">
                            <h4>${c.nome} <small>em ${faucetRef ? faucetRef.nome : "Oportunidade"}</small></h4>
                            <p>"${c.texto.substring(0, 40)}..."</p>
                        </div>
                    </a>
                `;
            }).join('');
        }

        // Top Avaliações (Restauração concluída)
        const topContainer = document.getElementById('grid-top-rated');
        if (topContainer && stats.topRated) {
            topContainer.innerHTML = stats.topRated.map(f => {
                const faucetRef = allFaucetsJson.find(item => item.id == f.id);
                return `
                    <a href="faucet.html?id=${f.id}" class="mini-item">
                        <div class="mini-info">
                            <h4>${faucetRef ? faucetRef.nome : `Item #${f.id}`}</h4>
                            <span class="rating-pill" style="color: #f29900; font-weight: bold;">⭐ ${f.media}</span>
                        </div>
                    </a>
                `;
            }).join('');
        }
    } catch (e) {
        console.log("Métricas em atualização...");
    }
}

const startCounters = () => {
    document.querySelectorAll('.stat-number').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const speed = 200;
        const inc = target / speed;

        const updateCount = () => {
            if (count < target) {
                count += inc;
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};
