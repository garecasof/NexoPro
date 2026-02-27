// NexoPro — Utilidades de Teléfono y Prefijos Internacionales

/**
 * Obtiene el código de marcación internacional basado en la IP del usuario.
 * Utiliza ipapi.co de forma gratuita y cachea el resultado en localStorage.
 * @returns {Promise<string>} El prefijo telefónico (ej: '549', '52', '34')
 */
export async function getDialCode() {
    let code = localStorage.getItem('nexo_dial_code');
    if (code) return code;

    try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('IP API failed');

        const data = await res.json();
        let apiCode = (data.country_calling_code || '').replace('+', '');

        // Quirk para celulares en Argentina: WhatsApp requiere el '9' después del '54'
        if (apiCode === '54') {
            apiCode = '549';
        }

        if (apiCode) {
            localStorage.setItem('nexo_dial_code', apiCode);
        }
        return apiCode || '549';
    } catch (e) {
        console.warn('No se pudo detectar el país por IP, cayendo a default (Argentina).');
        return '549'; // Fallback a Argentina por defecto
    }
}

/**
 * Limpia y formatea un número de WhatsApp, agregando el prefijo del país
 * detectado por IP si el usuario no lo ingresó.
 * @param {string} rawNumber Número de teléfono tal cual lo ingresó el usuario
 * @returns {Promise<string>} Número limpio y con prefijo para la API de WhatsApp
 */
export async function formatWhatsAppNumber(rawNumber) {
    // 1. Limpiar todo lo que no sea número
    let cleanWa = (rawNumber || '').replace(/\D/g, '');
    if (!cleanWa) return '';

    // 2. Si el número ya parece tener un prefijo internacional (asumimos +10 dígitos 
    // y empieza con códigos comunes en LATAM/España), lo dejamos tal cual.
    const commonPrefixes = ['54', '52', '56', '57', '55', '51', '59', '34', '1'];
    const startsWithPrefix = commonPrefixes.some(prefix => cleanWa.startsWith(prefix));

    if (cleanWa.length > 10 && startsWithPrefix) {
        return cleanWa;
    }

    // 3. Obtener el código de marcación por IP
    const dialCode = await getDialCode();

    // 4. Si el usuario ingresó el código (ej: 54) no lo duplicamos, si no, se lo agregamos
    const baseDialCode = dialCode.replace('9', ''); // Para comparar '54' vs '549'

    if (!cleanWa.startsWith(baseDialCode) && !cleanWa.startsWith(dialCode)) {
        cleanWa = dialCode + cleanWa;
    } else if (cleanWa.startsWith('54') && !cleanWa.startsWith('549')) {
        // Arreglo específico si el usuario de Argentina pone 54 pero olvida el 9
        cleanWa = cleanWa.replace(/^54/, '549');
    }

    return cleanWa;
}
