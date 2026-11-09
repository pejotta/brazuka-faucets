const BRAZUKA_ADS = {
    pools: {},

    async init() {
        try {
            // Busca os anúncios atualizados direto da Cloudflare Worker
            const response = await fetch("https://brazuka-faucets.moneynanet-yt.workers.dev/admin-get-ads");
            const data = await response.json();
            
            if (data && typeof data === 'object') {
                this.pools = data;
            }
        } catch (err) {
            console.error("Erro ao carregar anúncios da Worker, usando fallbacks vazios:", err);
            this.pools = {
                homeTop: [], homeMid: [], sidebar: [], pageGain: [],
                modalLeft: [], modalRight: [], modalCenter: [], pageCadastro: []
            };
        }

        this.render();
    },

    render() {
        // Renderiza o Topo (Aleatório)
        this.injectRandom('.ad-slot-top', this.pools.homeTop || []);
        
        // Renderiza o Meio (Aleatório)
        this.injectRandom('.ad-slot-mid', this.pools.homeMid || []);

        // Renderiza a Sidebar (Aleatório)
        this.injectRandom('.ad-slot-sidebar', this.pools.sidebar || []);
        
        // Renderiza a página de Faucets e Shortlinks
        this.injectRandom('.ad-slot-pagegain', this.pools.pageGain || []);

        // Renderiza o Ad modal Esquerdo
        this.injectRandom('#ad-modal-left', this.pools.modalLeft || []);

        // Renderiza o Ad modal Direito
        this.injectRandom('#ad-modal-right', this.pools.modalRight || []);

        // Renderiza o Ad modal Central
        this.injectRandom('#ad-modal-center', this.pools.modalCenter || []);

         // Renderiza o Ad da Página de Cadastro
        this.injectRandom('.ad-slot-cadastro', this.pools.pageCadastro || []);
    },

    injectRandom(selector, adPool) {
        const slots = document.querySelectorAll(selector);
        if (slots.length === 0 || !Array.isArray(adPool) || adPool.length === 0) return;

        slots.forEach(slot => {
            // Escolhe um anúncio aleatório da lista vinda do KV
            const randomIndex = Math.floor(Math.random() * adPool.length);
            const adContent = adPool[randomIndex];

            slot.innerHTML = `<span class="ad-label">Publicidade</span>` + adContent;

            // Re-executa scripts de anúncios se houver (como surfe.pro, etc.)
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

// Inicializa o gerenciador assim que o DOM carregar
document.addEventListener('DOMContentLoaded', () => BRAZUKA_ADS.init());
