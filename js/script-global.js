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


// =========================================================================
// 🚀 MÓDULO ISOLADO: WIDGET DE ALERTAS FLUTUANTES INTELIGENTES
// =========================================================================
(function() {
    const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";
    let originalTitle = document.title;
    let blinkInterval = null;

    function injetarHTMLWidget() {
        if (document.getElementById('brazuka-floating-alert')) return;

        const div = document.createElement('div');
        div.id = 'brazuka-floating-alert';
        div.innerHTML = `
            <div class="bz-alert-card" id="bz-alert-box">
                <div class="bz-alert-icon">
                    <img src="assets/logo-brazuka.png" alt="Brazuka">
                </div>
                <div class="bz-alert-content">
                    <h4 id="bz-alert-title">Carregando...</h4>
                    <p id="bz-alert-text">...</p>
                </div>
                <button class="bz-alert-close" id="bz-close-btn">×</button>
            </div>
        `;
        document.body.appendChild(div);

        const style = document.createElement('style');
        style.innerHTML = `
            #brazuka-floating-alert {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 2147483646;
                font-family: inherit;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
                transform: translateY(120px);
                opacity: 0;
                pointer-events: none;
            }
            #brazuka-floating-alert.show {
                transform: translateY(0);
                opacity: 1;
                pointer-events: auto;
            }
            .bz-alert-card {
                background: var(--bg-card, #1a1a2e);
                color: var(--text-color, #fff);
                border: 1px solid rgba(26, 115, 232, 0.4);
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                border-radius: 14px;
                padding: 14px 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 320px;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            .bz-alert-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; width: 4px; height: 100%;
                background: #1a73e8;
            }
            .bz-alert-icon img {
                width: 36px;
                height: 36px;
                object-fit: contain;
                border-radius: 50%;
            }
            .bz-alert-content {
                flex: 1;
            }
            .bz-alert-content h4 {
                font-size: 0.9rem;
                margin: 0 0 3px 0;
                font-weight: 700;
                color: #f39c12;
            }
            .bz-alert-content p {
                font-size: 0.78rem;
                margin: 0;
                color: #ccc;
                line-height: 1.3;
            }
            .bz-alert-close {
                background: transparent;
                border: none;
                color: #aaa;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0 4px;
                transition: color 0.2s;
            }
            .bz-alert-close:hover {
                color: #fff;
            }
        `;
        document.head.appendChild(style);

        document.getElementById('bz-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            fecharAlerta();
        });
    }

    function mostrarAlerta(titulo, texto, linkDestino, alertId) {
        injetarHTMLWidget();
        
        const dismissedId = localStorage.getItem('bz_dismissed_alert_id');
        if (dismissedId === String(alertId)) return;

        const titleEl = document.getElementById('bz-alert-title');
        const textEl = document.getElementById('bz-alert-text');
        const widgetContainer = document.getElementById('brazuka-floating-alert');
        const cardCard = document.getElementById('bz-alert-box');

        if (!widgetContainer) return;

        titleEl.textContent = titulo;
        textEl.textContent = texto;

        cardCard.onclick = (e) => {
            if (e.target.id === 'bz-close-btn') return;
            localStorage.setItem('bz_dismissed_alert_id', String(alertId));
            if (linkDestino) window.location.href = linkDestino;
        };

        widgetContainer.setAttribute('data-current-id', alertId);

        setTimeout(() => {
            widgetContainer.classList.add('show');
            iniciarPiscarAba(titulo);
        }, 2500);
    }

    function fecharAlerta() {
        const widgetContainer = document.getElementById('brazuka-floating-alert');
        if (widgetContainer) {
            widgetContainer.classList.remove('show');
            const currentId = widgetContainer.getAttribute('data-current-id');
            if (currentId) {
                localStorage.setItem('bz_dismissed_alert_id', currentId);
            }
        }
        pararPiscarAba();
    }

    function iniciarPiscarAba(avisoTitulo) {
        let state = false;
        window.addEventListener('blur', () => {
            if (blinkInterval) return;
            blinkInterval = setInterval(() => {
                document.title = state ? `🔔 (1) ${avisoTitulo}` : originalTitle;
                state = !state;
            }, 2000);
        });

        window.addEventListener('focus', () => {
            pararPiscarAba();
        });
    }

    function pararPiscarAba() {
        if (blinkInterval) {
            clearInterval(blinkInterval);
            blinkInterval = null;
        }
        document.title = originalTitle;
    }

    // Disparador isolado com IIFE (roda de forma independente sem mexer no carregamento principal)
    async function initAlerts() {
        try {
            const resAlert = await fetch(`${WORKER_URL}/get-active-alert`);
            const alertaAdmin = await resAlert.json();

            if (alertaAdmin && alertaAdmin.ativo) {
                const alertId = alertaAdmin.titulo || "admin_manual";
                mostrarAlerta(alertaAdmin.titulo, alertaAdmin.texto, alertaAdmin.link, alertId);
            } else {
                const resFaucets = await fetch(`${WORKER_URL}/get-all-faucets`);
                const faucets = await resFaucets.json();
                if (faucets && faucets.length > 0) {
                    const ultima = faucets[faucets.length - 1];
                    const alertId = `faucet_${ultima.id || ultima.nome}`;
                    mostrarAlerta(
                        "🔥 Nova Oportunidade!", 
                        `A faucet "${ultima.nome}" acabou de ser adicionada. Venha conferir!`, 
                        `faucet.html?id=${ultima.id}`,
                        alertId
                    );
                }
            }
        } catch (e) {
            console.log("Módulo de alertas aguardando rede...");
        }
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initAlerts);
    } else {
        initAlerts();
    }
})();

