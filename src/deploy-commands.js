/**
 * deploy-commands.js — Registra los slash commands en Discord.
 * Ejecutar con: npm run deploy-commands
 *
 * Esto solo necesita correrse una vez, o cada vez que agregues/modifiques comandos.
 */

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const { discordToken, clientId, guildId } = require('./config');

// ─── Recopilar todos los comandos ────────────────────────────────────
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if ('data' in command) {
        commands.push(command.data.toJSON());
        console.log(`📦 Preparado: /${command.data.name}`);
    } else {
        console.warn(`⚠️ El archivo ${file} no exporta "data". Se ignoró.`);
    }
}

// ─── Registrar en Discord ────────────────────────────────────────────
const rest = new REST({ version: '10' }).setToken(discordToken);

(async () => {
    try {
        console.log(`\n🚀 Registrando ${commands.length} comando(s) en el servidor...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`✅ ¡Listo! ${data.length} comando(s) registrados exitosamente.`);
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
})();
