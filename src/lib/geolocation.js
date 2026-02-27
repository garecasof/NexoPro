// NexoPro — Geolocation Utility
// Calcula distancias y obtiene la ubicación del usuario

/**
 * Obtiene la posición actual del usuario usando la Geolocation API.
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Tu navegador no soporta geolocalización.'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => {
                if (err.code === 1) reject(new Error('Permiso de ubicación denegado.'));
                else reject(new Error('No se pudo obtener tu ubicación.'));
            },
            { timeout: 8000, maximumAge: 60000 }
        );
    });
}

/**
 * Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula Haversine.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Distancia en km
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Formatea la distancia de forma amigable.
 * @param {number} km
 * @returns {string}
 */
export function formatDistance(km) {
    if (km < 1) return `${Math.round(km * 1000)} m de vos`;
    if (km < 10) return `${km.toFixed(1)} km de vos`;
    return `${Math.round(km)} km de vos`;
}

/**
 * Filtra y ordena profesionales por distancia a una ubicación dada.
 * Los que no tienen coordenadas quedan al final.
 * @param {Array} professionals
 * @param {number} userLat
 * @param {number} userLng
 * @param {number} radiusKm - Radio máximo (0 = sin límite, solo ordena)
 * @returns {Array} Con campo `distance` agregado
 */
export function filterByProximity(professionals, userLat, userLng, radiusKm = 0) {
    const withDistance = professionals
        .map(pro => {
            if (!pro.latitude || !pro.longitude) return { ...pro, distance: null };
            const dist = haversineDistance(userLat, userLng, pro.latitude, pro.longitude);
            return { ...pro, distance: dist };
        })
        .filter(pro => {
            if (radiusKm === 0) return true;
            if (pro.distance === null) return false; // sin coords, excluir
            return pro.distance <= radiusKm;
        })
        .sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });

    return withDistance;
}

/** Radios de búsqueda disponibles (en km) */
export const RADIUS_OPTIONS = [
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 0, label: 'Sin límite' },
];

export const DEFAULT_RADIUS = 10;
