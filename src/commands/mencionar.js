/**
 * mencionar.js — Comando /mencionar
 * Genera un mensaje creativo con Gemini y etiqueta a un usuario.
 */

const { SlashCommandBuilder } = require('discord.js');
const { generarMensaje } = require('../services/gemini');

module.exports = {
    // ─── Definición del comando ────────────────────────────────────────
    data: new SlashCommandBuilder()
        .setName('mencionar')
        .setDescription('Genera un mensaje épico con IA y etiqueta a alguien.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('¿A quién quieres mencionar?')
                .setRequired(true),
        )
        .addStringOption(option =>
            option
                .setName('vibra')
                .setDescription('Elige el tono del mensaje.')
                .setRequired(true)
                .addChoices(
                    // Aquí ponemos values CORTOS para que Discord no tire error
                    { name: '🤬 Insulto crudo', value: 'insulto' },
                    { name: '💖 Amor romántico', value: 'amor' },
                    { name: '🔥 Vibra sexual', value: 'sexual' },
                ),
        ),

    // ─── Ejecución del comando ─────────────────────────────────────────
    async execute(interaction) {
        await interaction.deferReply();

        const usuario = interaction.options.getUser('usuario');
        const vibraCorta = interaction.options.getString('vibra');

        // Aquí traducimos la palabra corta a la orden destructiva para Gemini
        let instruccionGemini = '';
        if (vibraCorta === 'insulto') {
            instruccionGemini = 'Un insulto normal, directo, tóxico y sin censura.';
        } else if (vibraCorta === 'amor') {
            instruccionGemini = 'Una declaración de amor profunda, sincera y muy romántica.';
        } else if (vibraCorta === 'sexual') {
            instruccionGemini = 'Un comentario muy subido de tono, atrevido, caliente y seductor con doble sentido latino.';
        }

        try {
            // Le mandamos la instrucción completa a Gemini
            const mensaje = await generarMensaje(instruccionGemini, usuario.displayName);

            await interaction.editReply(
                `<@${usuario.id}>, EX tiene algo que decirte:\n\n> ${mensaje}`,
            );
        } catch (error) {
            console.error('❌ Error en /mencionar:', error);
            await interaction.editReply(
                '😵 Algo salió mal al generar el mensaje. Intenta de nuevo.',
            );
        }
    },
};