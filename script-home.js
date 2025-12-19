// script-home.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('faucets_data.json');
        const data = await response.json();

        // Lista de moedas que queremos mostrar na Home
        const moedasHome = ['btc', 'eth', 'doge'];

        moedasHome.forEach(moeda => {
            const container = document.getElementById(`grid-${moeda}`);
            if (!container) return;

            // Filtra apenas 5 faucets dessa moeda
            const filtered = data.filter(f => f.moeda === moeda).slice(0, 5);

            container.innerHTML = ''; // Limpa o carregando

            filtered.forEach(faucet => {
                const card = `
                    <a href="faucet_page_template.html?id=${faucet.id}" class="faucet-card">
                        <div class="faucet-icon"><i class="fa-brands fa-${faucet.moeda}"></i></div>
                        <div class="faucet-info">
                            <h3>${faucet.nome}</h3>
                            <p class="url">${faucet.url.replace(/^(https?:\/\/)/, '').split('/')[0]}</p>
                        </div>
                        <span class="status-tag ${faucet.status}">${faucet.status === 'paying' ? 'Paga' : 'Obs'}</span>
                    </a>
                `;
                container.innerHTML += card;
            });
        });
    } catch (error) {
        console.error("Erro na Home:", error);
    }
});
