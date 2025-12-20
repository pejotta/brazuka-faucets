// script-global.js - O Zelador do Portal

async function loadEverything() {
    // 1. Define o favicon dinamicamente
    setFavicon();
    
    // 2. Carregar Menu (Template)
    await loadTemplate('menu_template.html', 'header-placeholder', 'afterbegin');

    // 3. Carregar Footer (Template)
    await loadTemplate('footer_template.html', 'footer-placeholder', 'beforeend');

    // 4. Carregar Ads (Se existirem os placeholders na página)
    loadAd('top-ad-placeholder', 'top_ad.html');
    loadAd('bottom-ad-placeholder', 'bottom_ad.html');
}

// Função auxiliar para carregar arquivos HTML externos
async function loadTemplate(file, id, position) {
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Arquivo ${file} não encontrado`);
        const html = await res.text();
        const placeholder = document.getElementById(id);
        
        if (placeholder) {
            placeholder.innerHTML = html;
        } else {
            // Se não achou o ID, joga no início ou fim do body para não quebrar o layout
            document.body.insertAdjacentHTML(position, html);
        }
    } catch (e) { 
        console.error(`Erro ao carregar template (${file}):`, e); 
    }
}

// Função para o Favicon
function setFavicon() {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = 'logo-brazuka.png'; 
}

// Função para os Banners de Ads
async function loadAd(id, file) {
    const el = document.getElementById(id);
    if (el) {
        try {
            const res = await fetch(file);
            if (res.ok) {
                const html = await res.text();
                el.innerHTML = html;
            }
        } catch (e) { 
            console.error(`Erro ao carregar Ad ${file}:`, e); 
        }
    }
}

// --- Lógica do Carrossel (Hero Section) ---
// Só funciona se a página tiver os elementos do carrossel
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

// Inicia o carregamento de tudo
loadEverything();

// Auto-play do carrossel (se existir na página)
setInterval(() => {
    if (document.getElementById('carousel-track')) {
        moveSlide(1);
    }
}, 5000);
