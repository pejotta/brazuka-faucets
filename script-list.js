// script-list.js

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('faucets-tbody');
    const targetCoin = document.body.getAttribute('data-coin'); // Pega o "btc" do body

    if (!tbody) return;

    try {
        const response = await fetch('faucets_data.json');
        const faucets = await response.json();

        // Filtra pela moeda da página (BTC)
        const filtered = faucets.filter(f => f.moeda === targetCoin);

        renderTable(filtered);

        // Lógica do botão de Filtros (Caso você queira usar os selects da página)
        document.getElementById('apply-filters').addEventListener('click', () => {
            const tipo = document.getElementById('filter-tipo').value;
            const finalData = filtered.filter(f => {
                return tipo === 'all' || f.tipo === tipo;
            });
            renderTable(finalData);
        });

    } catch (e) {
        console.error("Erro ao carregar lista:", e);
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados.</td></tr>';
    }
});

function renderTable(data) {
    const tbody = document.getElementById('faucets-tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma faucet encontrada.</td></tr>';
        return;
    }

    data.forEach(f => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${f.nome}</strong></td>
            <td>${f.tipo === 'auto' ? 'Auto Faucet' : 'Padrão'}</td>
            <td>${f.minimo_saque}</td>
            <td>${f.tempo_saque}</td>
            <td><i class="fas fa-star" style="color: gold;"></i> 4.5</td>
            <td><span class="status-tag ${f.status}">${f.status === 'paying' ? 'Pagando' : 'Pendente'}</span></td>
            <td><a href="faucet.html?id=${f.id}" class="details-btn">Ver Detalhes</a></td>
        `;
        tbody.appendChild(row);
    });
}
