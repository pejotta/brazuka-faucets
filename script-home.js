document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('faucets_data.json');
        const data = await response.json();

        // Lista de moedas que aparecem na Home
        const moedasHome = ['btc', 'eth', 'doge', 'trx', 'central'];

        moedasHome.forEach(moeda => {
            const container = document.getElementById(`grid-${moeda}`);
            if (!container) return;

            // Filtra as faucets dessa moeda e limita a 5 itens
            const filtered = data.filter(f => f.moeda === moeda).slice(0, 5);

            container.innerHTML = ''; // Limpa o "Carregando..."

            if (filtered.length === 0) {
                container.innerHTML = '<p style="color:#777; padding:10px;">Em breve novas faucets aqui!</p>';
                return;
            }

            filtered.forEach(faucet => {
                // --- LÓGICA DE TAGS (Destaque e Patrocinado) ---
                let tagsHTML = '';
                if (faucet.destaque === true || faucet.destaque === "true") {
                    tagsHTML += `<div class="tag-badge tag-destaque"><i class="fas fa-star"></i> Destaque</div>`;
                }
                if (faucet.patrocinado === true || faucet.patrocinado === "true") {
                    tagsHTML += `<div class="tag-badge tag-patrocinado"><i class="fas fa-ad"></i> Patrocinado</div>`;
                }

                // Pegamos a URL limpa para buscar o favicon
                const domain = faucet.url.replace(/^(https?:\/\/)/, '').split('/')[0];
                // API do Google para buscar Favicons
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

                const card = `
                    <a href="faucet.html?id=${faucet.id}" class="faucet-card">
                        ${tagsHTML}
                        <div class="faucet-icon">
                            <img src="${faviconUrl}" alt="${faucet.nome}" 
                                 style="width: 32px; height: 32px; border-radius: 4px;"
                                 onerror="this.src='https://api.iconify.design/cryptocurrency:${faucet.moeda}.svg'">
                        </div>
                        <div class="faucet-info">
                            <h3>${faucet.nome}</h3>
                            <p class="url">${domain}</p>
                        </div>
                        <span class="status-tag ${faucet.status}">
                            ${faucet.status === 'paying' ? 'Paga' : 'Análise'}
                        </span>
                    </a>
                `;
                container.innerHTML += card;
            });
        });
    } catch (error) {
        console.error("Erro na Home:", error);
    }
});

// Função auxiliar para ícones de moedas
function getIconTag(moeda) {
    const icons = {
        'btc': 'cryptocurrency:btc',
        'eth': 'cryptocurrency:eth',
        'doge': 'cryptocurrency:doge',
        'trx': 'cryptocurrency:trx',
        'central': 'fa6-solid:building-columns'
    };
    const iconName = icons[moeda] || 'fa6-solid:wallet';
    return `<iconify-icon icon="${iconName}" style="font-size: 30px; color: #1a73e8;"></iconify-icon>`;
}
