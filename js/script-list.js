// CONFIGURAÇÃO
const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('faucets-tbody');
    const targetCoin = document.body.getAttribute('data-coin'); 

    if (!tbody) return;

    try {
        // 1. Puxa tudo de uma vez
        const [faucetsRes, statsRes] = await Promise.all([
            fetch(`${WORKER_URL}/get-all-faucets`),
            fetch(`${WORKER_URL}/get-global-stats`)
        ]);

        const faucets = await faucetsRes.json();
        const globalStats = await statsRes.json();

        // 2. Filtro Inteligente (O que você queria!)
        const filtered = faucets.filter(f => {
            if (!targetCoin) return true;

            // Criamos uma "super lista" de etiquetas da faucet
            const tagsDaFaucet = [
                ...(Array.isArray(f.moeda) ? f.moeda : [f.moeda]),
                f.tipo_principal ? f.tipo_principal.toLowerCase() : "",
                ...(Array.isArray(f.recursos) ? f.recursos : [])
            ].map(t => String(t).toLowerCase());

            // Verifica se a categoria da página (ex: 'autofaucet') está nas tags
            return tagsDaFaucet.some(tag => tag.includes(targetCoin.toLowerCase()));
        });

        // 3. Renderiza a tabela inicial
        await renderTable(filtered, globalStats.topRated || []);

        // 4. Sistema de Filtros por Categoria (dentro da página atual)
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
        console.error("Erro na conexão:", e);
        tbody.innerHTML = '<tr><td colspan="7">Sistema em manutenção temporária.</td></tr>';
    }
});

// Sistema de Busca (Permanece igual)
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

// Função de Renderização (Permanece igual)
async function renderTable(data, allRatings) {
    const tbody = document.getElementById('faucets-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum item encontrado nesta categoria.</td></tr>';
        return;
    }

    const rows = data.map(f => {
        const ratingInfo = allRatings.find(r => r.id == f.id);
        let notaExibicao = ratingInfo ? ratingInfo.media : 0;
        
        let avaliacaoHTML = notaExibicao > 0 
            ? `<div><i class="fas fa-star" style="color: gold;"></i> <strong>${parseFloat(notaExibicao).toFixed(1)}</strong></div>`
            : `<span style="font-size: 0.8em; color: #007bff; font-style: italic;">Avalie!</span>`;

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
