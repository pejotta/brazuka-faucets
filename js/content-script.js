// Captura o login do site e manda para a extensão
const wallet = localStorage.getItem('brazuka_wallet');
if (wallet) {
    chrome.storage.local.set({ brazuka_wallet: wallet });
}
