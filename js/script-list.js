// CONFIGURAÇÃO
const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('faucets-tbody');
    const targetCoin = document.body.getAttribute('data-coin'); 

    if (!tbody) return;

    try {
        // 1. Puxa tudo de uma vez: Faucets e Estatísticas Globais (Notas)
        const [faucetsRes, statsRes] = await Promise.all([
            fetch(`${WORKER_URL}/get-all-faucets`),
            fetch(`${WORKER_URL}/get-global-stats`)
        ]);

        const faucets = await faucetsRes.json();
        const globalStats = await statsRes.json();

        // Filtra pela moeda da página
        const filtered = faucets.filter(f => {
            if (Array.isArray(f.moeda)) return f.moeda.includes(targetCoin);
            return f.moeda === targetCoin;
        });

        // 2. Passa as notas globais para a função de renderizar
        await renderTable(filtered, globalStats.topRated || []);

        // Filtros por Categoria
        const filterBtn = document.getElementById('apply-filters');
        if (filterBtn) {
            filterBtn.addEventListener('click', async () => {
                const tipoValue = document.getElementById('filter-tipo').value;
                const finalData = filtered.filter(f => {
                    if (tipoValue === 'all') return true;
                    const noTipo = f.tipo_principal && f.tipo_principal.toLowerCase().includes(tipoValue);
                    const noRecurso = f.recursos && f.recursos.includes(tipoValue);
                    return noTipo || noRecurso;
                });
                await renderTable(finalData, globalStats.topRated || []);
            });
        }

    } catch (e) {
        console.error("Conexão com Banco de Dados indisponível.");
        tbody.innerHTML = '<tr><td colspan="7">Sistema em manutenção temporária.</td></tr>';
    }

    // Pega a "moeda" alvo da página (que pode ser 'btc', 'autofaucet', 'central', etc)
const targetCoin = document.body.getAttribute('data-coin'); 

// Filtra de forma "Amigável"
const filtered = faucets.filter(f => {
    // 1. Cria uma lista única com tudo que essa faucet é/tem
    // Vamos juntar moedas, tipo_principal e recursos num lugar só para pesquisar
    const tagsDaFaucet = [
        ...(Array.isArray(f.moeda) ? f.moeda : [f.moeda]),
        f.tipo_principal ? f.tipo_principal.toLowerCase() : "",
        ...(Array.isArray(f.recursos) ? f.recursos : [])
    ].map(t => t.toLowerCase()); // Tudo em minúsculo para não dar erro

    // 2. Verifica se o que a página pede (targetCoin) está nessa lista
    // Se a página pede 'autofaucet' e a faucet tem 'autofaucet' nas tags, ela aparece!
    return tagsDaFaucet.some(tag => tag.includes(targetCoin.toLowerCase()));
});
    
});

// Sistema de Busca
const searchInput = document.getElementById('search-faucet');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#faucets-tbody tr');
        rows.forEach(row => {
            const name = row.querySelector('td:first-child').textContent.toLowerCase();
            row.style.display = name.includes(term) ? '' : 'none';
        });
    });
}

async function renderTable(data, allRatings) {
    const tbody = document.getElementById('faucets-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum item encontrado nesta categoria.</td></tr>';
        return;
    }

    // Mapeia os dados sem precisar de novos fetchs (MUITO MAIS RÁPIDO)
    const rows = data.map(f => {
        // Busca a nota da faucet no array de ratings que já carregamos
        const ratingInfo = allRatings.find(r => r.id == f.id);
        
        let notaExibicao = ratingInfo ? ratingInfo.media : 0;
        let votosReais = ratingInfo ? (ratingInfo.votos || 0) : 0; // Ajuste conforme seu worker retorna

        let avaliacaoHTML = '';
        if (notaExibicao > 0) {
            avaliacaoHTML = `
                <div>
                    <i class="fas fa-star" style="color: gold;"></i> 
                    <strong>${parseFloat(notaExibicao).toFixed(1)}</strong>
                </div>`;
        } else {
            avaliacaoHTML = `<span style="font-size: 0.8em; color: #007bff; font-style: italic;">Avalie!</span>`;
        }

        return `
            <tr>
                <td><strong>${f.nome}</strong></td>
                <td>${f.tipo_principal || 'Padrão'}</td>
                <td>${f.minimo_saque || '---'}</td>
                <td>${f.tempo_saque || 'Imediato'}</td>
                <td style="text-align: center;">${avaliacaoHTML}</td>
                <td><span class="status-tag ${f.status}">${f.status === 'paying' ? 'Pagando' : 'Pendente'}</span></td>
                <td><a href="faucet.html?id=${f.id}" class="details-btn">Detalhes</a></td>
            </tr>
        `;
    });

    tbody.innerHTML = rows.join('');
}
