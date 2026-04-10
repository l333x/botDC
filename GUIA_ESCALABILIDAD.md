# 📘 Guía de Escalabilidad — Bot de Discord con Gemini

Manual directo para agregar nuevas funciones sin romper nada.

---

## 1. Cómo Agregar un Nuevo Comando

### Paso 1 — Crear el archivo

Crea un archivo `.js` dentro de `src/commands/`. El nombre del archivo será el nombre del comando.

**Ejemplo:** Para un comando `/consejo`, crea `src/commands/consejo.js`.

### Paso 2 — Usar esta plantilla

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('consejo')         // Nombre del comando (sin espacios, minúsculas)
    .setDescription('Te da un consejo random con IA.')
    .addStringOption(option =>  // Opciones opcionales/requeridas
      option
        .setName('tema')
        .setDescription('Sobre qué tema quieres el consejo')
        .setRequired(false),
    ),

  async execute(interaction) {
    await interaction.deferReply(); // Siempre diferir si llamas a una API

    try {
      // Tu lógica aquí
      const tema = interaction.options.getString('tema') || 'la vida';

      await interaction.editReply(`Consejo sobre ${tema}: ...`);
    } catch (error) {
      console.error('Error en /consejo:', error);
      await interaction.editReply('❌ Algo salió mal.');
    }
  },
};
```

### Paso 3 — Registrar el comando

Ejecuta en la terminal:

```bash
npm run deploy-commands
```

Eso es todo. No necesitas tocar `index.js` ni ningún otro archivo.

---

## 2. ¿Por Qué Funciona Sin Tocar Otros Archivos?

El `index.js` usa **carga dinámica**: lee automáticamente todos los archivos `.js` dentro de `src/commands/` y los registra. Mientras tu archivo exporte `data` y `execute`, el bot lo reconocerá.

Lo mismo aplica para eventos en `src/events/`.

---

## 3. Cómo Agregar un Nuevo Evento

Crea un archivo en `src/events/` con esta estructura:

```js
const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,  // Nombre del evento de Discord
  once: false,                 // true = se ejecuta una sola vez
  execute(message) {
    // Tu lógica aquí
    console.log(`Mensaje recibido: ${message.content}`);
  },
};
```

> **Nota:** Si usas `Events.MessageCreate`, necesitarás agregar el intent `GatewayIntentBits.MessageContent` en `index.js`.

---

## 4. Reglas de Oro

| Regla | Detalle |
|---|---|
| **Un comando = un archivo** | Nunca pongas dos comandos en el mismo archivo |
| **Siempre exporta `data` + `execute`** | Si falta alguno, el bot lo ignora con un warning |
| **Usa `deferReply()`** | Siempre que llames a una API externa (Gemini, fetch, etc.) |
| **Try/catch en todo** | Nunca dejes que un error crashee el bot entero |
| **Corre `deploy-commands`** | Cada vez que agregues o modifiques la estructura de un comando |

---

## 5. Estructura de Referencia

```
src/
├── index.js                 ← NO TOCAR (a menos que agregues intents)
├── config.js                ← NO TOCAR
├── deploy-commands.js       ← NO TOCAR
├── commands/
│   ├── mencionar.js         ← Comando existente
│   └── [tu_nuevo_cmd].js    ← Solo agregar archivos aquí
├── events/
│   ├── ready.js
│   ├── interactionCreate.js ← NO TOCAR
│   └── [tu_nuevo_evt].js    ← Solo agregar archivos aquí
└── services/
    └── gemini.js            ← Reutilizable desde cualquier comando
```
