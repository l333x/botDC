/**
 * ready.js — Evento que se dispara cuando el bot está listo.
 */

const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true, // Solo se ejecuta una vez
    execute(client) {
        console.log(`✅ Bot listo! Conectado como: ${client.user.tag}`);
        console.log(`📡 Sirviendo en ${client.guilds.cache.size} servidor(es).`);
    },
};
