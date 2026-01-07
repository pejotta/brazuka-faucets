// content-script.js - O Diplomata

function syncLogin() {
    // 1. Pega o e-mail que o usuário logou no seu site
    const wallet = localStorage.getItem('brazuka_wallet') || localStorage.getItem('brazuka_user_email');

    if (wallet) {
        // 2. Salva na memória da EXTENSÃO
        chrome.storage.local.set({ "brazuka_wallet": wallet }, () => {
            console.log("Extensão Brazuka: Login sincronizado com sucesso!");
        });
    }
}

// Executa assim que a página carrega
syncLogin();

// Opcional: Fica vigiando se o usuário trocar de conta no site
window.addEventListener('storage', (e) => {
    if (e.key === 'brazuka_wallet') syncLogin();
});
