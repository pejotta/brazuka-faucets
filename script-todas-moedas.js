const moedas = [
    { nome: 'Bitcoin', sigla: 'btc', icon: 'cryptocurrency:btc' },
    { nome: 'Ethereum', sigla: 'eth', icon: 'cryptocurrency:eth' },
    { nome: 'Dogecoin', sigla: 'doge', icon: 'cryptocurrency:doge' },
    { nome: 'Litecoin', sigla: 'ltc', icon: 'cryptocurrency:ltc' },
    { nome: 'Bitcoin Cash', sigla: 'bch', icon: 'cryptocurrency:bch' },
    { nome: 'Dash', sigla: 'dash', icon: 'cryptocurrency:dash' },
    { nome: 'DigiByte', sigla: 'dgb', icon: 'cryptocurrency:dgb' },
    { nome: 'Tron', sigla: 'trx', icon: 'cryptocurrency:trx' },
    { nome: 'Tether', sigla: 'usdt', icon: 'cryptocurrency:usdt' },
    { nome: 'Feyorra', sigla: 'fey', icon: 'cryptocurrency:fey' },
    { nome: 'Zcash', sigla: 'zec', icon: 'cryptocurrency:zec' },
    { nome: 'Binance Coin', sigla: 'bnb', icon: 'cryptocurrency:bnb' },
    { nome: 'Solana', sigla: 'sol', icon: 'cryptocurrency:sol' },
    { nome: 'Ripple', sigla: 'xrp', icon: 'cryptocurrency:xrp' },
    { nome: 'Polygon', sigla: 'pol', icon: 'cryptocurrency:pol' },
    { nome: 'Cardano', sigla: 'ada', icon: 'cryptocurrency:ada' },
    { nome: 'Toncoin', sigla: 'ton', icon: 'cryptocurrency:ton' },
    { nome: 'Stellar', sigla: 'xlm', icon: 'cryptocurrency:xlm' },
    { nome: 'USD Coin', sigla: 'usdc', icon: 'cryptocurrency:usdc' },
    { nome: 'Monero', sigla: 'xmr', icon: 'cryptocurrency:xmr' },
    { nome: 'Taraxa', sigla: 'tara', icon: 'cryptocurrency:tara' },
    { nome: 'Official Trump', sigla: 'trump', icon: 'cryptocurrency:trump' },
    { nome: 'Pepe', sigla: 'pepe', icon: 'cryptocurrency:pepe' }
];

function renderCoins() {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;

    grid.innerHTML = moedas.map(m => {
        // 1. Transforma em minúsculo: "Binance Coin" -> "binance coin"
        // 2. Troca espaços por traços: "binance coin" -> "binance-coin"
        const coinSlug = m.nome.toLowerCase().replace(/\s+/g, '-');
        
        const coinLink = `${coinSlug}.html`;
        const iconColor = m.sigla === 'btc' ? '#f2a900' : '#ffffff';

        return `
            <a href="${coinLink}" class="coin-item">
                <iconify-icon icon="${m.icon}" style="font-size: 40px; color: ${iconColor};"></iconify-icon>
                <span>${m.nome}</span>
            </a>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', renderCoins);
