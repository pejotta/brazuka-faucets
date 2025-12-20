// script-list.js

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('faucets-tbody');
    const targetCoin = document.body.getAttribute('data-coin'); 

    if (!tbody) return;

    try {
        const response = await fetch('faucets_data.json');
        const faucets = await response.json();

        // Filtra pela moeda da página (BTC, DOGE, etc)
        const filtered = faucets.filter(f => f.moeda === targetCoin);

        // Chama a renderização passando os dados filtrados
        await renderTable(filtered);

        // Lógica do botão de Filtros
        document.getElementById('apply-filters').addEventListener('click', async () => {
            const tipo = document.getElementById('filter-tipo').value;
            const finalData = filtered.filter(f => {
                return tipo === 'all' || f.tipo === tipo;
            });
            await renderTable(finalData);
        });

    } catch (e) {
        console.error("Erro ao carregar lista:", e);
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados.</td></tr>';
    }
});

// Tornamos a função assíncrona para buscar as notas no KV
async function renderTable(data) {
    const tbody = document.getElementById('faucets-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Buscando avaliações reais...</td></tr>';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma faucet encontrada.</td></tr>';
        return;
    }

    // Criamos uma lista de promessas para buscar todas as notas simultaneamente (mais rápido)
    const rows = await Promise.all(data.map(async (f) => {
        let notaReal = 0;
        
        try {
            // Chamada para o seu Worker (Substitua pela sua URL oficial do Worker)
            const res = await fetch(`https://brazuka-faucets.moneynanet-yt.workers.dev/get-rating?id=${f.id}`);
            if (res.ok) {
                const ratingData = await res.json();
                notaReal = ratingData.average || 0;
            }
        } catch (err) {
            console.error(`Erro ao buscar nota da faucet ${f.id}:`, err);
        }

        // Define o HTML da coluna de avaliação
        const avaliacaoHTML = notaReal > 0 
            ? `<i class="fas fa-star" style="color: gold;"></i> ${notaReal.toFixed(1)}`
            : `<span style="font-size: 0.8em; color: #007bff; font-style: italic;">Seja o primeiro a avaliar!</span>`;

        return `
            <tr>
                <td><strong>${f.nome}</strong></td>
                <td>${f.tipo === 'auto' ? 'Auto Faucet' : 'Padrão'}</td>
                <td>${f.minimo_saque}</td>
                <td>${f.tempo_saque}</td>
                <td>${avaliacaoHTML}</td>
                <td><span style="position:relative;" class="status-tag ${f.status}">${f.status === 'paying' ? 'Pagando' : 'Pendente'}</span></td>
                <td><a href="faucet.html?id=${f.id}" class="details-btn">Ver Detalhes</a></td>
            </tr>
        `;
    }));

    tbody.innerHTML = rows.join('');
}
