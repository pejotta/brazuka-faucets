// script-list.js

// URL do seu Worker (Centralizada para facilitar)
const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('faucets-tbody');
    const targetCoin = document.body.getAttribute('data-coin'); 

    if (!tbody) return;

    try {
        const response = await fetch('faucets_data.json');
        const faucets = await response.json();

        // Filtra pela moeda da página
        const filtered = faucets.filter(f => f.moeda === targetCoin);

        // Renderiza a tabela
        await renderTable(filtered);

        // Filtros
        const filterBtn = document.getElementById('apply-filters');
        if (filterBtn) {
            filterBtn.addEventListener('click', async () => {
                const tipo = document.getElementById('filter-tipo').value;
                const finalData = filtered.filter(f => tipo === 'all' || f.tipo === tipo);
                await renderTable(finalData);
            });
        }

    } catch (e) {
        console.error("Erro ao carregar lista:", e);
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados.</td></tr>';
    }
});

// Adicione isso dentro da função onde você inicializa os filtros
document.getElementById('search-faucet').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#faucets-tbody tr');

    rows.forEach(row => {
        const name = row.querySelector('td:first-child').textContent.toLowerCase();
        if (name.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

async function renderTable(data) {
    const tbody = document.getElementById('faucets-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Buscando avaliações reais...</td></tr>';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma faucet encontrada.</td></tr>';
        return;
    }

    const rows = await Promise.all(data.map(async (f) => {
        let notaExibicao = 0;
        let votosReais = 0;
        
        try {
            // USANDO O MESMO ENDPOINT DO SCRIPT DE DETALHES (/get-data)
            const res = await fetch(`${WORKER_URL}/get-data?id=${f.id}`);
            if (res.ok) {
                const workerData = await res.json();
                // O seu worker retorna 'media' e 'totalVotos'
                if (workerData.totalVotos > 0) {
                    notaExibicao = workerData.media;
                    votosReais = workerData.totalVotos;
                }
            }
        } catch (err) {
            console.log(`Faucet ${f.id} ainda sem votos no Worker.`);
        }

        // Se não tem voto no Worker, usa a nota do JSON (Plano B)
        if (votosReais === 0 && f.avaliacao) {
            notaExibicao = f.avaliacao;
        }

        // Estilização da Estrela
        let avaliacaoHTML = '';
        if (notaExibicao > 0) {
            avaliacaoHTML = `
                <div title="${votosReais > 0 ? votosReais + ' votos reais' : 'Nota inicial'}">
                    <i class="fas fa-star" style="color: gold;"></i> 
                    <strong>${parseFloat(notaExibicao).toFixed(1)}</strong>
                    ${votosReais > 0 ? `<small style="display:block; font-size:10px; color:#666;">${votosReais} votos</small>` : ''}
                </div>`;
        } else {
            avaliacaoHTML = `<span style="font-size: 0.8em; color: #007bff; font-style: italic;">Seja o primeiro!</span>`;
        }

        return `
            <tr>
                <td><strong>${f.nome}</strong></td>
                <td>${f.tipo === 'auto' ? 'Auto Faucet' : 'Padrão'}</td>
                <td>${f.minimo_saque}</td>
                <td>${f.tempo_saque}</td>
                <td style="text-align: center;">${avaliacaoHTML}</td>
                <td><span style="position:relative;" class="status-tag ${f.status}">${f.status === 'paying' ? 'Pagando' : 'Pendente'}</span></td>
                <td><a href="faucet.html?id=${f.id}" class="details-btn">Ver Detalhes</a></td>
            </tr>
        `;
    }));

    tbody.innerHTML = rows.join('');
}
