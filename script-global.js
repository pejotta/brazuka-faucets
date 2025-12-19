document.addEventListener('DOMContentLoaded', () => {
    // Função para carregar e injetar o HTML do menu
    async function loadHeader() {
        try {
            // 1. Busca o template do menu
            const response = await fetch('menu_template.html');
            if (!response.ok) {
                throw new Error('Erro ao carregar menu_template.html');
            }
            const menuHtml = await response.text();

            // 2. Injeta o HTML no corpo da página
            // Vamos injetar o menu como o primeiro elemento dentro do <body>
            document.body.insertAdjacentHTML('afterbegin', menuHtml);

        } catch (error) {
            console.error('Falha ao injetar o cabeçalho:', error);
            // Fallback simples caso o template falhe
            const fallbackHeader = document.createElement('header');
            fallbackHeader.innerHTML = '<div style="padding:15px; background:red; color:white;">ERRO: Menu não carregado.</div>';
            document.body.insertAdjacentHTML('afterbegin', fallbackHeader.outerHTML);
        }
    }

    loadHeader();
});
