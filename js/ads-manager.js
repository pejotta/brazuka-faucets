/**
 * BRAZUKA ADS MANAGER
 * Gerenciador de Publicidade de Alta Performance - Versão Segmentada
 */

const BRAZUKA_ADS = {
    pools: {},
    CACHE_KEY: 'brazuka_ads_cache',
    URL_WORKER: 'https://brazuka-faucets.moneynanet-yt.workers.dev/admin-get-ads',

    async init() {
        // 1. Tenta carregar do cache local imediatamente para zero espera
        const cachedAds = localStorage.getItem(this.CACHE_KEY);
        if (cachedAds) {
            try {
                this.pools = JSON.parse(cachedAds);
                this.render(); // Renderiza na hora com os dados salvos no cache!
            } catch (e) {
                console.error("Erro ao ler cache de ads", e);
            }
        }

        // 2. Busca a versão atualizada em segundo plano sem bloquear a tela (Background Sync)
        this.fetchFreshAds();
    },

    async fetchFreshAds() {
        try {
            // Controller de timeout de 2.5s para nunca travar a navegação do usuário
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const response = await fetch(this.URL_WORKER, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data && typeof data === 'object') {
                    // Atualiza o cache local
                    localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));

                    // Atualiza as pools e renderiza caso estivesse vazio
                    if (Object.keys(this.pools).length === 0) {
                        this.pools = data;
                        this.render();
                    }
                }
            }
        } catch (err) {
            console.warn("Aviso: Requisição de Ads expirou ou falhou. Usando cache/fallback local.", err);
        }
    },

    render() {
        if (!this.pools) return;

        // --- BANNERS DA HOME PAGE (SEGMENTADOS POR NICHO) ---
        this.injectCarousel('#carousel-track', this.pools.heroCarousel || []);
        this.injectRandom('#ad-zone-home-top', this.pools.homeTop || [], 'homeTop');
        this.injectRandom('#ad-zone-home-btc-eth', this.pools.homeBtcEth || [], 'homeBtcEth');
        this.injectRandom('#ad-zone-home-doge-trx', this.pools.homeDogeTrx || [], 'homeDogeTrx');
        this.injectRandom('#ad-zone-home-central-auto', this.pools.homeCentralAuto || [], 'homeCentralAuto');
        this.injectRandom('#ad-zone-home-miner-bet', this.pools.homeMinerBet || [], 'homeMinerBet');
        this.injectRandom('#ad-zone-home-airdrop-ipo', this.pools.homeAirdropIpo || [], 'homeAirdropIpo');

        // --- BANNERS DE PÁGINAS ESPECÍFICAS / RETÂNGULOS E SKYSCRAPERS EXCLUSIVOS ---
        this.injectRandom('.ad-slot-cadastro', this.pools.pageCadastro || [], 'pageCadastro');
        this.injectRandom('.ad-slot-sidebar-trx', this.pools.sidebarTrx || [], 'sidebarTrx');
        this.injectRandom('.ad-slot-sidebar-ton', this.pools.sidebarTon || [], 'sidebarTon');
        this.injectRandom('.ad-slot-ficha-tecnica', this.pools.fichaTecnica || [], 'fichaTecnica');
        
        // Novos slots de Retângulo Médio (300x250) específicos para TRX e TON
        this.injectRandom('.ad-slot-ficha-tecnica-trx', this.pools.fichaTecnicaTrx || [], 'fichaTecnicaTrx');
        this.injectRandom('.ad-slot-ficha-tecnica-ton', this.pools.fichaTecnicaTon || [], 'fichaTecnicaTon');
        
        // Compatibilidade com seletores genéricos antigos
        this.injectRandom('.ad-slot-top', this.pools.homeTop || [], 'homeTop');
    },

    injectRandom(selector, adPool, slotName) {
        const slots = document.querySelectorAll(selector);
        if (slots.length === 0 || !Array.isArray(adPool) || adPool.length === 0) return;

        slots.forEach(slot => {
            const randomIndex = Math.floor(Math.random() * adPool.length);
            const adContent = adPool[randomIndex];

            slot.innerHTML = `<span class="ad-label">Publicidade</span>` + adContent;

            // Rastreia cliques automaticamente no Analytics
            slot.addEventListener('click', () => {
                if (typeof registrarClique === 'function') {
                    registrarClique('banner', slotName);
                }
            });

            // Re-executa scripts de anúncios se houver
            const scripts = slot.querySelectorAll("script");
            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        });
    },

    injectCarousel(selector, slidesArray) {
        const track = document.querySelector(selector);
        if (!track) return;

        if (!slidesArray || slidesArray.length === 0) {
            track.innerHTML = '<p style="color:#fff; text-align:center; padding:20px;">Nenhum slide cadastrado no painel.</p>';
            return;
        }

        // Injeta os slides salvos no Banco de Dados
        track.innerHTML = slidesArray.map((slideHtml, index) => {
            if (index === 0) {
                return slideHtml.replace('class="slide"', 'class="slide active"');
            }
            return slideHtml;
        }).join('');

        // Reinicia o script de movimento do carrossel se necessário
        if (typeof initCarousel === 'function') {
            initCarousel();
        }
    }
};

// Executa a inicialização de forma ultra-rápida
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BRAZUKA_ADS.init());
} else {
    BRAZUKA_ADS.init();
}
