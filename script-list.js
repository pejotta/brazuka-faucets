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
        const filterBtn = document.getElementById('apply-filters');
        if (filterBtn) {
            filterBtn.addEventListener('click', async () => {
                const tipo = document.getElementById('filter-tipo').value;
                const finalData = filtered.filter(f => {
                    return tipo === 'all' || f.tipo === tipo;
                });
                await renderTable(finalData);
            });
        }

    } catch (e) {
        console.error("Erro ao carregar lista:", e);
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados.</td></tr>';
    }
});

// Tornamos a função assíncrona para buscar as notas no KV ou JSON
async function renderTable(data) {
    const tbody = document.getElementById('faucets-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Buscando avaliações...</td></tr>';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma faucet encontrada.</td></tr>';
        return;
    }

    const rows = await Promise.all(data.map(async (f) => {
        let notaExibicao = 0;
        let fonteReal = false; // Para saber se veio do KV ou do JSON
        
        try {
            // 1. Tenta buscar a nota real no Worker (KV)
            const res = await fetch(`https://brazuka-faucets.moneynanet-yt.workers.dev/get-rating?id=${f.id}`);
            if (res.ok) {
                const ratingData = await res.json();
                if (ratingData.average && ratingData.average > 0) {
                    notaExibicao = ratingData.average;
                    fonteReal = true;
                }
            }
        } catch (err) {
            console.error(`Erro ao buscar nota real da faucet ${f.id}:`, err);
        }

        // 2. Se o Worker não deu nota, usa a do JSON (f.avaliacao)
        if (!fonteReal && f.avaliacao) {
            notaExibicao = f.avaliacao;
        }

        // Define o HTML da coluna de avaliação
        let avaliacaoHTML = '';
        if (notaExibicao > 0) {
            avaliacaoHTML = `<i class="fas fa-star" style="color: gold;"></i> ${parseFloat(notaExibicao).toFixed(1)}`;
        } else {
            avaliacaoHTML = `<span style="font-size: 0.8em; color: #007bff; font-style: italic;">Seja o primeiro a avaliar!</span>`;
        }

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
