const moedas = [
    { nome: 'Bitcoin', sigla: 'btc' },
    { nome: 'Ethereum', sigla: 'eth' },
    { nome: 'Dogecoin', sigla: 'doge' },
    { nome: 'Litecoin', sigla: 'ltc' },
    { nome: 'Tron', sigla: 'trx' },
    { nome: 'Solana', sigla: 'sol' },
    { nome: 'Binance Coin', sigla: 'bnb' },
    { nome: 'Tether', sigla: 'usdt' },
    { nome: 'Polygon', sigla: 'matic' },
    { nome: 'Dash', sigla: 'dash' },
    { nome: 'ZCash', sigla: 'zec' },
    { nome: 'Bitcoin Cash', sigla: 'bch' },
    { nome: 'DigiByte', sigla: 'dgb' },
    { nome: 'Feyorra', sigla: 'fey' }
    // O padrão é sempre 'cf cf-' + a sigla da moeda
];

function renderCoins() {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;

    grid.innerHTML = moedas.map(m => `
        <a href="list-${m.sigla}.html" class="coin-item">
            <i class="cf cf-${m.sigla}"></i>
            <span>${m.nome}</span>
        </a>
    `).join('');
}

renderCoins();
