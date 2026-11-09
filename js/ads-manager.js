/**
 * BRAZUKA ADS MANAGER
 * Gerenciador de Publicidade de Alta Performance
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

        this.injectRandom('.ad-slot-top', this.pools.homeTop || [], 'homeTop');
        this.injectRandom('.ad-slot-mid', this.pools.homeMid || [], 'homeMid');
        this.injectRandom('.ad-slot-sidebar', this.pools.sidebar || [], 'sidebar');
        this.injectRandom('.ad-slot-pagegain', this.pools.pageGain || [], 'pageGain');
        this.injectRandom('#ad-modal-left', this.pools.modalLeft || [], 'modalLeft');
        this.injectRandom('#ad-modal-right', this.pools.modalRight || [], 'modalRight');
        this.injectRandom('#ad-modal-center', this.pools.modalCenter || [], 'modalCenter');
        this.injectRandom('.ad-slot-cadastro', this.pools.pageCadastro || [], 'pageCadastro');
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
    }
};

// Executa a inicialização de forma ultra-rápida
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BRAZUKA_ADS.init());
} else {
    BRAZUKA_ADS.init();
}
