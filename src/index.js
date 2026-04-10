/**
 * index.js — Punto de entrada principal del bot de Discord.
 * Carga dinámicamente todos los comandos y eventos.
 */

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { discordToken } = require('./config');

const keepAlive = require('./services/keep_alive.js');
keepAlive(); // Esto arranca el servidor web para engañar a Render

// ─── Crear cliente de Discord ────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// ─── Cargar comandos dinámicamente ───────────────────────────────────
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`📦 Comando cargado: /${command.data.name}`);
    } else {
        console.warn(`⚠️ El archivo ${file} no exporta "data" y "execute". Se ignoró.`);
    }
}

// ─── Cargar eventos dinámicamente ────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }

    console.log(`🔔 Evento cargado: ${event.name} (once: ${!!event.once})`);
}

// ─── Iniciar sesión con Discord ──────────────────────────────────────
client.login(discordToken);
