// CONFIGURAÇÃO
const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

// --- CONFIGURAÇÃO DO SLIDER DE CURSOS ---
const meusAnuncios = [
    { img: "/alta-performance-moedas-digitais-brazuka.gif", link: "https://go.hotmart.com/T83952619I" },
    { img: "/gif-faucetmaniacos.gif", link: "https://tenteiganhei.blogspot.com/p/curso-faucetmaniacos.html" }
];

let adIndex = Math.floor(Math.random() * meusAnuncios.length);
let adTimer;

// Função para renderizar o anúncio com fade
function renderizarAd(index) {
    const container = document.getElementById("ad-content");
    if (!container) return;

    container.style.opacity = "0";

    setTimeout(() => {
        container.innerHTML = `
            <a href="${meusAnuncios[index].link}" target="_blank">
                <img src="${meusAnuncios[index].img}" class="ad-image" style="width:100%; height:250px; object-fit:cover; display:block; border-radius:8px;">
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
    adTimer = setInterval(proximoAd, 15000); // 15 Segundos conforme pedido
}

// --- INICIALIZAÇÃO PRINCIPAL ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Inicializa o Slider de Cursos
    renderizarAd(adIndex);
    resetarTimer();

    // Eventos das setas do Slider
    const btnNext = document.getElementById('ad-next');
    const btnPrev = document.getElementById('ad-prev');
    if (btnNext) btnNext.onclick = proximoAd;
    if (btnPrev) btnPrev.onclick = anteriorAd;

    try {
        // 2. Carregamento de Dados do Banco de Dados [cite: 2025-12-26]
        const response = await fetch(`${WORKER_URL}/get-all-faucets?t=${new Date().getTime()}`);
        const data = await response.json();

        // --- PREENCHER AS CATEGORIAS DA HOME ---
        const moedasHome = ['btc', 'eth', 'doge', 'trx', 'central', 'minerador', 'autofaucet', 'airdrop', 'ipo'];

        moedasHome.forEach(moeda => {
            const container = document.getElementById(`grid-${moeda}`);
            if (!container) return;

            const allInCategory = data.filter(f => {
                if (Array.isArray(f.moeda)) return f.moeda.includes(moeda);
                return f.moeda === moeda;
            });

            const vips = allInCategory.filter(f => 
                f.patrocinado === true || f.patrocinado === "true" || 
                f.destaque === true || f.destaque === "true"
            );

            const normais = allInCategory.filter(f => 
                !(f.patrocinado === true || f.patrocinado === "true" || 
                  f.destaque === true || f.destaque === "true")
            );

            const normaisEmbaralhados = normais.sort(() => Math.random() - 0.5);

            vips.sort((a, b) => {
                const aPatro = (a.patrocinado === true || a.patrocinado === "true");
                const bPatro = (b.patrocinado === true || b.patrocinado === "true");
                return (aPatro && !bPatro) ? -1 : (!aPatro && bPatro) ? 1 : 0;
            });

            const finalLista = [...vips, ...normaisEmbaralhados].slice(0, 5);
            container.innerHTML = ''; 

            if (finalLista.length === 0) {
                container.innerHTML = '<p style="color:#777; padding:10px;">Novas oportunidades em breve!</p>';
                return;
            }

            finalLista.forEach(faucet => {
                let tagsHTML = '';
                let destaqueClass = ''; 

                if (faucet.patrocinado === true || faucet.patrocinado === "true") {
                    tagsHTML = `<div class="tag-badge tag-patrocinado"><i class="fas fa-ad"></i></div>`;
                    destaqueClass = 'card-patrocinado';
                } else if (faucet.destaque === true || faucet.destaque === "true") {
                    tagsHTML = `<div class="tag-badge tag-destaque"><i class="fas fa-star"></i></div>`;
                    destaqueClass = 'card-destaque';
                }

                const domain = faucet.url.replace(/^(https?:\/\/)/, '').split('/')[0];
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

                const statusLabels = { 'paying': 'Paga', 'pending': 'Análise', 'scam': 'SCAM' };
                const statusTexto = statusLabels[faucet.status] || 'Análise'; 

                container.innerHTML += `
                    <a href="faucet.html?id=${faucet.id}" class="faucet-card ${destaqueClass}">
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
                        <span class="status-tag ${faucet.status}">${statusTexto}</span>
                    </a>
                `;
            });
        });

        // --- PREENCHER RECÉM ADICIONADOS ---
        const recentContainer = document.getElementById('grid-recent');
        if (recentContainer) {
            recentContainer.innerHTML = [...data].reverse().slice(0, 5).map(f => `
                <a href="faucet.html?id=${f.id}" class="mini-item">
                    <img src="https://www.google.com/s2/favicons?domain=${f.url.replace(/^(https?:\/\/)/, '').split('/')[0]}&sz=64" alt="">
                    <div class="mini-info">
                        <h4>${f.nome}</h4>
                        <p>Adicionada em: ${f.data_cadastro || 'Recente'}</p>
                    </div>
                </a>
            `).join('');
        }

        loadHomeStats(data);

        // Ativador do contador visual
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

// --- FUNÇÕES DE MÉTRICAS E CONTADORES ---
async function loadHomeStats(allFaucetsJson) {
    try {
        const res = await fetch(`${WORKER_URL}/get-global-stats`);
        const stats = await res.json();

        const commContainer = document.getElementById('grid-comments');
        if (commContainer && stats.recentComments) {
            commContainer.innerHTML = stats.recentComments.map(c => {
                const faucetRef = allFaucetsJson.find(f => f.id == c.faucetId);
                return `
                    <a href="faucet.html?id=${c.faucetId}" class="mini-item comment-link" style="text-decoration: none; color: inherit;">
                        <div class="mini-info">
                            <h4>${c.nome} <small>em ${faucetRef ? faucetRef.nome : "Oportunidade"}</small></h4>
                            <p>"${c.texto.substring(0, 40)}..."</p>
                        </div>
                    </a>
                `;
            }).join('');
        }
    } catch (e) { console.log("Métricas em atualização..."); }
}

const startCounters = () => {
    document.querySelectorAll('.stat-number').forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / 200;
            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 15);
            } else { counter.innerText = target; }
        };
        updateCount();
    });
};
