export async function onRequestPost(context) {
    const { request, env } = context;
    const formData = await request.formData();
    
    // O Turnstile envia esse campo automaticamente
    const token = formData.get('cf-turnstile-response');
    const secret = env.TURNSTILE_SECRET_KEY; // Aqui o Pages busca o segredo que você salvou!

    // Valida com a Cloudflare
    const verifyResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: JSON.stringify({
            secret: secret,
            response: token
        }),
        headers: { 'Content-Type': 'application/json' }
    });

    const outcome = await verifyResult.json();

    if (outcome.success) {
        // CÓDIGO SE O CAPTCHA FOR VÁLIDO
        return new Response("Sucesso! Vamos auditar sua faucet.", { status: 200 });
    } else {
        // CÓDIGO SE FOR BOT
        return new Response("Erro no Captcha. Tente novamente!", { status: 403 });
    }
}
