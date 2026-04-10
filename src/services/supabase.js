/**
 * supabase.js — Servicio para la base de datos Supabase.
 * Maneja la memoria/historial de conversación de cada usuario.
 *
 * Tabla requerida en Supabase:
 *   CREATE TABLE memoria_usuarios (
 *     discord_id TEXT PRIMARY KEY,
 *     historial JSONB DEFAULT '[]'::jsonb,
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 */

const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseKey } = require('../config');

// Inicializar cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

const TABLA = 'memoria_usuarios';
const MAX_HISTORIAL = 40; // Máximo de mensajes a guardar por usuario (20 turnos)

/**
 * Obtiene el historial de conversación de un usuario.
 * @param {string} discordId — ID de Discord del usuario.
 * @returns {Promise<Array>} — Array de mensajes [{role, parts}].
 */
async function obtenerHistorial(discordId) {
    try {
        const { data, error } = await supabase
            .from(TABLA)
            .select('historial')
            .eq('discord_id', discordId)
            .single();

        if (error && error.code === 'PGRST116') {
            // No existe el registro — usuario nuevo
            return [];
        }
        if (error) throw error;

        return data?.historial || [];
    } catch (err) {
        console.error('❌ Error al leer historial de Supabase:', err.message);
        return [];
    }
}

/**
 * Guarda el historial de conversación de un usuario (upsert).
 * @param {string} discordId — ID de Discord del usuario.
 * @param {Array} historial — Array de mensajes [{role, parts}].
 */
async function guardarHistorial(discordId, historial) {
    try {
        // Recortar el historial si excede el máximo
        const recortado = historial.slice(-MAX_HISTORIAL);

        const { error } = await supabase
            .from(TABLA)
            .upsert(
                {
                    discord_id: discordId,
                    historial: recortado,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'discord_id' },
            );

        if (error) throw error;
    } catch (err) {
        console.error('❌ Error al guardar historial en Supabase:', err.message);
    }
}

module.exports = { obtenerHistorial, guardarHistorial };
