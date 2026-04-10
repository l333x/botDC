/**
 * chat.js — Comando /chat
 * Chat libre con Gemini CON memoria persistente via Supabase.
 * El bot recuerda conversaciones pasadas de cada usuario.
 *
 * Uso: /chat mensaje:"¿Qué opinas de los lunes?"
 */

const { SlashCommandBuilder } = require('discord.js');
const { generarConHistorial } = require('../services/gemini');
const { obtenerHistorial, guardarHistorial } = require('../services/supabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Habla con Gemini — recuerda todo lo que le dijiste antes.')
        .addStringOption(option =>
            option
                .setName('mensaje')
                .setDescription('¿Qué le quieres decir a Gemini?')
                .setRequired(true),
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const mensajeUsuario = interaction.options.getString('mensaje');
        const discordId = interaction.user.id;

        try {
            // 1. Leer historial existente de Supabase
            const historial = await obtenerHistorial(discordId);

            // 2. Generar respuesta con contexto
            const respuesta = await generarConHistorial(historial, mensajeUsuario);

            // 3. Actualizar historial con el nuevo par de mensajes
            const nuevoHistorial = [
                ...historial,
                { role: 'user', parts: [{ text: mensajeUsuario }] },
                { role: 'model', parts: [{ text: respuesta }] },
            ];

            // 4. Guardar en Supabase (async, no bloquea la respuesta)
            guardarHistorial(discordId, nuevoHistorial).catch(err =>
                console.error('❌ Error guardando historial:', err.message),
            );

            // 5. Responder al usuario
            // Truncar si excede el límite de Discord (2000 chars)
            const textoFinal = respuesta.length > 1900
                ? respuesta.substring(0, 1900) + '\n\n_...respuesta truncada_'
                : respuesta;

            await interaction.editReply(`💬 ${textoFinal}`);
        } catch (error) {
            console.error('❌ Error en /chat:', error);
            await interaction.editReply('😵 Gemini se desconectó. Intenta de nuevo.');
        }
    },
};
