/**
 * Brazuka Faucets - Widget de Alertas Flutuantes Inteligentes
 */
(function() {
    const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";
    let originalTitle = document.title;
    let blinkInterval = null;

    // Injeta o HTML básico do widget na página dinamicamente
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

        // Adiciona o CSS leve direto para garantir estilo consistente
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

        // Eventos de clique e fechar
        document.getElementById('bz-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            fecharAlerta();
        });
    }

    function mostrarAlerta(titulo, texto, linkDestino) {
        injetarHTMLWidget();
        const cardBox = document.getElementById('brazuka-alert'); // Ajustado para o ID correto
        const titleEl = document.getElementById('bz-alert-title');
        const textEl = document.getElementById('bz-alert-text');
        const widgetContainer = document.getElementById('brazuka-floating-alert');
        const cardCard = document.getElementById('bz-alert-box');

        if (!widgetContainer) return;

        titleEl.textContent = titulo;
        textEl.textContent = texto;

        // Ação de clique no card leva para o link configurado
        cardCard.onclick = (e) => {
            if (e.target.id === 'bz-close-btn') return;
            if (linkDestino) window.location.href = linkDestino;
        };

        // Exibe o card com animação
        setTimeout(() => {
            widgetContainer.classList.add('show');
            iniciarPiscarAba(titulo);
        }, 1000); // Aparece 1 segundo após carregar a página
    }

    function fecharAlerta() {
        const widgetContainer = document.getElementById('brazuka-floating-alert');
        if (widgetContainer) {
            widgetContainer.classList.remove('show');
        }
        pararPiscarAba();
        // Salva no localStorage para não importunar o usuário toda hora
        localStorage.setItem('bz_alert_dismissed', 'true');
    }

    // Efeito de aba piscando (Social Bar style)
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

    // Inicializador
    document.addEventListener('DOMContentLoaded', async () => {
        // Se o usuário já fechou recentemente, não exibe
        if (localStorage.getItem('bz_alert_dismissed') === 'true') return;

        try {
            // Busca o alerta ativo do Worker (ou da última faucet cadastrada)
            const res = await fetch(`${WORKER_URL}/get-all-faucets`);
            const faucets = await res.json();

            if (faucets && faucets.length > 0) {
                // Pega a última faucet adicionada automaticamente como alerta nativo do sistema
                const ultima = faucets[faucets.length - 1];
                
                // Exemplo de disparo inteligente combinando automação + admin
                setTimeout(() => {
                    mostrarAlerta(
                        "🔥 Nova Oportunidade!", 
                        `A faucet "${ultima.nome}" acabou de ser adicionada. Venha conferir!`, 
                        `faucet.html?id=${ultima.id}`
                    );
                }, 4000); // 4 segundos de navegação
            }
        } catch (e) {
            console.log("Sistema de alertas em modo de espera...");
        }
    });
})();
