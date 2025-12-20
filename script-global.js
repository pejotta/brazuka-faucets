// script-global.js

async function loadEverything() {
    // 1. Favicon Dinâmico
    setFavicon();
    
    // 2. Carregar Menu
    await loadTemplate('menu_template.html', 'header-placeholder', 'afterbegin');

    // 3. Carregar Footer
    await loadTemplate('footer_template.html', 'footer-placeholder', 'beforeend');

    // 4. Carregar Ads
    loadAd('top-ad-placeholder', 'top_ad.html');
    loadAd('bottom-ad-placeholder', 'bottom_ad.html');

    // 5. CARREGAR AS FAUCETS (O que estava faltando!)
    renderFaucets();
}

// Auxiliar para carregar HTML de templates
async function loadTemplate(file, id, position) {
    try {
        const res = await fetch(file);
        const html = await res.text();
        const placeholder = document.getElementById(id);
        if (placeholder) {
            placeholder.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML(position, html);
        }
    } catch (e) { console.error(`Erro ao carregar ${file}:`, e); }
}

async function renderFaucets() {
    const container = document.getElementById('faucets-container');
    if (!container) return; // Se não estiver numa página de lista, para aqui.

    try {
        const response = await fetch('faucets_data.json');
        const faucets = await response.json();
        
        // Identifica qual moeda filtrar pela URL da página
        const path = window.location.pathname;
        let filteredFaucets = faucets;

        if (path.includes('list-btc')) filteredFaucets = faucets.filter(f => f.moeda === 'btc');
        else if (path.includes('list-doge')) filteredFaucets = faucets.filter(f => f.moeda === 'doge');
        else if (path.includes('list-ltc')) filteredFaucets = faucets.filter(f => f.moeda === 'ltc');
        // Adicione outras moedas aqui se tiver

        container.innerHTML = ''; // Limpa o container

        filteredFaucets.forEach(f => {
            const card = document.createElement('div');
            card.className = 'faucet-card';
            // Note que usei "faucet.html" para a URL amigável que combinamos!
            card.innerHTML = `
                ${f.destaque ? '<span class="badge-card">Destaque</span>' : ''}
                <h3>${f.nome}</h3>
                <p class="coin-type">${f.moeda.toUpperCase()}</p>
                <div class="card-info">
                    <span><i class="fa-solid fa-money-bill-transfer"></i> ${f.minimo_saque}</span>
                </div>
                <a href="faucet.html?id=${f.id}" class="details-btn">Ver Detalhes</a>
            `;
            container.appendChild(card);
        });
    } catch (e) { console.error("Erro ao listar faucets:", e); }
}

function setFavicon() {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = 'logo-brazuka.png'; 
}

async function loadAd(id, file) {
    const el = document.getElementById(id);
    if (el) {
        try {
            const res = await fetch(file);
            const html = await res.text();
            el.innerHTML = html;
        } catch (e) { console.error(`Erro no Ad ${file}:`, e); }
    }
}

// Controle do Carrossel (Só roda se o elemento existir)
let currentSlide = 0;
function moveSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const track = document.getElementById('carousel-track');
    if (!track || slides.length === 0) return;
    
    currentSlide += direction;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Inicia tudo
loadEverything();
setInterval(() => moveSlide(1), 5000);
