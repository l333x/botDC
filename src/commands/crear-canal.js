/**
 * crear-canal.js — Comando /crear-canal
 * Crea un canal de texto nuevo en el servidor.
 *
 * Uso: /crear-canal nombre:"memes-random"
 */

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crear-canal')
        .setDescription('Crea un canal de texto nuevo en el servidor.')
        .addStringOption(option =>
            option
                .setName('nombre')
                .setDescription('Nombre para el nuevo canal (sin espacios).')
                .setRequired(true),
        )
        // Solo usuarios con permiso de gestionar canales pueden usarlo
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        await interaction.deferReply();

        const nombreInput = interaction.options.getString('nombre');
        // Sanitizar el nombre: minúsculas, sin espacios, solo caracteres válidos
        const nombreCanal = nombreInput.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (!nombreCanal) {
            await interaction.editReply('❌ El nombre del canal no es válido. Usa letras y números, bro.');
            return;
        }

        try {
            const guild = interaction.guild;

            // Verificar si ya existe
            const existe = guild.channels.cache.find(
                ch => ch.name === nombreCanal && ch.type === ChannelType.GuildText,
            );

            if (existe) {
                await interaction.editReply(
                    `⚠️ Ya existe un canal llamado **#${nombreCanal}**: <#${existe.id}>`,
                );
                return;
            }

            const nuevoCanal = await guild.channels.create({
                name: nombreCanal,
                type: ChannelType.GuildText,
                reason: `Canal creado por ${interaction.user.displayName} vía /crear-canal`,
            });

            await interaction.editReply(
                `✅ Canal creado exitosamente: <#${nuevoCanal.id}> 🎉`,
            );
        } catch (error) {
            console.error('❌ Error en /crear-canal:', error);
            await interaction.editReply(
                '❌ No pude crear el canal. ¿El bot tiene permisos de gestionar canales?',
            );
        }
    },
};
