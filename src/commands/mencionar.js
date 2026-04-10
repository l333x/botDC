/**
 * mencionar.js — Comando /mencionar
 * Genera un mensaje creativo con Gemini y etiqueta a un usuario.
 *
 * Uso: /mencionar usuario:@alguien vibra:"Insulto amigable"
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
                    { name: '🔥 Insulto amigable', value: 'Insulto amigable' },
                    { name: '💖 Declaración de amor cringe', value: 'Declaración de amor cringe' },
                    { name: '🧠 Dato perturbador', value: 'Dato perturbador' },
                    { name: '🗣️ Chisme falso', value: 'Chisme falso' },
                ),
        ),

    // ─── Ejecución del comando ─────────────────────────────────────────
    async execute(interaction) {
        // Diferir la respuesta porque Gemini puede tardar unos segundos
        await interaction.deferReply();

        const usuario = interaction.options.getUser('usuario');
        const vibra = interaction.options.getString('vibra');

        try {
            // Generar el mensaje con Gemini Flash
            const mensaje = await generarMensaje(vibra, usuario.displayName);

            // Enviar el mensaje etiquetando al usuario
            await interaction.editReply(
                `<@${usuario.id}>, Gemini tiene algo que decirte:\n\n> ${mensaje}`,
            );
        } catch (error) {
            console.error('❌ Error en /mencionar:', error);
            await interaction.editReply(
                '😵 Algo salió mal al generar el mensaje. Intenta de nuevo.',
            );
        }
    },
};
