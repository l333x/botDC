/**
 * juegos.js — Comando /juegos
 * 4 minijuegos con subcomandos: piedra-papel-tijeras, ruleta-rusa, bola8, dados.
 *
 * Uso: /juegos piedra-papel-tijeras eleccion:piedra
 *      /juegos ruleta-rusa
 *      /juegos bola8 pregunta:"¿Voy a pasar el semestre?"
 *      /juegos dados
 */

const { SlashCommandBuilder } = require('discord.js');
const { generarTextoLibre } = require('../services/gemini');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('juegos')
        .setDescription('Minijuegos para cuando estés aburrido.')
        // ─── Piedra, Papel o Tijeras ────────────────────
        .addSubcommand(sub =>
            sub
                .setName('piedra-papel-tijeras')
                .setDescription('Juega contra el bot. Spoiler: va a hacer trampa.')
                .addStringOption(opt =>
                    opt
                        .setName('eleccion')
                        .setDescription('¿Piedra, papel o tijeras?')
                        .setRequired(true)
                        .addChoices(
                            { name: '🪨 Piedra', value: 'piedra' },
                            { name: '📄 Papel', value: 'papel' },
                            { name: '✂️ Tijeras', value: 'tijeras' },
                        ),
                ),
        )
        // ─── Ruleta Rusa ────────────────────────────────
        .addSubcommand(sub =>
            sub
                .setName('ruleta-rusa')
                .setDescription('1/6 de probabilidad de "morir". ¿Te atreves?'),
        )
        // ─── Bola 8 Mágica ─────────────────────────────
        .addSubcommand(sub =>
            sub
                .setName('bola8')
                .setDescription('Hazle una pregunta al destino (o a Gemini, que es casi lo mismo).')
                .addStringOption(opt =>
                    opt
                        .setName('pregunta')
                        .setDescription('¿Qué le quieres preguntar al universo?')
                        .setRequired(true),
                ),
        )
        // ─── Dados ──────────────────────────────────────
        .addSubcommand(sub =>
            sub
                .setName('dados')
                .setDescription('Tira un dado del 1 al 100. Si sacas menos de 10... F.'),
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // ═══════════════════════════════════════════════
        // PIEDRA, PAPEL O TIJERAS
        // ═══════════════════════════════════════════════
        if (sub === 'piedra-papel-tijeras') {
            const eleccionUsuario = interaction.options.getString('eleccion');
            const opciones = ['piedra', 'papel', 'tijeras'];
            const emojis = { piedra: '🪨', papel: '📄', tijeras: '✂️' };
            const eleccionBot = opciones[Math.floor(Math.random() * 3)];

            let resultado;
            if (eleccionUsuario === eleccionBot) {
                resultado = '🤝 **Empate.** Qué aburrido, bro.';
            } else if (
                (eleccionUsuario === 'piedra' && eleccionBot === 'tijeras') ||
                (eleccionUsuario === 'papel' && eleccionBot === 'piedra') ||
                (eleccionUsuario === 'tijeras' && eleccionBot === 'papel')
            ) {
                resultado = '🏆 **Ganaste.** Disfruta tu momento de gloria, no dura mucho.';
            } else {
                resultado = '💀 **Perdiste.** Skill issue, como siempre.';
            }

            await interaction.reply(
                `Tú: ${emojis[eleccionUsuario]} vs Bot: ${emojis[eleccionBot]}\n\n${resultado}`,
            );
            return;
        }

        // ═══════════════════════════════════════════════
        // RULETA RUSA
        // ═══════════════════════════════════════════════
        if (sub === 'ruleta-rusa') {
            await interaction.deferReply();

            const murio = Math.random() < 1 / 6; // 1 en 6

            if (murio) {
                const mensajesMuerte = [
                    '💀 **BANG.** Caíste. F en el chat, gente.',
                    '💀 **BOOM.** Se acabó tu turno en la vida. GG.',
                    '💀 **PUM.** Ni la plot armor te salvó esta vez.',
                    '💀 **CLICK... BANG.** Fuiste el elegido... para morir.',
                    '💀 **💥** Le tocó bala. Que alguien le ponga velitas.',
                ];
                const msg = mensajesMuerte[Math.floor(Math.random() * mensajesMuerte.length)];
                await interaction.editReply(
                    `🔫 *${interaction.user.displayName} giró el tambor...*\n\n${msg}\n\n_Timeout simbólico: estás muerto por los próximos 30 segundos en nuestros corazones._`,
                );
            } else {
                const mensajesVida = [
                    '😮‍💨 **Click.** Vacía. Sobreviviste... esta vez.',
                    '😎 **Click.** Nada. Parece que el destino aún te necesita (o nadie más quiere el puesto).',
                    '🍀 **Click.** Te salvaste, suertudo. Ahora ve a comprar lotería.',
                    '😏 **Click.** Ni la muerte te quiere, bro.',
                ];
                const msg = mensajesVida[Math.floor(Math.random() * mensajesVida.length)];
                await interaction.editReply(
                    `🔫 *${interaction.user.displayName} giró el tambor...*\n\n${msg}`,
                );
            }
            return;
        }

        // ═══════════════════════════════════════════════
        // BOLA 8 MÁGICA
        // ═══════════════════════════════════════════════
        if (sub === 'bola8') {
            await interaction.deferReply();

            const pregunta = interaction.options.getString('pregunta');

            try {
                const prompt = [
                    `Eres una Bola 8 Mágica pero versión latina, tóxica y sarcástica.`,
                    `Te hicieron esta pregunta: "${pregunta}"`,
                    `Responde en UNA sola frase corta, tipo oráculo callejero.`,
                    `Puedes ser ambiguo, gracioso, o brutalmente honesto.`,
                    `PROHIBIDO ser genérico. Sé creativo.`,
                    `Responde SOLO con la predicción, nada más.`,
                ].join('\n');

                const respuesta = await generarTextoLibre(prompt);
                await interaction.editReply(`🎱 **Pregunta:** _${pregunta}_\n\n🔮 ${respuesta}`);
            } catch (error) {
                console.error('❌ Error en /juegos bola8:', error);
                await interaction.editReply('🎱 La bola 8 se rompió. Mala señal.');
            }
            return;
        }

        // ═══════════════════════════════════════════════
        // DADOS
        // ═══════════════════════════════════════════════
        if (sub === 'dados') {
            const resultado = Math.floor(Math.random() * 100) + 1;

            let comentario;
            if (resultado === 100) {
                comentario = '👑 **¡100!** Imposible. Esto tiene que ser hack. Eres un dios.';
            } else if (resultado >= 90) {
                comentario = '🔥 **Tremendo.** La suerte te ama (por ahora).';
            } else if (resultado >= 50) {
                comentario = '😐 Meh. Ni bueno ni malo. Como tu personalidad.';
            } else if (resultado >= 10) {
                comentario = '😬 Yikes. Eso estuvo cerca de ser vergonzoso.';
            } else {
                comentario = '💀 **JAJAJA.** Menos de 10. La vida te odia oficialmente.';
            }

            await interaction.reply(`🎲 **${interaction.user.displayName}** tiró los dados...\n\n🎯 Resultado: **${resultado}/100**\n\n${comentario}`);
            return;
        }
    },
};
