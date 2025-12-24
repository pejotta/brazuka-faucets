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
