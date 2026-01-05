const API_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

async function carregarRanking(tipo = 'indicadores') {
    const corpoTabela = document.getElementById('corpo-tabela');
    corpoTabela.innerHTML = '<tr><td colspan="3" style="text-align:center;">Carregando caçadores...</td></tr>';

    try {
        // ANALISTA: Rota que busca os Top 10 de cada categoria no Banco de Dados
        const response = await fetch(`${API_URL}/get-rankings?tipo=${tipo}`);
        const dados = await response.json();

        corpoTabela.innerHTML = ''; // Limpa o carregando

        dados.forEach((user, index) => {
            const row = document.createElement('tr');
            
            // Define a medalha para o Top 3
            let posicao = `${index + 1}º`;
            let classePos = "";
            if(index === 0) { posicao = "🥇 1º"; classePos = "pos-1"; }
            else if(index === 1) { posicao = "🥈 2º"; classePos = "pos-2"; }
            else if(index === 2) { posicao = "🥉 3º"; classePos = "pos-3"; }

            row.innerHTML = `
                <td class="${classePos}">${posicao}</td>
                <td class="user-name">${mascararEmail(user.email)}</td>
                <td class="val-destaque">${user.score}</td>
            `;
            corpoTabela.appendChild(row);
        });
    } catch (error) {
        corpoTabela.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Erro ao carregar dados.</td></tr>';
    }
}

// Função para proteger a privacidade dos seus usuários
function mascararEmail(email) {
    if (!email.includes('@')) return email;
    const [usuario, dominio] = email.split('@');
    return usuario.substring(0, 3) + '***@' + dominio;
}

// Inicia carregando o ranking de indicadores por padrão
document.addEventListener('DOMContentLoaded', () => carregarRanking('indicadores'));
