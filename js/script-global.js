// script-global.js - O Zelador do Portal (Versão Ultra Clean)

async function loadEverything() {
    // 1. Configura a identidade visual
    setFavicon();
    
    // 2. Carrega o Header/Menu
    await loadTemplate('menu_template.html', 'header-placeholder', 'afterbegin');
    initMobileMenu();
    
    // ANALISTA: Chama o ticker SÓ DEPOIS que o menu_template foi injetado [cite: 2026-01-02]
    carregarTicker(); 

    // 3. Carrega o Footer e inicia os Widgets
    await loadTemplate('footer_template.html', 'footer-placeholder', 'beforeend');
    initFooterWidgets();
}

function initFooterWidgets() {
    // --- LÓGICA DO GOOGLE TRANSLATE ---
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'pt', 
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
    };

    const gtScript = document.createElement('script');
    gtScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(gtScript);

    // --- LÓGICA DO WHOS AMUNG US ---
    const wauPlaceholder = document.getElementById('wau-placeholder');
    if (wauPlaceholder) {
        window._wau = window._wau || [];
        window._wau.push(["classic", "z19kbip6mo", "tqi"]);

        const wauScript = document.createElement('script');
        wauScript.src = "https://waust.at/c.js";
        wauScript.async = true;
        wauPlaceholder.appendChild(wauScript);
    }
}

// Função auxiliar para carregar arquivos HTML externos
async function loadTemplate(file, id, position) {
    try {
        // Cache busting para templates também, para evitar menus antigos
        const res = await fetch(`${file}?v=${new Date().getTime()}`);
        if (!res.ok) throw new Error(`Arquivo ${file} não encontrado`);
        const html = await res.text();
        const placeholder = document.getElementById(id);
        
        if (placeholder) {
            placeholder.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML(position, html);
        }
    } catch (e) { 
        console.error(`Erro ao carregar template (${file}):`, e); 
    }
}

// Inicialização do Menu Mobile (Sanduíche)
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu');
    const nav = document.getElementById('navbar');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nav.classList.toggle('active');
            
            const icon = menuBtn.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });
    }
}

// --- Ajuste do Favicon (Onde o filho chora e a mãe não vê) ---
function setFavicon() {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    // Corrigido: Estava 'assets/assets/logo-brazuka.png'
    link.href = 'assets/logo-brazuka.png'; 
}

// --- LÓGICA DO CARROSSEL ---
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

// Auto-play do carrossel
setInterval(() => {
    if (document.getElementById('carousel-track')) {
        moveSlide(1);
    }
}, 15000);

// Função SEO
function atualizarSEO(titulo, descricao) {
    document.title = titulo + " | Brazuka Faucets";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
    }
    metaDescription.content = descricao;
}

// Execução de SEO por página
if (window.location.pathname.includes("cadastrar")) {
    atualizarSEO("Cadastrar Faucet", "Envie sua faucet para o Brazuka Faucets.");
} else if (window.location.pathname.includes("anuncie")) {
    atualizarSEO("Anuncie Conosco", "Anuncie no Brazuka Faucets.");
}

// ANALISTA: Captura o padrinho pela URL (?ref=email@faucetpay.com)
const urlParams = new URLSearchParams(window.location.search);
const ref = urlParams.get('ref');

if (ref) {
    // Salva no navegador do novo usuário para usar no momento do claim
    localStorage.setItem('brazuka_ref', ref);
    console.log("Padrinho detectado e salvo:", ref);
}
function carregarTicker() {
    const tickerTrack = document.getElementById('ticker-track');
    // Se não achar o elemento ou os dados, para aqui sem erro
    if (!tickerTrack || typeof TICKER_CONFIG === 'undefined') return;

    // Pega as mensagens do seu mural (ticker-data.js)
    const mensagens = TICKER_CONFIG.mensagensFixas;

    if (mensagens.length === 0) return;

    tickerTrack.innerHTML = ''; 

    // ANALISTA: Multiplicamos a lista para o scroll ser fluido e infinito
    const listaExibicao = [...mensagens, ...mensagens, ...mensagens];

    listaExibicao.forEach(item => {
        const link = document.createElement('a');
        link.href = item.link;
        link.className = 'ticker-item';
        
        // Mantive a lógica de ícone: se tiver fogo ou troféu no texto, ele destaca
        let icone = "fa-bullhorn";
        if (item.title.includes("🔥")) icone = "fa-fire";
        if (item.title.includes("🏆")) icone = "fa-trophy";
        if (item.title.includes("💡")) icone = "fa-lightbulb";

        link.innerHTML = `<i class="fa-solid ${icone}" style="font-size: 10px; margin-right: 8px; color: #1a73e8;"></i> ${item.title}`;
        tickerTrack.appendChild(link);
    });
}
