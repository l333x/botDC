/**
 * resumen.js — Comando /resumen
 * Lee los últimos 60 mensajes del canal actual y genera un resumen sarcástico con Gemini.
 *
 * Uso: /resumen
 */

const { SlashCommandBuilder } = require('discord.js');
const { generarTextoLibre } = require('../services/gemini');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resumen')
        .setDescription('Gemini lee los últimos mensajes del canal y te da el chisme resumido.'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Fetch últimos 60 mensajes del canal
            const mensajesRaw = await interaction.channel.messages.fetch({ limit: 60 });

            // Filtrar: solo mensajes de humanos (no bots), con contenido
            const mensajes = mensajesRaw
                .filter(m => !m.author.bot && m.content.trim().length > 0)
                .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
                .map(m => `${m.author.displayName}: ${m.content}`)
                .slice(0, 50); // Limitar para no exceder contexto

            if (mensajes.length === 0) {
                await interaction.editReply('🫥 No hay mensajes de humanos recientes en este canal. Esto está más muerto que MySpace.');
                return;
            }

            const conversacion = mensajes.join('\n');

            const prompt = [
                `Eres un chismoso profesional de un servidor de Discord latino.`,
                `Te voy a dar los últimos mensajes de un canal de Discord.`,
                `Tu tarea: haz un RESUMEN sarcástico, gracioso y chismoso de lo que se habló.`,
                `REGLAS:`,
                `- Resalta los puntos más interesantes/polémicos/graciosos.`,
                `- Si alguien dijo algo estúpido, señálalo.`,
                `- Usa jerga de internet y humor tóxico amigable.`,
                `- Máximo 6-8 líneas.`,
                `- Formato: usa bullet points con emojis.`,
                `- PROHIBIDO sonar como una IA. Suena como un amigo del servidor.`,
                ``,
                `MENSAJES DEL CANAL:`,
                conversacion,
            ].join('\n');

            const respuesta = await generarTextoLibre(prompt);

            // Truncar si es muy largo
            const textoFinal = respuesta.length > 1900
                ? respuesta.substring(0, 1900) + '\n\n_...resumen truncado_'
                : respuesta;

            await interaction.editReply(`📋 **Resumen del chisme de este canal:**\n\n${textoFinal}`);
        } catch (error) {
            console.error('❌ Error en /resumen:', error);
            await interaction.editReply('😵 No pude resumir el canal. Gemini se negó a chismear.');
        }
    },
};
