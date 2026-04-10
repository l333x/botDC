/**
 * gemini.js — Servicio aislado para interactuar con la API de Google Gemini.
 * Usa exclusivamente el modelo gemini-2.5-flash como debe ser.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../config');

// Inicializar cliente de Gemini
const genAI = new GoogleGenerativeAI(geminiApiKey);
// El Ferrari 2.5 listo para la acción
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Genera un mensaje creativo basado en una "vibra" y un nombre de usuario.
 * @param {string} vibra   — El tipo de mensaje (ej: "Insulto amigable").
 * @param {string} nombre  — Nombre/display name del usuario objeti/vo.
 * @returns {Promise<string>} — El texto generado por Gemini.
 */
async function generarMensaje(vibra, nombre) {
    const prompt = [
        `Actúa como un usuario de Discord muy basado, sarcástico y ligeramente tóxico de un servidor privado de amigos latinos.`,
        `Tu tarea: escribe un mensaje MUY corto (máximo 2 líneas) dirigido a "${nombre}".`,
        `La vibra o tema del mensaje es: "${vibra}".`,
        `REGLAS ESTRICTAS (Si las rompes, mueres):`,
        `- PROHIBIDO sonar como una IA. Nada de "¡Hola!", "Aquí tienes", "Claro que sí".`,
        `- PROHIBIDO dar consejos morales o advertencias. Sé crudo y directo.`,
        `- Usa jerga de internet (ej: bro, pa, basado, cringe, funado, skill issue).`,
        `- Si es un insulto, hazlo creativo y personal, no uses groserías genéricas aburridas.`,
        `- Responde ÚNICAMENTE con el mensaje que el bot va a enviar al canal. Cero texto extra.`
    ].join('\n');

    try {
        // CORREGIDO: Usamos 'model' que es la variable real
        const resultado = await model.generateContent(prompt);
        const respuesta = resultado.response.text().trim();
        return respuesta || '⚠️ Gemini se quedó sin palabras... por primera vez.';
    } catch (error) {
        console.error('❌ Error al llamar a Gemini:', error.message);
        return '⚠️ Gemini está en modo siesta por exceso de tráfico. Dale unos segundos y vuelve a intentar.';
    }
}

/**
 * Genera una respuesta con contexto de historial (para /chat con memoria).
 * @param {Array} historial — Array de mensajes previos [{role, parts}].
 * @param {string} mensajeNuevo — El nuevo mensaje del usuario.
 * @returns {Promise<string>} — Respuesta generada.
 */
async function generarConHistorial(historial, mensajeNuevo) {
    try {
        const chat = model.startChat({
            history: historial,
            systemInstruction: [
                'Eres el bot más basado de un servidor de Discord latino.',
                'Responde de forma directa, sarcástica, graciosa y con jerga de internet.',
                'PROHIBIDO sonar como una IA corporativa. Nada de "¡Hola! ¿En qué te puedo ayudar?".',
                'Máximo 3 líneas por respuesta a menos que te pidan más.',
            ].join('\n'),
        });

        const resultado = await chat.sendMessage(mensajeNuevo);
        const respuesta = resultado.response.text().trim();
        return respuesta || '⚠️ Gemini se trabó. Skill issue de la IA.';
    } catch (error) {
        console.error('❌ Error en chat con historial:', error.message);
        return '⚠️ Gemini está en modo siesta. Dale unos segundos.';
    }
}

/**
 * Genera texto libre a partir de un prompt personalizado (para /explicar, /resumen).
 * @param {string} prompt — El prompt completo.
 * @returns {Promise<string>} — Texto generado.
 */
async function generarTextoLibre(prompt) {
    try {
        const resultado = await model.generateContent(prompt);
        const respuesta = resultado.response.text().trim();
        return respuesta || '⚠️ Gemini devolvió vacío. Eso nunca es buena señal.';
    } catch (error) {
        console.error('❌ Error en generarTextoLibre:', error.message);
        return '⚠️ Gemini está descansando. Intenta en un momento.';
    }
}

module.exports = { generarMensaje, generarConHistorial, generarTextoLibre };