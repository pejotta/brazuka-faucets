const BRAZUKA_ADS = {
    // Listas de anúncios (pode colocar quantos códigos quiser)
    pools: {
        homeTop: [
            '<a href="https://www.coinpayu.com/?r=PejottaTG" target="_blank"><img title="Join coinpayu to earn!" alt="coinpayu" src="https://www.coinpayu.com/static/earners_banner/728X90.gif"></a>',
            '<a href="https://cryptoflare.net/?r=276959" target="_blank"><img src="https://cryptoflare.net/refbanner/728x90.gif" /></a>',
            '<a href="https://faucetcrypto.com/r/84889" target="_blank"><img src="https://faucetcrypto.com/img/banners/728x90_minimalist.gif" width="728" height="90"></a>',
            '<script src="//static.surfe.pro/js/net.js"></script><ins class="surfe-be" data-sid="418410"></ins><script>(adsurfebe = window.adsurfebe || []).push({});</script>'
        ],
        homeMid: [
            '<a href="https://freebitcoin.io/?ref=96687" target="_blank"><img src="https://freebitcoin.io/img/freebitcoin/banners/Banner728x90.jpg"></a>',
            '<a href="https://freebitco.in/?r=16898774" target="_blank"><img src="https://static1.freebitco.in/banners/728x90-3.png"></a>',            
            '<a href="https://cryptofaucet.watch?ref=2CZVL7h0wXXN" target="_blank"><img src="https://cryptofaucet.watch/images/banner-cryptofaucet.png" width="728" height="90"></a>'
        ],
        sidebar: [
            '<iframe src="https://ad2bitcoin.com/ad.php?ref=pejottatg&width=300" marginwidth="0" marginheight="0" width="300" height="250" scrolling="no" border="0" frameborder="0"></iframe>',
            '<a href="https://faucetpay.io/?r=31765" target="_blank"><img src="https://cdn.faucetpay.io/banners/gif/300x250.gif" alt="" width="300" height="250"/></a>',
            '<a href="https://viefaucet.com?r=64ccee302edd5e5772d58744" target="_blank"><img src="https://viefaucet.com/banners/300x250.gif" /></a>',
            '<a href="https://betfury.io/?r=LUCKYUser4777343" target="_blank"><img src="https://bfstatic.io/pictures/Box/gif/300x250.gif" alt="betfury.com" /></a>'
        ],
        pageGain: [
            '<div id="frame" style="width: 970px;margin: auto;z-index: 99998;height: auto"><iframe data-aa="2422990" src="//ad.a-ads.com/2422990/?size=970x250" style="border:0; padding:0; width:970px; height:250px; overflow:hidden;display: block;margin: auto"></iframe></div>'
        ],
        modalLeft: [
            '<a href="https://betfury.io/?r=LUCKYUser4777343" target="_blank"><img src="https://bfstatic.io/pictures/Box/gif/160x600.gif" alt="betfury.com" /></a>'
        ],
        modalRight: [
            '<a href="https://betfury.io/?r=LUCKYUser4777343" target="_blank"><img src="https://bfstatic.io/pictures/BFG/gif/160x600.gif" alt="betfury.com" /></a>'
        ],
        modalCenter: [
            '<a href="https://betboom.bet.br/registration/base/?referral_code=887efc52-8b5c-4ef6-99ed-f6155378625e" target="_blank"><img title="A sua SORTE está na BETBOOM.bet.br - Casa autorizada pelo Governo Federal" src="https://hojepr.com/wp-content/uploads/2024/06/fortune_tiger-jogo-do-tigrinho-gif-1.gif" alt="A sua SORTE está na BETBOOM.bet.br - Casa autorizada pelo Governo Federal"'
        ],
        pageCadastro: [
            '<a href="https://faucetpay.io/?r=31765" target="_blank"><img src="https://cdn.faucetpay.io/banners/gif/160x600.gif" width="160" height="600"/></a>'
        ]
    },

    render() {
        // Renderiza o Topo (Aleatório)
        this.injectRandom('.ad-slot-top', this.pools.homeTop);
        
        // Renderiza o Meio (Aleatório)
        this.injectRandom('.ad-slot-mid', this.pools.homeMid);

        // Renderiza a Sidebar (Aleatório)
        this.injectRandom('.ad-slot-sidebar', this.pools.sidebar);
        
        // Renderiza a página de Faucets e Shortlinks
        this.injectRandom('.ad-slot-pagegain', this.pools.pageGain);

        // Renderiza o Ad modal Esquerdo
        this.injectRandom('#ad-modal-left', this.pools.modalLeft);

        // Renderiza o Ad modal Direito
        this.injectRandom('#ad-modal-right', this.pools.modalRight);

        // Renderiza o Ad modal Central
        this.injectRandom('#ad-modal-center', this.pools.modalCenter);

         // Renderiza o Ad da Página de Cadastro
        this.injectRandom('.ad-slot-cadastro', this.pools.pageCadastro);
    },

    injectRandom(selector, adPool) {
        const slots = document.querySelectorAll(selector);
        if (slots.length === 0 || adPool.length === 0) return;

        slots.forEach(slot => {
            // Escolhe um anúncio aleatório da lista
            const randomIndex = Math.floor(Math.random() * adPool.length);
            const adContent = adPool[randomIndex];

            slot.innerHTML = `<span class="ad-label">Publicidade</span>` + adContent;

            // Re-executa scripts se houver
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

document.addEventListener('DOMContentLoaded', () => BRAZUKA_ADS.render());
