import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ===== BASE DE CONHECIMENTO ===== */

const baseSorteio = `
Até quando vai a campanha?
Período da Promoção: De 20.01 a 17.12
Período de Participação: De 20.01 a 14.12

Quais lojas participam?
Todas as lojas Nichele Materiais de Construção + Nichele Tintas.
Não vale para a loja Vero Acabamentos.

Quem pode participar?
Pessoas físicas e jurídicas maiores de 18 anos com CPF válido.

Quem não pode participar?
Menores de 18 anos, pessoas sem CPF válido, funcionários da empresa e familiares diretos.

Como participar?
Compras a partir de R$ 2.000,00 + cadastro no hotsite ou WhatsApp.

Saldo de compra
Valores abaixo de R$ 2.000,00 acumulam para próxima compra.

Onde ver o número da sorte?
No hotsite ou WhatsApp oficial da campanha.

Quando acontecem os sorteios?
Quartas ou sábados conforme calendário oficial da campanha.

Ganhou uma vez participa de novo?
Não, cada CPF pode ganhar apenas uma vez.

Entrega do prêmio
Retirada presencial na filial Xaxim, com documento e CPF.
`;

const baseRoleta = `
Até quando vai a campanha?
De 20/01/2026 a 23/12/2026 ou enquanto durarem os prêmios.

Quais lojas participam?
Somente lojas Nichele Materiais de Construção.

Como participar?
Compras acima de R$ 2.000,00 geram 1 Giro da Sorte.

Giro da Sorte
Limitado a 1 giro por compra.

Onde ver o resultado?
No hotsite ou WhatsApp oficial.

Entrega do prêmio
Loja física, e-commerce ou televendas conforme a compra.
`;

/* ===== FUNÇÃO PRINCIPAL ===== */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método não permitido" });
  }

  const { message, contexto } = req.body;

  // Cumprimentos simples
  if (/^(oi|olá|ola|bom dia|boa tarde|boa noite)/i.test(message)) {
    return res.json({
      reply:
        "Olá! 😊 Seja muito bem-vindo ao Assistente do Evento Nichele.\n\nSua dúvida é sobre **Sorteio** ou **Roleta**?\n\nVocê pode clicar ou escrever 😉",
      options: ["Sorteio", "Roleta"],
    });
  }

  // Escolha por texto
  if (/sorteio/i.test(message)) {
    return res.json({
      reply: "Perfeito! 😊 Pode me contar qual é sua dúvida sobre o **Sorteio**?",
      contexto: "sorteio",
    });
  }

  if (/roleta/i.test(message)) {
    return res.json({
      reply: "Ótimo! 🎯 Qual é sua dúvida sobre a **Roleta**?",
      contexto: "roleta",
    });
  }

  // Se ainda não escolheu o contexto
  if (!contexto) {
    return res.json({
      reply:
        "Só para eu te ajudar melhor 😊 sua dúvida é sobre **Sorteio** ou **Roleta**?",
      options: ["Sorteio", "Roleta"],
    });
  }

  // Monta prompt com base correta
  const base =
    contexto === "sorteio" ? baseSorteio : baseRoleta;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Você é um atendente educado, paciente e claro. Responda somente usando a base fornecida. Se não encontrar a resposta, seja educado e sugira atendimento humano.",
        },
        {
          role: "user",
          content: `Base de conhecimento:\n${base}\n\nPergunta do cliente:\n${message}`,
        },
      ],
    });

    const reply =
      completion.choices[0].message.content;

    return res.json({
      reply,
      contexto,
    });
  } catch (error) {
    return res.json({
      reply:
        "⚠️ Não consegui encontrar essa informação no momento.\n\nSe preferir, você pode falar com nosso atendimento no WhatsApp 😊",
    });
  }
}
