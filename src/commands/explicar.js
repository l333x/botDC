/**
 * explicar.js — Comando /explicar
 * Toma un tema complejo y lo explica como si tuvieras 5 años, con humor latino.
 *
 * Uso: /explicar tema:"La teoría de la relatividad"
 */

const { SlashCommandBuilder } = require('discord.js');
const { generarTextoLibre } = require('../services/gemini');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explicar')
        .setDescription('Gemini te lo explica como si tuvieras 5 años (pero con sarcasmo).')
        .addStringOption(option =>
            option
                .setName('tema')
                .setDescription('¿Qué quieres que te explique?')
                .setRequired(true),
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const tema = interaction.options.getString('tema');

        try {
            const prompt = [
                `Eres un profesor latino muy sarcástico y gracioso.`,
                `Explica el siguiente tema como si el usuario tuviera 5 años de edad.`,
                `Tema: "${tema}"`,
                `REGLAS:`,
                `- Usa analogías absurdas y graciosas (ej: "es como cuando tu mamá te esconde las galletas").`,
                `- Sé sarcástico pero que se entienda la explicación real.`,
                `- Usa jerga latina (ej: pa, mijo, ñaño, bro, viejo).`,
                `- Máximo 4-5 líneas.`,
                `- PROHIBIDO sonar como ChatGPT o una enciclopedia.`,
                `- Responde SOLO con la explicación, nada más.`,
            ].join('\n');

            const respuesta = await generarTextoLibre(prompt);

            await interaction.editReply(`🧒 **Explicación para bebés de:** _${tema}_\n\n${respuesta}`);
        } catch (error) {
            console.error('❌ Error en /explicar:', error);
            await interaction.editReply('😵 Gemini no supo explicarlo. Ni un niño de 5 lo entendería.');
        }
    },
};
