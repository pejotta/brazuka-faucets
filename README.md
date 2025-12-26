# 🌀 Brazuka Faucets 🚀

![Logo Brazuka](assets/assets/logo-brazuka.png)

> O hub definitivo para quem quer ganhar criptomoedas de forma gratuita e auditada.

[![Status](https://img.shields.io/badge/Status-Ativo-brightgreen)](#)
[![SEO](https://img.shields.io/badge/SEO-Otimizado-blue)](#)
[![Analytics](https://img.shields.io/badge/Google-Analytics%20Ativo-orange)](#)

O **Brazuka Faucets** é uma plataforma brasileira desenvolvida para listar, auditar e organizar as melhores faucets de criptomoedas do mercado. Nosso diferencial é a transparência e a curadoria manual realizada pelo **Pejotta**.

## 🛠️ Tecnologias Utilizadas

Este é um projeto **Static-First**, focado em velocidade de carregamento e performance:

* **Frontend:** HTML5, CSS3 (Modern UI) e JavaScript Puro (Vanilla JS).
* **Banco de Dados:** Estrutura dinâmica baseada em arquivos JSON.
* **Hospedagem:** Cloudflare Pages.
* **Monitoramento:** Google Analytics 4 & Google Search Console.

## 📂 Estrutura do Projeto

O repositório está organizado de forma a facilitar o deploy e a indexação pelo Google:

- `index.html`: Página principal com o ranking das melhores faucets.
- `/moedas`: Páginas individuais otimizadas para SEO de cada ativo (BTC, SOL, DOGE, etc).
- `faucets_data.json`: Nosso "banco de dados" centralizado.
- `gerador.html`: Ferramenta administrativa interna para criação de novos itens JSON.
- `cadastrar-faucet.html`: Formulário para a comunidade sugerir novas plataformas.

## 🚀 Como Contribuir ou Adicionar uma Faucet

Se você é dono de uma faucet ou encontrou uma que paga direitinho:

1. Acesse a página [Cadastrar Faucet](https://brazuka-faucets.pages.dev/cadastrar-faucet.html).
2. Preencha os dados da auditoria.
3. O administrador irá validar os dados e atualizar o `faucets_data.json`.

## 🔒 Segurança e Auditoria

Todas as plataformas listadas passam por uma auditoria que verifica:
- [x] Status de pagamento (Paying/Pending/Scam).
- [x] Tipo de Captcha utilizado.
- [x] Mínimo de saque e métodos (FaucetPay, Metamask, etc).
- [x] Timer e frequência.

---
<p align="center">
Desenvolvido com ❤️ por <strong>Pejotta</strong> para a comunidade cripto brasileira.
</p>
