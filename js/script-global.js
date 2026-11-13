/**
 * script-global.js - O Zelador do Portal (Versão Ultra Clean & Blindada)
 */

async function loadEverything() {
    // 1. Configura a identidade visual
    setFavicon();
    
    // 2. Carrega o Header/Menu e inicializa o tema logo em seguida
    await loadTemplate('menu_template.html', 'header-placeholder', 'afterbegin');
    initMobileMenu();
    initThemeToggle(); // <--- CHAMA AQUI PARA GARANTIR QUE O BOTÃO JÁ EXISTE NO DOM
    
    // ANALISTA: Chama o ticker SÓ DEPOIS que o menu_template foi injetado
    carregarTicker(); 

    // 3. Carrega o Footer e inicia os Widgets
    await loadTemplate('footer_template.html', 'footer-placeholder', 'beforeend');
    initFooterWidgets();

    // Atualiza o ano do rodapé após o template ser injetado com sucesso
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// --- FUNÇÃO BLINDADA DO MODO ESCURO ---
function initThemeToggle() {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const htmlElement = document.documentElement;

    // Restaura o tema salvo anteriormente
    const savedTheme = localStorage.getItem("brazuka_theme") || "light";
    if (savedTheme === "dark") {
        htmlElement.setAttribute("data-theme", "dark");
        if (themeIcon) themeIcon.className = "fas fa-sun";
    }

    // Alterna ao clicar (garantindo que o botão existe)
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = htmlElement.getAttribute("data-theme");
            if (currentTheme === "dark") {
                htmlElement.removeAttribute("data-theme");
                localStorage.setItem("brazuka_theme", "light");
                if (themeIcon) themeIcon.className = "fas fa-moon";
            } else {
                htmlElement.setAttribute("data-theme", "dark");
                localStorage.setItem("brazuka_theme", "dark");
                if (themeIcon) themeIcon.className = "fas fa-sun";
            }
        });
    }
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

function copiarChaveDoacao(tipoMoeda, tooltipId, btnElement) {
    const chaves = {
        'btc': 'eupaulojhonatan@bipa.app',
        'doge': 'DNeV9iAkw2K5WofPehfz1GAwwHyCSKYxaq',
        'trx': 'TMRVmB5b5zp3ormTeuhsbwUiUH2eyndPMh',
        'pix': 'paulo.tan@hotmail.com'
    };

    const textoParaCopiar = chaves[tipoMoeda];
    const tooltipElement = document.getElementById(tooltipId);

    if (!textoParaCopiar) return;

    const tempEl = document.createElement('textarea');
    tempEl.value = textoParaCopiar;
    tempEl.setAttribute('readonly', '');
    tempEl.style.position = 'fixed';
    tempEl.style.opacity = '0';
    document.body.appendChild(tempEl);
    
    tempEl.select();
    tempEl.setSelectionRange(0, 99999);

    let copiado = false;
    try {
        copiado = document.execCommand('copy');
    } catch (e) {
        console.error("Erro no execCommand", e);
    }

    document.body.removeChild(tempEl);

    if (!copiado && navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textoParaCopiar).then(() => {
            dispararFeedbackCopia(btnElement, tooltipElement);
        }).catch(err => {
            console.error("Clipboard API falhou:", err);
            alert("Erro ao copiar. Copie manualmente: " + textoParaCopiar);
        });
    } else if (copiado) {
        dispararFeedbackCopia(btnElement, tooltipElement);
    } else {
        alert("Erro ao copiar. Copie manualmente: " + textoParaCopiar);
    }
}

function dispararFeedbackCopia(btnElement, tooltipElement) {
    const iconeOriginal = btnElement.innerHTML;

    btnElement.innerHTML = '<i class="fa-solid fa-check" style="color: #27ae60;"></i>';
    btnElement.style.background = '#e8f8f5';

    if (tooltipElement) {
        tooltipElement.classList.add('show');
    }

    setTimeout(() => {
        btnElement.innerHTML = iconeOriginal;
        btnElement.style.background = '';
        if (tooltipElement) {
            tooltipElement.classList.remove('show');
        }
    }, 2000);
}
