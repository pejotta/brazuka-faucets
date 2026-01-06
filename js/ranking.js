// ANALISTA: Centralizando a lógica e integrando o Login Global [cite: 2026-01-02]
const API_URL = "https://brazuka-faucets.moneynanet-yt.workers.dev";

// 1. EVENTO DE INICIALIZAÇÃO ÚNICO
document.addEventListener('DOMContentLoaded', () => {
    // A) Gerenciar e-mail e Link de Ref
    const salvo = localStorage.getItem('brazuka_user_email'); // Padronizado para o Login Global
    if (salvo) {
        const campoEmail = document.getElementById('ref-email');
        if(campoEmail) {
            campoEmail.value = salvo;
            gerarLinkRef(); 
        }
    }

    // B) Ativar o Ranking de Faucets como padrão
    const btnFaucets = document.querySelectorAll('.tab-btn')[1]; // Pega o segundo botão (Faucets)
    if(btnFaucets) {
        mudarTab('claimers', btnFaucets);
    } else {
        carregarDadosRanking('claimers');
    }
});

// 2. LÓGICA DAS TABS
async function mudarTab(tipo, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const label = document.getElementById('label-valor');
    const titulo = document.getElementById('titulo-ranking'); // ANALISTA: Adicionado para mudar o H1 também

    if(tipo === 'indicadores') {
        label.innerText = "Amigos Ativos";
        if(titulo) titulo.innerText = "Ranking de Indicadores";
    } else if(tipo === 'claimers') {
        label.innerText = "Total de Claims";
        if(titulo) titulo.innerText = "Ranking de Faucets (TRX/TON)";
    } else {
        label.innerText = "Links Completos";
        if(titulo) titulo.innerText = "Ranking de Shortlinks (DOGE)";
    }

    await carregarDadosRanking(tipo);
}

// 3. BUSCA NO BANCO DE DADOS
async function carregarDadosRanking(tipo) {
    const corpoTabela = document.getElementById('corpo-tabela');
    corpoTabela.innerHTML = '<tr><td colspan="3" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Consultando Banco de Dados...</td></tr>';

    try {
        // ANALISTA: Adicionado t=Date.now() para evitar cache de rankings antigos
        const response = await fetch(`${API_URL}/get-rankings?tipo=${tipo}&t=${Date.now()}`);
        const dados = await response.json();

        corpoTabela.innerHTML = ''; 

        if (dados.length === 0) {
            corpoTabela.innerHTML = '<tr><td colspan="3" style="text-align:center;">Ninguém no ranking ainda. Seja o primeiro! 🚀</td></tr>';
            return;
        }

        dados.forEach((user, index) => {
            const row = document.createElement('tr');
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

// 4. LÓGICA DE REFERÊNCIA E STATUS
function gerarLinkRef() {
    const email = document.getElementById('ref-email').value.trim().toLowerCase();
    
    if (!email || !email.includes('@')) {
        mostrarStatus("❌ Digite um e-mail válido da FaucetPay", "msg-erro");
        return;
    }

    // ANALISTA: Salva na chave global que usamos em todo o site [cite: 2026-01-02]
    localStorage.setItem('brazuka_user_email', email);
    
    const linkFinal = `https://www.brazukafaucets.com.br/?ref=${email}`;
    document.getElementById('link-gerado').value = linkFinal;
    document.getElementById('display-link').style.display = 'flex';
    
    mostrarStatus("✅ Link gerado e login realizado!", "msg-sucesso");
}

function copiarLinkRef() {
    const copyText = document.getElementById("link-gerado");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    mostrarStatus("📋 Link copiado com sucesso!", "msg-copiado");
}

function mostrarStatus(texto, tipo) {
    const msgDiv = document.getElementById('status-msg');
    if(!msgDiv) return;
    msgDiv.innerText = texto;
    msgDiv.className = 'status-msg ' + tipo;
    msgDiv.style.opacity = '1';
    
    setTimeout(() => {
        msgDiv.style.opacity = '0';
    }, 3000);
}

function mascararEmail(email) {
    if (!email || !email.includes('@')) return "Usuário Anônimo";
    const [usuario, dominio] = email.split('@');
    return usuario.substring(0, 3) + '***@' + dominio;
}
