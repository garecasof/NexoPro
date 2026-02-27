// NexoPro — Favorites Manager (localStorage)
const STORAGE_KEY = 'nexopro_favorites';

export function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
}

export function isFavorite(professionalId) {
    return getFavorites().includes(professionalId);
}

export function toggleFavorite(professionalId) {
    const favs = getFavorites();
    const index = favs.indexOf(professionalId);
    if (index >= 0) {
        favs.splice(index, 1);
    } else {
        favs.push(professionalId);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    return index < 0; // returns true if added, false if removed
}

export function getFavoritesCount() {
    return getFavorites().length;
}
