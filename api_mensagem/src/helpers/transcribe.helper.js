//src/helpers/transcribe.helper.js
const OpenAI = require("openai");
const fs = require("fs");

const client = new OpenAI({
    apiKey: process.env.GPT_4O_MINI_TRANSCRIBLE_KEY
});

async function transcreverAudio(path) {

    const resposta = await client.audio.transcriptions.create({
        file: fs.createReadStream(path),
        model: "gpt-4o-mini-transcribe",
        prompt: `
        Transcreva o áudio em português brasileiro seguindo estas regras:
        - Se a pessoa falar uma data, escreva no formato dd/mm/aaaa sempre que possível.
        Exemplo: "vinte e cinco de dezembro de dois mil e vinte e cinco" -> 25/12/2025.
        - Se a pessoa falar apenas dia e mês, escreva dd/mm.
        Exemplo: "vinte e cinco de dezembro" -> 25/12.
        - Se a pessoa falar números, escreva utilizando algarismos, nunca por extenso.
        Exemplo: "um" -> 1, "dois" -> 2, "três" -> 3, "quatro" -> 4, "cinco" -> 5, "seis" -> 6, "sete" -> 7, "oito" -> 8, "nove" -> 9, "dez" -> 10, "cem" -> 100, "mil" -> 1000.
        - Preserve o restante do texto exatamente como foi falado.
        `
    });

    return resposta.text;
}

function salvarAudio(buffer, caminho){

    fs.writeFileSync(caminho, buffer);

    return caminho;

};

const ffmpeg = require("fluent-ffmpeg");

async function converter(origem, destino){

    return new Promise((resolve,reject)=>{

        ffmpeg(origem)
        .toFormat("mp3")
        .save(destino)
        .on("end",resolve)
        .on("error",reject);

    });

}
    module.exports = {
        transcreverAudio,
        salvarAudio,
        converter
    };