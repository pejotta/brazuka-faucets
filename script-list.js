document.addEventListener('DOMContentLoaded', () => {
    const coinFilter = "btc"; // ⚠️ IMPORTANTE: Mude este valor para cada arquivo (ex: "ltc", "doge", etc.)
    const tbody = document.getElementById('faucets-tbody');
    const applyButton = document.getElementById('apply-filters');

    // Funções auxiliares para HTML
    function getStatusTag(status) {
        let text, color;
        if (status === 'paying') {
            text = 'Paga';
            color = 'background-color: #4CAF50;';
        } else if (status === 'pending') {
            text = 'Pendente';
            color = 'background-color: #ff9800;';
        } else {
            text = 'SCAM/Fechada';
            color = 'background-color: #f44336;';
        }
        return `<span style="display: block; padding: 5px; border-radius: 4px; color: white; ${color}">${text}</span>`;
    }

    function getRatingStars(rating) {
        let starsHtml = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                // Estrela cheia
                starsHtml += '<i class="fa-solid fa-star rated"></i>';
            } else if (i === fullStars && hasHalfStar) {
                // Meia estrela
                starsHtml += '<i class="fa-solid fa-star-half-stroke rated"></i>';
            } else {
                // Estrela vazia
                starsHtml += '<i class="fa-regular fa-star"></i>';
            }
        }
        return `<div class="stars">${starsHtml} (${rating})</div>`;
    }

    // Função Principal para Carregar e Filtrar
    async function loadAndFilterFaucets() {
        // Pega os valores dos filtros
        const filterTipo = document.getElementById('filter-tipo').value;
        const filterAvaliacao = parseFloat(document.getElementById('filter-avaliacao').value);
        const filterPagamento = document.getElementById('filter-pagamento').value;

        try {
            // 1. Carrega o JSON
            const response = await fetch('faucets_data.json');
            const data = await response.json();

            // 2. Filtra os dados
            const filteredFaucets = data.filter(faucet => {
                // Filtro por Moeda (Necessário para a página)
                const isCorrectCoin = (faucet.moeda === coinFilter) || (coinFilter === 'central' && faucet.moeda === 'central');
                
                // Filtro por Tipo
                const isCorrectType = filterTipo === 'all' || faucet.tipo === filterTipo;
                
                // Filtro por Avaliação
                const isCorrectRating = faucet.avaliacao >= filterAvaliacao;
                
                // Filtro por Pagamento
                const isCorrectPayment = filterPagamento === 'all' || faucet.pagamento === filterPagamento;

                return isCorrectCoin && isCorrectType && isCorrectRating && isCorrectPayment;
            });

            // 3. Renderiza a tabela
            tbody.innerHTML = ''; // Limpa o conteúdo anterior

            if (filteredFaucets.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Nenhuma Faucet encontrada com os filtros aplicados.</td></tr>';
                return;
            }

            filteredFaucets.forEach(faucet => {
                const row = tbody.insertRow();
                // Coluna Nome/URL
                row.insertCell().innerHTML = `
                    <strong><a href="faucet_page_template.html?id=${faucet.id}" style="color:#1a73e8;">${faucet.nome}</a></strong>
                    <br><span style="font-size: 0.9em; color:#777;">${faucet.url.replace(/^(https?:\/\/)/, '')}</span>
                `;
                // Tipo
                row.insertCell().textContent = faucet.tipo === 'auto' ? 'Auto Faucet' : 'Faucet Padrão';
                // Min. Saque
                row.insertCell().textContent = faucet.minimo_saque;
                // Tempo Saque
                row.insertCell().textContent = faucet.tempo_saque;
                // Avaliação
                row.insertCell().innerHTML = getRatingStars(faucet.avaliacao);
                // Status
                row.insertCell().innerHTML = getStatusTag(faucet.status);
                // Ação
                row.insertCell().innerHTML = `<a href="${faucet.url}" target="_blank" class="faucet-visit-btn">Visitar</a>`;
            });

        } catch (error) {
            console.error('Erro ao carregar faucets:', error);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar dados. Verifique o arquivo JSON.</td></tr>';
        }
    }

    // Atribui o filtro ao botão e carrega a lista inicial
    applyButton.addEventListener('click', loadAndFilterFaucets);
    loadAndFilterFaucets(); // Carrega ao iniciar a página
});
