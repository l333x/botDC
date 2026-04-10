/**
 * insultar.js — Comando /insultar
 * Genera un insulto creativo, tóxico y latino dirigido a un usuario.
 *
 * Uso: /insultar usuario:@alguien
 */

const { SlashCommandBuilder } = require('discord.js');
const { generarMensaje } = require('../services/gemini');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('insultar')
        .setDescription('Gemini le tira la toxicidad a alguien. Con cariño, claro.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('¿Quién se merece el insulto?')
                .setRequired(true),
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const usuario = interaction.options.getUser('usuario');

        try {
            const mensaje = await generarMensaje(
                'Insulto creativo, tóxico, latino y muy basado. Hazlo personal y directo, nada genérico.',
                usuario.displayName,
            );

            await interaction.editReply(
                `<@${usuario.id}> 🎯\n\n> ${mensaje}`,
            );
        } catch (error) {
            console.error('❌ Error en /insultar:', error);
            await interaction.editReply('😵 Gemini se negó a insultar. Eso sí es raro.');
        }
    },
};
