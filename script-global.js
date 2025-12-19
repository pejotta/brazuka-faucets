// Função única e poderosa para carregar qualquer componente
async function loadComponent(id, file, mode = 'inner') {
    const element = document.getElementById(id);
    if (!element) return; // Se não achar o ID na página, ele ignora silenciosamente

    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Não foi possível carregar ${file}`);
        const html = await response.text();

        if (mode === 'inner') {
            element.innerHTML = html;
        } else if (mode === 'afterbegin') {
            element.insertAdjacentHTML('afterbegin', html);
        } else if (mode === 'beforeend') {
            element.insertAdjacentHTML('beforeend', html);
        }
    } catch (error) {
        console.error('Erro no componente:', error);
    }
}

// Quando o documento carregar, ele executa tudo de uma vez
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Injeta o Header (Menu) - Use um ID 'header-placeholder' no seu HTML
    loadComponent('header-placeholder', 'menu_template.html');

    // 2. Injeta os Ads
    loadComponent('top-ad-placeholder', 'top_ad.html');
    loadComponent('bottom-ad-placeholder', 'bottom_ad.html');

    // 3. Injeta o Footer - Use um ID 'footer-placeholder' no seu HTML
    loadComponent('footer-placeholder', 'footer_template.html');
});
