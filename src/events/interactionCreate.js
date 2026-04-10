/**
 * interactionCreate.js — Despacha las interacciones de slash commands.
 * Busca el comando en client.commands y ejecuta su función execute().
 */

const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // Solo procesar slash commands (ignorar botones, modals, etc.)
        if (!interaction.isChatInputCommand()) return;

        const comando = interaction.client.commands.get(interaction.commandName);

        if (!comando) {
            console.warn(`⚠️ Comando no encontrado: ${interaction.commandName}`);
            return;
        }

        try {
            await comando.execute(interaction);
        } catch (error) {
            console.error(`❌ Error ejecutando /${interaction.commandName}:`, error);

            // Intentar responder al usuario con un mensaje de error
            const respuesta = {
                content: '❌ Hubo un error al ejecutar este comando.',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(respuesta).catch(() => { });
            } else {
                await interaction.reply(respuesta).catch(() => { });
            }
        }
    },
};
