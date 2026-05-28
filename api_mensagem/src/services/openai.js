const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function gerarResposta({
  model,
  messages,
  temperature,
  max_tokens
}) {

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens,
  });

  return {
    content: response.choices[0].message.content,
    usage: response.usage,
  };
}

module.exports = {
  gerarResposta
};