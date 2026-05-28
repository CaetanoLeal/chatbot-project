require("dotenv").config({
  path: "../../.env"
});

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testarIA() {

  try {

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content: "Você é um assistente virtual amigável."
        },
        {
          role: "user",
          content: "Olá, tudo bem?"
        }
      ],

      temperature: 0.7,
      max_tokens: 100,
    });

    console.log("\nRESPOSTA DA IA:\n");

    console.log(response.choices[0].message.content);

  } catch (error) {

    console.error("\nERRO:\n");

    console.error(error);

  }
}

testarIA();