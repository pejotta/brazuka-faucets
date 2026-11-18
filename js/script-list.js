const WORKER_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('faucets-tbody');
    const targetCoin = (document.body.getAttribute('data-coin') || '').toLowerCase().trim(); 

    if (!tbody) return;

    try {
        const [faucetsRes, statsRes] = await Promise.all([
            fetch(`${WORKER_URL}/get-all-faucets`),
            fetch(`${WORKER_URL}/get-global-stats`)
        ]);

        const faucets = await faucetsRes.json();
        const globalStats = await statsRes.json();

        // LOG DE DEPURAÇÃO
        console.log("Moeda Alvo da Página:", targetCoin);

        // FILTRO CIRÚRGICO E SEGURO POR MOEDA
        const filtered = faucets.filter(f => {
            if (!targetCoin) return true;
            if (f.status === 'scam') return false; // Ignora scam de cara

            // Extrai as moedas cadastradas nesta faucet de forma segura
            let moedasDaFaucet = [];
            if (Array.isArray(f.moeda)) {
                moedasDaFaucet = f.moeda.map(m => String(m).toLowerCase().trim());
            } else if (typeof f.moeda === 'string') {
                moedasDaFaucet = f.moeda.split(',').map(m => String(m).toLowerCase().trim());
            }

            // A faucet só entra se a sigla alvo estiver estritamente na lista de moedas dela
            return moedasDaFaucet.includes(targetCoin);
        });

        console.log("Faucets encontradas após o filtro estrito:", filtered.length);

        await renderTable(filtered, globalStats.topRated || []);

        // Filtros Rápidos (Tipo de Faucet, etc)
        const filterBtn = document.getElementById('apply-filters');
        if (filterBtn) {
            filterBtn.addEventListener('click', async () => {
                const tipoValue = document.getElementById('filter-tipo').value;
                const finalData = filtered.filter(f => {
                    if (tipoValue === 'all') return true;
                    // Filtra por tipo principal ou recursos dentro do objeto com segurança
                    const tipoPrincipal = String(f.tipo_principal || '').toLowerCase();
                    const recursosStr = Array.isArray(f.recursos) ? f.recursos.join(' ').toLowerCase() : String(f.recursos || '').toLowerCase();
                    return tipoPrincipal.includes(tipoValue.toLowerCase()) || recursosStr.includes(tipoValue.toLowerCase());
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
            const nameEl = row.querySelector('td:first-child');
            if (nameEl) {
                const name = nameEl.textContent.toLowerCase();
                row.style.display = name.includes(term) ? '' : 'none';
            }
        });
    });
}

async function renderTable(data, allRatings) {
    const tbody = document.getElementById('faucets-tbody');
    if (!tbody) return;

    const targetCoin = document.body.getAttribute('data-coin') || '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Nenhuma faucet encontrada para "${targetCoin.toUpperCase()}".</td></tr>`;
        return;
    }

    const rows = data.map(f => {
        const ratingInfo = allRatings.find(r => r.id == f.id);
        let notaExibicao = ratingInfo ? ratingInfo.media : 0;
        
        let avaliacaoHTML = notaExibicao > 0 
            ? `<div><i class="fas fa-star" style="color: gold;"></i> <strong>${parseFloat(notaExibicao).toFixed(1)}</strong></div>`
            : `<span style="font-size: 0.8em; color: #007bff; font-style: italic;">Avalie!</span>`;

        // Lógica de Plataforma (Site / App)
        let plats = Array.isArray(f.plataforma) ? f.plataforma : (f.plataforma ? [f.plataforma] : ['site']);
        let badgePlatHTML = '';
        if (plats.includes('app') && plats.includes('site')) {
            badgePlatHTML = `<span style="background: #e3f2fd; color: #1565c0; font-size: 0.7em; padding: 2px 6px; border-radius: 4px; margin-left: 6px; font-weight: bold;">SITE + APP</span>`;
        } else if (plats.includes('app')) {
            badgePlatHTML = `<span style="background: #e8f5e9; color: #2e7d32; font-size: 0.7em; padding: 2px 6px; border-radius: 4px; margin-left: 6px; font-weight: bold;">APP</span>`;
        } else {
            badgePlatHTML = `<span style="background: #f1f3f4; color: #5f6368; font-size: 0.7em; padding: 2px 6px; border-radius: 4px; margin-left: 6px; font-weight: bold;">SITE</span>`;
        }

        return `
            <tr>
                <td><strong>${f.nome}</strong> ${badgePlatHTML}</td>
                <td>${f.tipo_principal || 'Padrão'}</td>
                <td>${f.minimo_saque || '---'}</td>
                <td>${f.tempo_saque || 'Imediato'}</td>
                <td style="text-align: center;">${avaliacaoHTML}</td>
                <td><span style="position:relative;" class="status-tag ${f.status}"> ${f.status === 'paying' ? 'Pagando' : (f.status === 'pending' ? 'Em Análise' : 'SCAM / Fechada')} </span> </td>
                <td><a href="faucet.html?id=${f.id}" class="details-btn">Detalhes</a></td>
            </tr>
        `;
    });

    tbody.innerHTML = rows.join('');
}
