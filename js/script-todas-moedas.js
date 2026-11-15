let moedasDoBanco = [];
let categoriaAtual = 'todas';

// 1. Busca as moedas direto do Banco de Dados / API ao carregar a página
async function carregarMoedasDoBanco() {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;

    try {
        // Altere para a URL real da sua API ou Worker que entrega as moedas ativas
        const response = await fetch('/api/moedas'); 
        moedasDoBanco = await response.json();
        
        renderCoins(moedasDoBanco);
    } catch (error) {
        console.error("Erro ao carregar moedas do banco:", error);
        // Fallback visual caso ocorra algum problema de conexão
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
        const coinLink = `moeda.html?c=${m.sigla.toLowerCase()}`;
        
        return `
            <a href="${coinLink}" class="coin-item" data-category="${m.categoria || 'geral'}" data-name="${m.nome.toLowerCase()} ${m.sigla.toLowerCase()}">
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
    const termoBusca = document.getElementById('coin-search').value.toLowerCase().trim();
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
