// brazuka-ad-engine.js

const BRAZUKA_ADS = {
    // Aqui você cola os códigos que as redes te dão
    config: {
        topBanner: {
            type: "html", // Pode ser "html" ou "image"
            content: `<a target="_blank" href="https://faucetcrypto.com/r/84889"><img src="https://faucetcrypto.com/img/banners/728x90_minimalist.gif" width="728" height="90"></a>`,
            active: true
        },
        sidebarBanner: {
            type: "image", // Para banners que você mesmo criou ou de afiliados diretos
            img: "https://blog.encurta.net/wp-content/uploads/2017/07/336x280.png",
            link: "https://encurta.net/ref/103238836015601144211",
            active: true
        }
    },

    render() {
        // Renderiza nos slots do Topo
        this.injectAds('.ad-slot-top', this.config.topBanner);
        
        // Renderiza nos slots da Sidebar
        this.injectAds('.ad-slot-sidebar', this.config.sidebarBanner);
    },

    injectAds(selector, adConfig) {
        if (!adConfig.active) return;

        const slots = document.querySelectorAll(selector);
        slots.forEach(slot => {
            slot.innerHTML = `<span class="ad-label">Publicidade</span>`;

            if (adConfig.type === "image") {
                // Caso simples: Imagem + Link
                slot.innerHTML += `
                    <a href="${adConfig.link}" target="_blank">
                        <img src="${adConfig.img}" style="max-width:100%; height:auto; border-radius:8px;">
                    </a>`;
            } else if (adConfig.type === "html") {
                // Caso Network: Injeta o HTML e força a execução dos scripts
                const container = document.createElement('div');
                container.innerHTML = adConfig.content;
                slot.appendChild(container);

                // Truque para carregar scripts externos das redes de Ads
                const scripts = container.querySelectorAll("script");
                scripts.forEach(oldScript => {
                    const newScript = document.createElement("script");
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => BRAZUKA_ADS.render());