// --- INÍCIO DO MÓDULO DE LGPD E COOKIES ---
document.addEventListener("DOMContentLoaded", function() {
    // 1. Injeta o HTML do Banner de Cookies no final do corpo da página automaticamente se não existir
    if (!document.getElementById('brazuka-cookie-banner')) {
        const bannerHTML = `
            <div id="brazuka-cookie-banner" style="display: none; position: fixed; bottom: 0; left: 0; width: 100%; background: var(--card-bg, #161b22); color: var(--text-color, #e0e6ed); border-top: 1px solid var(--card-border, #30363d); padding: 20px; z-index: 99999; box-shadow: 0 -5px 25px rgba(0,0,0,0.3); font-family: 'Barlow', sans-serif; box-sizing: border-box;">
                <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 280px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 1.1rem; color: var(--primary, #1a73e8);"><i class="fa-solid fa-shield-halved"></i> Sua Privacidade & Cookies</h4>
                        <p style="margin: 0; font-size: 0.9rem; line-height: 1.5; opacity: 0.85;">
                            Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, analisar tráfego e exibir anúncios personalizados. Você pode gerenciar suas preferências a qualquer momento.
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                        <button onclick="salvarPreferenciasCookies('parcial')" style="background: transparent; color: var(--text-color); border: 1px solid var(--card-border, #555); padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: 0.3s;">
                            Apenas Essenciais
                        </button>
                        <button onclick="salvarPreferenciasCookies('tudo')" style="background: var(--primary, #1a73e8); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.85rem; transition: 0.3s;">
                            Aceitar Todos
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
    }

    // 2. Verifica se o usuário já consentiu
    const consentimento = localStorage.getItem('brazuka_consentimento_cookies');
    const banner = document.getElementById('brazuka-cookie-banner');
    if (!consentimento && banner) {
        banner.style.display = 'block';
    }
});

function salvarPreferenciasCookies(tipo) {
    localStorage.setItem('brazuka_consentimento_cookies', tipo);
    localStorage.setItem('brazuka_consentimento_data', new Date().toISOString());
    
    const banner = document.getElementById('brazuka-cookie-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}

function abrirPainelPrivacidade() {
    let escolhaAtual = localStorage.getItem('brazuka_consentimento_cookies') || 'Não definido';
    let acao = prompt(`Gerenciar Privacidade - Brazuka Faucets\n\nStatus atual: ${escolhaAtual.toUpperCase()}\n\nDigite:\n1 - Aceitar Todos os Cookies\n2 - Permitir Apenas Essenciais\n3 - Limpar/Revogar meus dados`, "1");
    
    if (acao === "1") {
        salvarPreferenciasCookies('tudo');
        alert("✅ Preferências atualizadas: Todos os cookies aceitos!");
    } else if (acao === "2") {
        salvarPreferenciasCookies('parcial');
        alert("✅ Preferências atualizadas: Apenas essenciais.");
    } else if (acao === "3") {
        if (confirm("Tem certeza que deseja limpar suas preferências de cookies salvas?")) {
            localStorage.removeItem('brazuka_consentimento_cookies');
            localStorage.removeItem('brazuka_consentimento_data');
            alert("🗑️ Dados limpos. Atualize a página para ver o banner novamente.");
            location.reload();
        }
    }
}
// --- FIM DO MÓDULO DE LGPD E COOKIES ---
