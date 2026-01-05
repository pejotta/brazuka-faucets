// ANALISTA: Centralizando a lógica para evitar erros e facilitar manutenção [cite: 2026-01-02]
const API_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

// Função principal que decide qual ranking carregar
async function mudarTab(tipo, btn) {
    // 1. Estética: Troca a cor do botão ativo
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2. Interface: Ajusta o título da coluna de valor
    const label = document.getElementById('label-valor');
    if(tipo === 'indicadores') label.innerText = "Amigos Ativos";
    else if(tipo === 'claimers') label.innerText = "Total de Claims";
    else label.innerText = "Links Completos";

    // 3. Dados: Busca no Banco de Dados [cite: 2025-12-26]
    await carregarDadosRanking(tipo);
}

async function carregarDadosRanking(tipo) {
    const corpoTabela = document.getElementById('corpo-tabela');
    corpoTabela.innerHTML = '<tr><td colspan="3" style="text-align:center;">🔍 Consultando Banco de Dados...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/get-rankings?tipo=${tipo}`);
        const dados = await response.json();

        corpoTabela.innerHTML = ''; 

        if (dados.length === 0) {
            corpoTabela.innerHTML = '<tr><td colspan="3" style="text-align:center;">Ninguém no ranking ainda. Seja o primeiro! 🚀</td></tr>';
            return;
        }

        dados.forEach((user, index) => {
            const row = document.createElement('tr');
            
            // Lógica das medalhas
            let posicao = `${index + 1}º`;
            let classePos = "";
            if(index === 0) { posicao = "🥇 1º"; classePos = "pos-1"; }
            else if(index === 1) { posicao = "🥈 2º"; classePos = "pos-2"; }
            else if(index === 2) { posicao = "🥉 3º"; classePos = "pos-3"; }

            row.innerHTML = `
                <td class="${classePos}">${posicao}</td>
                <td>${mascararEmail(user.email)}</td>
                <td class="val-destaque">${user.score}</td>
            `;
            corpoTabela.appendChild(row);
        });
    } catch (error) {
        console.error("Erro no ranking:", error);
        corpoTabela.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">⚠️ Falha ao carregar ranking.</td></tr>';
    }
}

// Protege a privacidade para não expor e-mails dos usuários [cite: 2026-01-02]
function mascararEmail(email) {
    if (!email || !email.includes('@')) return "Usuário Anônimo";
    const [usuario, dominio] = email.split('@');
    return usuario.substring(0, 3) + '***@' + dominio;
}

// Inicia o site carregando o primeiro ranking automaticamente
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosRanking('indicadores');
});

// Carregar e-mail salvo ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    const salvo = localStorage.getItem('brazuka_ref_email');
    if (salvo) {
        document.getElementById('ref-email').value = salvo;
        gerarLinkRef(); // Já mostra o link se já existir
    }
});

function gerarLinkRef() {
    const email = document.getElementById('ref-email').value.trim();
    if (!email || !email.includes('@')) {
        alert("Ei Pejotta, avisa pro cara digitar um e-mail válido! 😂");
        return;
    }

    // Salva no Banco de Dados local do navegador [cite: 2025-12-26]
    localStorage.setItem('brazuka_ref_email', email);

    // Gera o link (ajuste a URL para a sua Home ou Faucet)
    const linkFinal = `https://www.brazukafaucets.com.br/?ref=${btoa(email)}`;
    
    document.getElementById('link-gerado').value = linkFinal;
    document.getElementById('display-link').style.display = 'flex';
    
    const btnGerar = document.getElementById('btn-gerar');
    btnGerar.innerText = "ATUALIZADO!";
    setTimeout(() => btnGerar.innerText = "GERAR LINK", 2000);
}

function copiarLinkRef() {
    const copyText = document.getElementById("link-gerado");
    copyText.select();
    copyText.setSelectionRange(0, 99999); // Mobile
    navigator.clipboard.writeText(copyText.value);
    
    alert("Link copiado! Agora é só espalhar e subir no ranking! 🚀");
}
