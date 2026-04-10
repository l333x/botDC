/**
 * gemini.js — Servicio aislado para interactuar con la API de Google Gemini.
 * Usa exclusivamente el modelo gemini-2.5-flash como debe ser.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../config');

// Inicializar cliente de Gemini
const genAI = new GoogleGenerativeAI(geminiApiKey);

// El modelo base (sin personalidad) para funciones genéricas
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Genera un mensaje creativo basado en una "vibra" y un nombre de usuario.
 * @param {string} vibra   — El tipo de mensaje (ej: "Insulto amigable").
 * @param {string} nombre  — Nombre/display name del usuario objetivo.
 * @returns {Promise<string>} — El texto generado por Gemini.
 */
async function generarMensaje(vibra, nombre) {
    const arquetipos = [
        "un gamer tryhard y tóxico que humilla por la falta de habilidad",
        "un hater creativo que usa comparaciones extremadamente absurdas, humillantes y surrealistas",
        "un ñengoso o callejero latino que te 'rostiza' sin piedad y con mucha jerga local",
        "un filósofo amargado que te insulta usando un vocabulario intelectual pero hiriente",
        "un pana falso que parece que te está halagando pero en realidad te está destruyendo la autoestima"
    ];
    const arquetipoRandom = arquetipos[Math.floor(Math.random() * arquetipos.length)];

    // 🧠 CIRUGÍA APLICADA: Creamos un cerebro específico usando systemInstruction igual que en /chat
    const modeloInsulto = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: {
            parts: [{ text: `Eres EX, el bot más sarcástico y tóxico. Actúa estrictamente como ${arquetipoRandom}. REGLAS: 1. CERO CLICHÉS (varía tu vocabulario, no repitas siempre las mismas palabras de internet). 2. SÉ CREATIVO Y CRUEL (usa metáforas raras). 3. CERO IA (no saludes, no expliques, no digas 'aquí tienes'). 4. CONTEXTO LATINO. 5. MÁXIMO 2 LÍNEAS.` }]
        }
    });

    // La orden ahora es súper limpia
    const ordenUsuario = `Escribe un mensaje dirigido específicamente a "${nombre}". La vibra o intención es: "${vibra}".`;

    try {
        const resultado = await modeloInsulto.generateContent(ordenUsuario);
        const respuesta = resultado.response.text().trim();
        return respuesta || '⚠️ Gemini se quedó mudo del coraje.';
    } catch (error) {
        console.error('❌ Error al llamar a Gemini en generarMensaje:', error.message);
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
            systemInstruction: {
                parts: [{ text: "Eres EX, el bot más sarcástico, tóxico y basado de un servidor de Discord latino. Recuerdas las conversaciones pasadas de los usuarios. Responde de forma natural, como un amigo pesado. Varía tu vocabulario, no uses siempre las mismas palabras de internet. Prohibido sonar como IA corporativa (nada de 'Hola, ¿en qué te ayudo?'). Máximo 3 líneas por respuesta." }]
            }
        });

        const resultado = await chat.sendMessage(mensajeNuevo);
        const respuesta = resultado.response.text().trim();
        return respuesta || '⚠️ Gemini se trabó. Skill issue de la IA.';
    } catch (error) {
        console.error('❌ Error en chat con historial:', error.message);
        return '⚠️ Gemini está descansando. Intenta de nuevo.';
    }
}

/**
 * Genera texto libre a partir de un prompt personalizado (para /explicar, /resumen).
 * @param {string} prompt — El prompt completo.
 * @returns {Promise<string>} — Texto generado.
 */
async function generarTextoLibre(prompt) {
    try {
        // Para resúmenes y explicaciones, le metemos una instrucción base para que no suene a Wikipedia
        const modeloLibre = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: {
                parts: [{ text: "Eres EX, un bot sarcástico. Responde a lo que se te pide de forma directa, con un tono ligeramente burlón y sin introducciones robóticas." }]
            }
        });

        const resultado = await modeloLibre.generateContent(prompt);
        const respuesta = resultado.response.text().trim();
        return respuesta || '⚠️ Gemini devolvió vacío. Eso nunca es buena señal.';
    } catch (error) {
        console.error('❌ Error en generarTextoLibre:', error.message);
        return '⚠️ Gemini está descansando. Intenta en un momento.';
    }
}

module.exports = { generarMensaje, generarConHistorial, generarTextoLibre };