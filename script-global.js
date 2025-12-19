document.addEventListener('DOMContentLoaded', () => {
    
    // Função para carregar e injetar o HEADER (Menu)
    async function loadHeader() {
        try {
            const response = await fetch('menu_template.html');
            if (!response.ok) throw new Error('Erro ao carregar menu_template.html');
            const menuHtml = await response.text();
            
            // Injeta o menu como o primeiro elemento dentro do <body>
            document.body.insertAdjacentHTML('afterbegin', menuHtml);
        } catch (error) {
            console.error('Falha ao injetar o cabeçalho:', error);
        }
    }

    // NOVA FUNÇÃO: Carregar e injetar o FOOTER (Rodapé)
    async function loadFooter() {
        try {
            const response = await fetch('footer_template.html');
            if (!response.ok) throw new Error('Erro ao carregar footer_template.html');
            const footerHtml = await response.text();
            
            // Injeta o rodapé como o último elemento dentro do <body>
            document.body.insertAdjacentHTML('beforeend', footerHtml);
        } catch (error) {
            console.error('Falha ao injetar o rodapé:', error);
        }
    }

    // Chamando as funções. É melhor carregar o Header, depois o Footer.
    loadHeader();
    loadFooter();

    // Função para carregar componentes (Menu, Footer e agora Ads)
async function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (element) {
        try {
            const response = await fetch(file);
            const data = await response.text();
            element.innerHTML = data;
        } catch (error) {
            console.error(`Erro ao carregar o componente: ${file}`, error);
        }
    }
}

// Chame os componentes quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header-placeholder", "header_template.html");
    loadComponent("footer-placeholder", "footer_template.html");
    
    // NOVOS: Injeção de Ads
    loadComponent("top-ad-placeholder", "top_ad.html");
    loadComponent("bottom-ad-placeholder", "bottom_ad.html");
});
});
