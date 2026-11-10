// script-global.js - O Zelador do Portal (Versão Ultra Clean)

async function loadEverything() {
    // 1. Configura a identidade visual
    setFavicon();
    
    // 2. Carrega o Header/Menu
    await loadTemplate('menu_template.html', 'header-placeholder', 'afterbegin');
    initMobileMenu();
    
    // ANALISTA: Chama o ticker SÓ DEPOIS que o menu_template foi injetado
    carregarTicker(); 

    // 3. Carrega o Footer e inicia os Widgets
    await loadTemplate('footer_template.html', 'footer-placeholder', 'beforeend');
    initFooterWidgets();
}

// ÚNICA E CORRETA FUNÇÃO DO TICKER (Puxando do Banco de Dados Cloudflare)
async function carregarTicker() {
    const tickerTrack = document.getElementById('ticker-track');
    
    // Se o elemento não existir na página atual, aborta de forma segura sem quebrar o console
    if (!tickerTrack) return;

    try {
        const response = await fetch("https://brazuka-faucets.moneynanet-yt.workers.dev/admin-get-ticker");
        if (!response.ok) throw new Error("Erro de rede ao buscar ticker");

        const data = await response.json();
        const mensagens = data.mensagensFixas || [];

        if (mensagens.length === 0) {
            tickerTrack.innerHTML = '<span class="ticker-item">Nenhum aviso no momento.</span>';
            return;
        }

        tickerTrack.innerHTML = ''; 

        // Multiplicamos a lista para o scroll ser fluido e infinito
        const listaExibicao = [...mensagens, ...mensagens, ...mensagens];

        listaExibicao.forEach(item => {
            const link = document.createElement('a');
            link.href = item.link || "#";
            link.className = 'ticker-item';
            link.target = "_blank";
            
            let icone = "fa-bullhorn";
            if (item.title && item.title.includes("🔥")) icone = "fa-fire";
            else if (item.title && item.title.includes("🏆")) icone = "fa-trophy";
            else if (item.title && item.title.includes("💡")) icone = "fa-lightbulb";

            link.innerHTML = `<i class="fa-solid ${icone}" style="font-size: 10px; margin-right: 8px; color: #1a73e8;"></i> ${item.title}`;
            tickerTrack.appendChild(link);
        });
    } catch (e) {
        console.warn("Aviso do Ticker (usando fallback local ou aguardando conexão):", e);
    }
}

// Garante que só roda após o DOM carregar completamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregarTicker);
} else {
    carregarTicker();
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
            if (icon) {
                if (nav.classList.contains('active')) {
                    icon.classList.replace('fa-bars', 'fa-xmark');
                } else {
                    icon.classList.replace('fa-xmark', 'fa-bars');
                }
            }
        });
    }
}

// --- Ajuste do Favicon ---
function setFavicon() {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
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
    localStorage.setItem('brazuka_ref', ref);
    console.log("Padrinho detectado e salvo:", ref);
}

// Função para registrar o clique na Cloudflare Worker (Analytics)
function registrarClique(tipo, identificador) {
    fetch("https://brazuka-faucets.moneynanet-yt.workers.dev/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tipo, id: identificador })
    }).catch(err => console.log("Erro ao registrar analytics:", err));
}
