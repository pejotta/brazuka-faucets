const moedas = [
    { nome: 'Bitcoin', sigla: 'btc', icon: 'fa-brands fa-btc' },
    { nome: 'Ethereum', sigla: 'eth', icon: 'fa-brands fa-ethereum' },
    { nome: 'Dogecoin', sigla: 'doge', icon: 'fa-solid fa-dog' },
    { nome: 'Litecoin', sigla: 'ltc', icon: 'fa-solid fa-coins' },
    { nome: 'Tron', sigla: 'trx', icon: 'fa-solid fa-gem' },
    { nome: 'Solana', sigla: 'sol', icon: 'fa-solid fa-bolt' },
    { nome: 'Binance Coin', sigla: 'bnb', icon: 'fa-solid fa-wallet' },
    { nome: 'Tether', sigla: 'usdt', icon: 'fa-solid fa-dollar-sign' },
    { nome: 'Polygon', sigla: 'matic', icon: 'fa-solid fa-layer-group' },
    { nome: 'Feyorra', sigla: 'fey', icon: 'fa-solid fa-fire' },
    { nome: 'Dash', sigla: 'dash', icon: 'fa-solid fa-bolt-lightning' },
    { nome: 'ZCash', sigla: 'zec', icon: 'fa-solid fa-shield' }
    // Pejotta, é só ir adicionando o resto das 35 moedas aqui seguindo o padrão!
];

function renderCoins() {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;

    grid.innerHTML = moedas.map(m => `
        <a href="list-${m.sigla}.html" class="coin-item">
            <i class="${m.icon}"></i>
            <span>${m.nome}</span>
        </a>
    `).join('');
}

renderCoins();
