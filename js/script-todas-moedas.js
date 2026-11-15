/**
 * script-todas-moedas.js - Catálogo 100% Automatizado + Destaques Dinâmicos
 */

const URL_WORKER = "https://brazuka-faucets.moneynanet-yt.workers.dev";
let moedasDoBanco = [];
let categoriaAtual = 'todas';

async function carregarMoedasDoBanco() {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${URL_WORKER}/get-all-faucets`);
        if (!response.ok) throw new Error("Erro ao carregar dados do Banco de Dados.");

        const faucets = await response.json();
        
        const metadadosMoedas = {
            btc: { nome: 'Bitcoin', categoria: 'principais' },
            eth: { nome: 'Ethereum', categoria: 'principais' },
            doge: { nome: 'Dogecoin', categoria: 'memes' },
            ltc: { nome: 'Litecoin', categoria: 'principais' },
            bch: { nome: 'Bitcoin Cash', categoria: 'principais' },
            dash: { nome: 'Dash', categoria: 'principais' },
            dgb: { nome: 'DigiByte', categoria: 'redes' },
            trx: { nome: 'Tron', categoria: 'redes' },
            usdt: { nome: 'Tether', categoria: 'stablecoins' },
            fey: { nome: 'Feyorra', categoria: 'redes' },
            zec: { nome: 'Zcash', categoria: 'principais' },
            bnb: { nome: 'Binance Coin', categoria: 'redes' },
            sol: { nome: 'Solana', categoria: 'redes' },
            xrp: { nome: 'Ripple', categoria: 'redes' },
            pol: { nome: 'Polygon', categoria: 'redes' },
            ada: { nome: 'Cardano', categoria: 'redes' },
            ton: { nome: 'Toncoin', categoria: 'redes' },
            xlm: { nome: 'Stellar', categoria: 'redes' },
            usdc: { nome: 'USD Coin', categoria: 'stablecoins' },
            xmr: { nome: 'Monero', categoria: 'principais' },
            tara: { nome: 'Taraxa', categoria: 'redes' },
            trump: { nome: 'Official Trump', categoria: 'memes' },
            pepe: { nome: 'Pepe', categoria: 'memes' },
            'g$': { nome: 'GoodDollar', categoria: 'redes' }
        };

        // Conta as faucets ativas IGNORANDO termos indesejados da lista negra
        const contagemFaucets = {};
        const ignoreList = ['central', 'autofaucet', 'minerador', 'bet', 'jogo', 'bet crypto', 'jogos', 'padrao'];

        faucets.forEach(f => {
            if (f.status === 'scam') return;
            
            let lista = [];
            if (Array.isArray(f.moeda)) {
                lista = f.moeda;
            } else if (typeof f.moeda === 'string') {
                lista = f.moeda.split(',');
            }

            lista.forEach(m => {
                const sigla = m.toLowerCase().trim();
                if (sigla && !ignoreList.includes(sigla)) {
                    contagemFaucets[sigla] = (contagemFaucets[sigla] || 0) + 1;
                }
            });
        });

        // Monta o array final com a contagem embutida
        moedasDoBanco = Object.keys(contagemFaucets).map(sigla => {
            const info = metadadosMoedas[sigla] || { 
                nome: sigla.toUpperCase(), 
                categoria: 'redes' 
            };
            return {
                sigla: sigla,
                nome: info.nome,
                categoria: info.categoria,
                totalFaucets: contagemFaucets[sigla]
            };
        });

        // 1. Renderiza o Top 4 Mais Populares (ordenado por maior número de faucets)
        renderPopularCoins([...moedasDoBanco]);

        // 2. Ordena alfabeticamente para a grade geral e renderiza
        moedasDoBanco.sort((a, b) => a.nome.localeCompare(b.nome));
        renderCoins(moedasDoBanco);

    } catch (error) {
        console.error("Erro ao carregar moedas:", error);
        grid.innerHTML = '<p class="no-results">Erro ao carregar as moedas. Tente novamente em instantes.</p>';
    }
}

// Renderiza o Top 4 no topo da página
function renderPopularCoins(lista) {
    const section = document.getElementById('popular-coins-section');
    const popularGrid = document.getElementById('popular-coins-grid');
    if (!section || !popularGrid || lista.length === 0) return;

    const top4 = lista.sort((a, b) => b.totalFaucets - a.totalFaucets).slice(0, 4);

    popularGrid.innerHTML = top4.map((m, index) => {
        const coinLink = `moeda.html?c=${encodeURIComponent(m.sigla)}`;
        const badgeText = index === 0 ? '👑 Top #1' : `🔥 Top #${index + 1}`;
        const textoFaucets = m.totalFaucets === 1 ? '1 faucet' : `${m.totalFaucets} faucets`;

        return `
            <a href="${coinLink}" class="popular-card">
                <span class="popular-badge">${badgeText}</span>
                <img src="assets/logo-brazuka.png" alt="${m.nome}" style="width: 38px; height: 38px; object-fit: contain;">
                <div style="text-align: left;">
                    <div style="font-weight: 700; font-size: 0.95rem;">${m.nome}</div>
                    <div style="font-size: 0.78rem; color: #aaa;">${m.sigla.toUpperCase()} • ${textoFaucets}</div>
                </div>
            </a>
        `;
    }).join('');

    section.style.display = 'block';
}

// Renderiza a grade principal
function renderCoins(lista) {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;

    if (lista.length === 0) {
        grid.innerHTML = '<p class="no-results">Nenhuma moeda encontrada.</p>';
        return;
    }

    grid.innerHTML = lista.map(m => {
        const coinLink = `moeda.html?c=${encodeURIComponent(m.sigla)}`;
        const textoFaucets = m.totalFaucets === 1 ? '1 faucet' : `${m.totalFaucets} faucets`;
        
        return `
            <a href="${coinLink}" class="coin-item" data-category="${m.categoria}" data-name="${m.nome.toLowerCase()} ${m.sigla.toLowerCase()}">
                <div class="icon-wrapper" style="height: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px;">
                    <img src="assets/logo-brazuka.png" alt="${m.nome}" style="width: 42px; height: 42px; object-fit: contain;">
                </div>
                <span style="font-weight: 600;">${m.nome}</span>
                <small style="color: #888; font-size: 0.75rem; text-transform: uppercase;">${m.sigla} • ${textoFaucets}</small>
            </a>
        `;
    }).join('');
}

function setCategory(categoria, botao) {
    categoriaAtual = categoria;

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (botao) botao.classList.add('active');

    aplicarFiltros();
}

function aplicarFiltros() {
    const inputSearch = document.getElementById('coin-search');
    if (!inputSearch) return;

    const termoBusca = inputSearch.value.toLowerCase().trim();
    const grid = document.getElementById('coins-grid');
    const items = grid.getElementsByClassName('coin-item');
    let visiveis = 0;

    for (let i = 0; i < items.length; i++) {
        const itemCat = items[i].getAttribute('data-category');
        const itemName = items[i].getAttribute('data-name');

        const bateCategoria = (categoriaAtual === 'todas' || itemCat === categoriaAtual);
        const bateBusca = (itemName.indexOf(termoBusca) > -1);

        if (bateCategoria && bateBusca) {
            items[i].style.display = "";
            visiveis++;
        } else {
            items[i].style.display = "none";
        }
    }

    let noResultsMsg = document.getElementById('no-search-results');
    if (visiveis === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'no-search-results';
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = '<i class="fas fa-search-minus" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>Nenhuma criptomoeda encontrada para esse filtro.';
            grid.appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

document.addEventListener('DOMContentLoaded', carregarMoedasDoBanco);
