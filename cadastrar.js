// cadastrar.js (FRONTEND)
const btn = document.getElementById('btn-cadastrar');

// O botão começa desabilitado para ninguém enviar sem captcha
btn.disabled = true; 
btn.style.opacity = '0.5';
btn.style.cursor = 'not-allowed';

// Essa função é chamada pelo "data-callback" do HTML quando o captcha é resolvido
window.onTurnstileSuccess = function(token) {
    console.log("Captcha resolvido com sucesso!");
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.style.backgroundColor = '#1a73e8';
};

document.addEventListener('DOMContentLoaded', () => {
    
    // Função para gerenciar campos "Outros"
    function gerenciarCampoOutro(idCheck, idCampo, idInput) {
        const checkbox = document.getElementById(idCheck);
        const container = document.getElementById(idCampo);
        const input = document.getElementById(idInput);

        if (checkbox && container) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    container.style.display = 'block';
                    input.setAttribute('required', 'required');
                    input.focus();
                } else {
                    container.style.display = 'none';
                    input.removeAttribute('required');
                    input.value = '';
                }
            });
        }
    }

    // Aplica para as Moedas
    gerenciarCampoOutro('check-outra-moeda', 'campo-outra-moeda', 'input-outra-moeda');

    // Aplica para os Pagamentos
    gerenciarCampoOutro('check-outro-pagamento', 'campo-outro-pagamento', 'input-outro-pagamento');
});
