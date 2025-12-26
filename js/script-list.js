// CONFIGURAÇÃO
const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('faucets-tbody');
    const targetCoin = document.body.getAttribute('data-coin'); 

    if (!tbody) return;

    try {
        // Puxando do nosso Banco de Dados seguro
        const response = await fetch(`${WORKER_URL}/get-all-faucets`);
        const faucets = await response.json();

        // Filtra pela moeda da página de forma inteligente
        const filtered = faucets.filter(f => {
            if (Array.isArray(f.moeda)) return f.moeda.includes(targetCoin);
            return f.moeda === targetCoin;
        });

        // Renderiza a tabela inicial
        await renderTable(filtered);

        // Sistema de Filtros por Categoria
        const filterBtn = document.getElementById('apply-filters');
        if (filterBtn) {
            filterBtn.addEventListener('click', async () => {
                const tipoValue = document.getElementById('filter-tipo').value;
                const finalData = filtered.filter(f => {
                    if (tipoValue === 'all') return true;
                    // Verifica no tipo_principal ou no array de recursos
                    const noTipo = f.tipo_principal && f.tipo_principal.toLowerCase().includes(tipoValue);
                    const noRecurso = f.recursos && f.recursos.includes(tipoValue);
                    return noTipo || noRecurso;
                });
                await renderTable(finalData);
            });
        }

    } catch (e) {
        console.error("Conexão com Banco de Dados indisponível.");
        tbody.innerHTML = '<tr><td colspan="7">Sistema em manutenção temporária.</td></tr>';
    }
});

// Sistema de Busca em Tempo Real (Blindado)
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

async function renderTable(data) {
    const tbody = document.getElementById('faucets-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Sincronizando métricas...</td></tr>';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum item encontrado nesta categoria.</td></tr>';
        return;
    }

    // Processa os votos de forma paralela para ganhar velocidade
    const rows = await Promise.all(data.map(async (f) => {
        let notaExibicao = 0;
        let votosReais = 0;
        
        try {
            const res = await fetch(`${WORKER_URL}/get-data?id=${f.id}`);
            if (res.ok) {
                const info = await res.json();
                if (info.totalVotos > 0) {
                    notaExibicao = info.media;
                    votosReais = info.totalVotos;
                }
            }
        } catch (err) {
            // Silencioso para não poluir o console do navegador
        }

        // Estilização da Avaliação
        let avaliacaoHTML = '';
        if (notaExibicao > 0) {
            avaliacaoHTML = `
                <div title="${votosReais} avaliações da comunidade">
                    <i class="fas fa-star" style="color: gold;"></i> 
                    <strong>${parseFloat(notaExibicao).toFixed(1)}</strong>
                    <small style="display:block; font-size:10px; color:#666;">${votosReais} votos</small>
                </div>`;
        } else {
            avaliacaoHTML = `<span style="font-size: 0.8em; color: #007bff; font-style: italic;">Avalie agora!</span>`;
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
    }));

    tbody.innerHTML = rows.join('');
}
