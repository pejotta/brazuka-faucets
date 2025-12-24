// functions/enviar.js (BACKEND)
export async function onRequestPost(context) {
    const { request, env } = context;
    
    // Pegamos os dados do formulário
    const formData = await request.formData();
    const token = formData.get('cf-turnstile-response');
    const secret = env.TURNSTILE_SECRET_KEY;

    // 1. Valida o Captcha com a Cloudflare
    const verifyResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    });

    const outcome = await verifyResult.json();

    if (!outcome.success) {
        return new Response("Erro: Captcha inválido ou expirado.", { status: 403 });
    }

    // 2. Se o captcha passou, envia para o Formspree
    // Aqui você faz o seu Worker encaminhar os dados para o Formspree
    // OU simplesmente mude o 'action' do seu HTML para apontar para esta Function
    
    return new Response("Tudo certo! Recebemos sua faucet.", { status: 200 });
}
