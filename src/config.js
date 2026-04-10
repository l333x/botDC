/**
 * config.js — Configuración centralizada del bot.
 * Carga las variables de entorno desde .env y las valida.
 */

const dotenv = require('dotenv');
const path = require('path');

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Variables requeridas
const REQUIRED_VARS = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];

// Validar que todas las variables estén presentes
for (const varName of REQUIRED_VARS) {
  if (!process.env[varName]) {
    console.error(`❌ Error: La variable de entorno "${varName}" no está definida.`);
    console.error('   Crea un archivo .env basado en .env.example y rellena todos los valores.');
    process.exit(1);
  }
}

module.exports = {
  discordToken: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  geminiApiKey: process.env.GEMINI_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
};
