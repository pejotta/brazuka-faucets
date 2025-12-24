// script-global.js - O Zelador do Portal (Atualizado)

async function loadEverything() {
    setFavicon();
    
    await loadTemplate('menu_template.html', 'header-placeholder', 'afterbegin');
    initMobileMenu();

    // 1. Carrega o footer
    await loadTemplate('footer_template.html', 'footer-placeholder', 'beforeend');
    
    // 2. AGORA SIM: Liga os widgets que estavam "desligados"
    initFooterWidgets();

    loadAd('top-ad-placeholder', 'top_ad.html');
    loadAd('bottom-ad-placeholder', 'bottom_ad.html');
}

function initFooterWidgets() {
    // --- LÓGICA DO GOOGLE TRANSLATE ---
    // Definimos a função de inicialização na janela global
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'pt', 
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
    };

    // Criamos o script do Google e injetamos no corpo da página
    const gtScript = document.createElement('script');
    gtScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(gtScript);

    // --- LÓGICA DO WHOS AMUNG US ---
    const wauPlaceholder = document.getElementById('wau-placeholder');
    if (wauPlaceholder) {
        // Configuramos a variável do widget
        window._wau = window._wau || [];
        window._wau.push(["classic", "z19kbip6mo", "tqi"]);

        // Criamos o script do contador
        const wauScript = document.createElement('script');
        wauScript.src = "https://waust.at/c.js";
        wauScript.async = true;
        wauPlaceholder.appendChild(wauScript);
    }
}

// ... restante das suas funções (loadTemplate, initMobileMenu, etc) ...

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
            
            // Troca o ícone de bars para X
            const icon = menuBtn.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });
    } else {
        // Log para te ajudar a debugar se o ID sumir
        console.warn("Aviso: Elementos do menu mobile não encontrados no DOM.");
    }
}

// --- Funções Auxiliares (Favicon e Ads) ---
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
            if (res.ok) {
                const html = await res.text();
                el.innerHTML = html;
            }
        } catch (e) { 
            console.error(`Erro ao carregar Ad ${file}:`, e); 
        }
    }
}

// --- Lógica do Carrossel ---
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
