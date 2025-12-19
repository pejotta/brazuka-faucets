async function loadEverything() {
    // 1. Carregar Header (Menu)
    try {
        const res = await fetch('menu_template.html');
        const html = await res.text();
        const placeholder = document.getElementById('header-placeholder');
        if (placeholder) {
            placeholder.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }
    } catch (e) { console.error("Erro no Menu:", e); }

    // 2. Carregar Ads (Só se existirem os Placeholders)
    loadAd('top-ad-placeholder', 'top_ad.html');
    loadAd('bottom-ad-placeholder', 'bottom_ad.html');

    // 3. Carregar Footer
    try {
        const res = await fetch('footer_template.html');
        const html = await res.text();
        const placeholder = document.getElementById('footer-placeholder');
        if (placeholder) {
            placeholder.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML('beforeend', html);
        }
    } catch (e) { console.error("Erro no Footer:", e); }
}

async function loadAd(id, file) {
    const el = document.getElementById(id);
    if (el) {
        try {
            const res = await fetch(file);
            const html = await res.text();
            el.innerHTML = html;
        } catch (e) { console.error(`Erro no Ad ${file}:`, e); }
    }
}

// Executa assim que o script é lido
loadEverything();
