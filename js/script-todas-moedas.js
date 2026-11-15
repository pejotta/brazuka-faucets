/**
 * script-todas-moedas.js - Catálogo 100% Automatizado via Cloudflare Worker
 */

const URL_WORKER = "https://brazuka-faucets.moneynanet-yt.workers.dev";
let moedasDoBanco = [];
let categoriaAtual = 'todas';

// 1. Busca todas as faucets do Cloudflare e extrai as moedas ativas de forma dinâmica
async function carregarMoedasDoBanco() {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${URL_WORKER}/get-all-faucets`);
        if (!response.ok) throw new Error("Erro ao carregar dados do Cloudflare.");

        const faucets = await response.json();
        
        // Mapeamento padrão de nomes bonitos e categorias para as siglas conhecidas
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

        // Extrai todas as siglas únicas presentes nas faucets cadastradas
        const siglasSet = new Set();
        faucets.forEach(f => {
            if (Array.isArray(f.moeda)) {
                f.moeda.forEach(m => siglasSet.add(m.toLowerCase().trim()));
            } else if (typeof f.moeda === 'string') {
                f.moeda.split(',').forEach(m => siglasSet.add(m.toLowerCase().trim()));
            }
        });

        // Monta o array final de moedas dinamicamente
        moedasDoBanco = Array.from(siglasSet).map(sigla => {
            const info = metadadosMoedas[sigla] || { 
                nome: sigla.toUpperCase(), 
                categoria: 'redes' 
            };
            return {
                sigla: sigla,
                nome: info.nome,
                categoria: info.categoria
            };
        });

        // Ordena alfabeticamente pelo nome
        moedasDoBanco.sort((a, b) => a.nome.localeCompare(b.nome));

        renderCoins(moedasDoBanco);
    } catch (error) {
        console.error("Erro ao carregar moedas do Worker:", error);
        grid.innerHTML = '<p class="no-results">Erro ao carregar as moedas. Tente novamente em instantes.</p>';
    }
}

// 2. Renderiza os cards dinamicamente na tela
function renderCoins(lista) {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;

    if (lista.length === 0) {
        grid.innerHTML = '<p class="no-results">Nenhuma moeda encontrada.</p>';
        return;
    }

    grid.innerHTML = lista.map(m => {
        const coinLink = `moeda.html?c=${encodeURIComponent(m.sigla)}`;
        
        return `
            <a href="${coinLink}" class="coin-item" data-category="${m.categoria}" data-name="${m.nome.toLowerCase()} ${m.sigla.toLowerCase()}">
                <div class="icon-wrapper" style="height: 50px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    <img src="assets/logo-brazuka.png" alt="${m.nome}" style="width: 42px; height: 42px; object-fit: contain;">
                </div>
                <span style="font-weight: 500;">${m.nome}</span>
                <small style="color: #888; font-size: 0.75rem; text-transform: uppercase;">${m.sigla}</small>
            </a>
        `;
    }).join('');
}

// 3. Sistema de Filtros por Categoria e Busca por Texto
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

// Dispara a carga inicial assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarMoedasDoBanco);
