const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('faucets-tbody');
    const targetCoin = document.body.getAttribute('data-coin'); 

    if (!tbody) return;

    try {
        const [faucetsRes, statsRes] = await Promise.all([
            fetch(`${WORKER_URL}/get-all-faucets`),
            fetch(`${WORKER_URL}/get-global-stats`)
        ]);

        const faucets = await faucetsRes.json();
        const globalStats = await statsRes.json();

        // LOG DE DEPURAÇÃO (Abre o F12 no navegador para ver isso)
        console.log("Moeda Alvo da Página:", targetCoin);
        console.log("Primeira Faucet do Banco:", faucets[0]);

        // FILTRO TOTAL - Se 'autofaucet' estiver em QUALQUER lugar da Faucet, ela entra.
        const filtered = faucets.filter(f => {
            if (!targetCoin) return true;
            
            // Transforma o objeto da faucet inteiro em uma string gigante
            // Isso ignora se o campo chama 'moeda', 'recurso' ou 'tipo'
            const textoDaFaucet = JSON.stringify(f).toLowerCase();
            const busca = targetCoin.toLowerCase().trim();

            return textoDaFaucet.includes(busca);
        });

        console.log("Faucets encontradas após o filtro:", filtered.length);

        await renderTable(filtered, globalStats.topRated || []);

        // Filtros Rápidos (PTC, etc)
        const filterBtn = document.getElementById('apply-filters');
        if (filterBtn) {
            filterBtn.addEventListener('click', async () => {
                const tipoValue = document.getElementById('filter-tipo').value;
                const finalData = filtered.filter(f => {
                    if (tipoValue === 'all') return true;
                    return JSON.stringify(f).toLowerCase().includes(tipoValue.toLowerCase());
                });
                await renderTable(finalData, globalStats.topRated || []);
            });
        }

    } catch (e) {
        console.error("Erro fatal:", e);
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar Banco de Dados.</td></tr>';
    }
});

// Sistema de Busca por Texto
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
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma faucet encontrada com o termo "' + document.body.getAttribute('data-coin') + '".</td></tr>';
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
