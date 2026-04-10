/**
 * privado.js — Comando /privado
 * Crea un canal de texto privado (solo visible para el usuario y el bot).
 *
 * Uso: /privado
 */

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('privado')
        .setDescription('Crea un canal secreto entre tú y el bot. Nadie más puede ver.'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const usuario = interaction.user;
            const botMember = guild.members.me;

            // Nombre del canal basado en el usuario
            const nombreCanal = `privado-${usuario.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

            // Verificar si ya existe un canal privado para este usuario
            const canalExistente = guild.channels.cache.find(
                ch => ch.name === nombreCanal && ch.type === ChannelType.GuildText,
            );

            if (canalExistente) {
                await interaction.editReply(
                    `🔒 Ya tienes un canal privado: <#${canalExistente.id}>. No seas acumulador.`,
                );
                return;
            }

            // Crear canal con permisos restringidos
            const canalPrivado = await guild.channels.create({
                name: nombreCanal,
                type: ChannelType.GuildText,
                topic: `Canal privado de ${usuario.displayName} con el bot 🤖`,
                permissionOverwrites: [
                    {
                        // Denegar acceso a @everyone
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        // Permitir acceso al usuario
                        id: usuario.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                        ],
                    },
                    {
                        // Permitir acceso al bot
                        id: botMember.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels,
                        ],
                    },
                ],
            });

            // Enviar mensaje de bienvenida al canal privado
            await canalPrivado.send([
                `👋 Qué onda **${usuario.displayName}**, bienvenido a tu búnker secreto.`,
                ``,
                `🧠 **El chat con memoria está activo aquí gracias a la base de datos.**`,
                `Usa \`/chat\` para hablar conmigo y recordaré todo lo que me digas.`,
                ``,
                `🔒 Nadie más puede ver este canal. Lo que pasa aquí, se queda aquí.`,
            ].join('\n'));

            await interaction.editReply(
                `✅ Canal creado: <#${canalPrivado.id}>. Ve directo, te espero ahí. 😏`,
            );
        } catch (error) {
            console.error('❌ Error en /privado:', error);
            await interaction.editReply(
                '❌ No pude crear el canal. ¿El bot tiene permisos de gestionar canales?',
            );
        }
    },
};
