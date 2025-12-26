// CONFIGURAÇÃO
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

        // FILTRO TURBO: Procura o targetCoin em TUDO da faucet
        const filtered = faucets.filter(f => {
            if (!targetCoin) return true;
            
            const busca = targetCoin.toLowerCase().trim();

            // Transforma TUDO da faucet em uma grande sopa de letras (String)
            // Vamos olhar moedas, tipo_principal e recursos
            const moedasStr = Array.isArray(f.moeda) ? f.moeda.join(' ') : String(f.moeda || "");
            const recursosStr = Array.isArray(f.recursos) ? f.recursos.join(' ') : String(f.recursos || "");
            const tipoStr = String(f.tipo_principal || "");

            const tudoJunto = `${moedasStr} ${recursosStr} ${tipoStr}`.toLowerCase();

            // Se o que a página pede (ex: 'autofaucet') estiver em QUALQUER lugar disso:
            return tudoJunto.includes(busca);
        });

        await renderTable(filtered, globalStats.topRated || []);

        // Filtros por Categoria (PTC, Faucet, etc)
        const filterBtn = document.getElementById('apply-filters');
        if (filterBtn) {
            filterBtn.addEventListener('click', async () => {
                const tipoValue = document.getElementById('filter-tipo').value;
                const finalData = filtered.filter(f => {
                    if (tipoValue === 'all') return true;
                    const tudoF = `${f.tipo_principal} ${f.recursos ? f.recursos.join(' ') : ''}`.toLowerCase();
                    return tudoF.includes(tipoValue.toLowerCase());
                });
                await renderTable(finalData, globalStats.topRated || []);
            });
        }

    } catch (e) {
        console.error("Erro:", e);
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar Banco de Dados.</td></tr>';
    }
});

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
