const moedas = [
    { nome: 'Bitcoin', sigla: 'btc', icon: 'cryptocurrency:btc' },
    { nome: 'Ethereum', sigla: 'eth', icon: 'cryptocurrency:eth' },
    { nome: 'Dogecoin', sigla: 'doge', icon: 'cryptocurrency:doge' },
    { nome: 'Litecoin', sigla: 'ltc', icon: 'cryptocurrency:ltc' },
    { nome: 'Tron', sigla: 'trx', icon: 'cryptocurrency:trx' },
    { nome: 'Solana', sigla: 'sol', icon: 'cryptocurrency:sol' },
    { nome: 'Binance Coin', sigla: 'bnb', icon: 'cryptocurrency:bnb' },
    { nome: 'Tether', sigla: 'usdt', icon: 'cryptocurrency:usdt' },
    { nome: 'Polygon', sigla: 'matic', icon: 'cryptocurrency:matic' },
    { nome: 'Bitcoin Cash', sigla: 'bch', icon: 'cryptocurrency:bch' },
    { nome: 'Dash', sigla: 'dash', icon: 'cryptocurrency:dash' },
    { nome: 'ZCash', sigla: 'zec', icon: 'cryptocurrency:zec' }
];

function renderCoins() {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;

    grid.innerHTML = moedas.map(m => `
        <a href="list-${m.sigla}.html" class="coin-item">
            <iconify-icon icon="${m.icon}" style="font-size: 40px; color: #f2a900;"></iconify-icon>
            <span>${m.nome}</span>
        </a>
    `).join('');
}

renderCoins();
