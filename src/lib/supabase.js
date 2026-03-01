import { createClient } from '@supabase/supabase-js';

// NexoPro — Supabase Client
const SUPABASE_URL = 'https://dsdvjpdacezgmqlozzei.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jHULIs_rMehwQA5sGQ4j4w_C-aa4pZG';

export function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

let supabase = null;
let supabaseReady = false;

export function getSupabase() {
    return supabase;
}

export function isSupabaseReady() {
    return supabaseReady;
}

export async function initSupabase() {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Test connection by fetching categories
        const { data, error } = await supabase.from('categories').select('id').limit(1);
        if (error) {
            console.warn('⚠️ Supabase conectado pero tablas no encontradas. Usando datos demo.', error.message);
            supabaseReady = false;
        } else {
            console.log('✅ Supabase conectado y tablas listas');
            supabaseReady = true;
        }
        return supabase;
    } catch (err) {
        console.warn('⚠️ No se pudo conectar a Supabase. Usando datos demo.', err);
        supabaseReady = false;
        return null;
    }
}

// ── API Functions (real Supabase or fallback to demo) ──

export async function fetchCategories() {
    if (supabaseReady && supabase) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .is('parent_id', null)
            .order('sort_order');
        if (!error && data.length > 0) return data;
    }
    return [];
}

export async function fetchAllCategories() {
    if (supabaseReady && supabase) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order');
        if (!error && data.length > 0) return data;
    }
    return [];
}

export async function fetchSubcategories(parentId) {
    if (supabaseReady && supabase) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('parent_id', parentId)
            .order('sort_order');
        if (!error && data) return data;
    }
    return [];
}

export async function hasSubcategories(categoryId) {
    if (supabaseReady && supabase) {
        const { count, error } = await supabase
            .from('categories')
            .select('id', { count: 'exact', head: true })
            .eq('parent_id', categoryId);
        if (!error) return count > 0;
    }
    return false;
}

// Categories that require a license/matrícula field
export const LICENSE_REQUIRED_GROUPS = ['salud', 'legal'];

/**
 * Incrementa los puntos de marketing de un profesional de forma segura (RPC)
 */
export async function incrementMarketingPoints(profile_id, points = 1) {
    if (supabaseReady && supabase) {
        const { error } = await supabase.rpc('increment_marketing_points', {
            profile_id: profile_id,
            points_to_add: points
        });
        if (error) console.error('Error incrementing points:', error);
        return { error };
    }
    return { error: 'Supabase not ready' };
}

export async function fetchProfessionals(filters = {}) {
    if (supabaseReady && supabase) {
        let query = supabase
            .from('profiles')
            .select(`*, categories(name, icon, parent_id)`)
            .eq('is_active', true);

        if (filters.category_id) {
            query = query.eq('category_id', filters.category_id);
        }
        if (filters.category_ids && filters.category_ids.length > 0) {
            query = query.in('category_id', filters.category_ids);
        }
        if (filters.parent_category_id) {
            // Get all subcategory IDs for this parent
            const subs = await fetchSubcategories(filters.parent_category_id);
            if (subs.length > 0) {
                const subIds = subs.map(s => s.id);
                query = query.in('category_id', subIds);
            } else {
                query = query.eq('category_id', filters.parent_category_id);
            }
        }
        if (filters.search) {
            // Paso 1: buscar categorías que coincidan con el término (ej: "técnico", "plomero")
            const { data: matchingCats } = await supabase
                .from('categories')
                .select('id')
                .ilike('name', `%${filters.search}%`);

            const catIds = matchingCats?.map(c => c.id) || [];

            // Paso 2: construir el OR combinando texto en perfil + categorías que matchearon
            let orFilter = `full_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`;
            if (catIds.length > 0) {
                orFilter += `,category_id.in.(${catIds.join(',')})`;
            }
            query = query.or(orFilter);
        }

        // --- RANKING VUELO PRO ---
        // 1. Prioridad por puntos de marketing (quienes más comparten)
        // 2. Ranking de estrellas (calidad del servicio)
        query = query
            .order('marketing_points', { ascending: false })
            .order('rating', { ascending: false });

        const { data, error } = await query;
        if (!error && data) {
            return data.map(p => ({
                ...p,
                category_name: p.categories?.name || '',
                category_icon: p.categories?.icon || '📋',
            }));
        }
    }
    return [];
}

export async function fetchVIPTalents() {
    if (supabaseReady && supabase) {
        // Obtenemos los últimos profesionales referidos que estén activos
        const { data, error } = await supabase
            .from('profiles')
            .select(`*, categories(name, icon)`)
            .not('referred_by', 'is', null)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error && data) {
            return data.map(p => ({
                ...p,
                category_name: p.categories?.name || '',
                category_icon: p.categories?.icon || '📋',
            }));
        }
    }
    return [];
}

export async function fetchProfessionalById(id) {
    if (supabaseReady && supabase) {
        const { data: profile } = await supabase
            .from('profiles')
            .select(`*, categories(name, icon)`)
            .eq('id', id)
            .single();

        if (profile) {
            const { data: services } = await supabase
                .from('services')
                .select('*')
                .eq('profile_id', id)
                .eq('is_active', true);

            const { data: reviews } = await supabase
                .from('reviews')
                .select('*')
                .eq('profile_id', id)
                .order('created_at', { ascending: false });

            return {
                ...profile,
                category_name: profile.categories?.name || '',
                services: services || [],
                reviews: reviews || [],
            };
        }
    }
    return null;
}

export async function signUp(email, password, metadata = {}) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
    });
    return { data, error };
}

export async function signIn(email, password) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

export async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
}

export async function getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function createProfile(profileData) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };
    const { data, error } = await supabase.from('profiles').insert(profileData).select().single();
    return { data, error };
}

export async function updateProfile(id, updates) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

    // No requerimos la data devuelta porque si el usuario oculta su perfil (is_active=false),
    // Supabase tirará error de lectura en el .select() ya que la política exige is_active=true
    return { error };
}

// ── Services API ──

export async function fetchMyServices(profileId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: true });
    return data || [];
}

export async function createService(serviceData) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };
    const { data, error } = await supabase.from('services').insert(serviceData).select().single();
    return { data, error };
}

export async function updateService(id, updates) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };
    const { data, error } = await supabase.from('services').update(updates).eq('id', id).select().single();
    return { data, error };
}

export async function deleteService(id) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };
    const { error } = await supabase.from('services').delete().eq('id', id);
    return { error };
}

// ── Reviews, Location & Stats API ──

export async function fetchMyReviews(profileId) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
    return data || [];
}

// ── Public Review System ──

export async function createPublicReview(reviewData) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };

    // Check if this phone already reviewed this professional
    const { data: existing } = await supabase
        .from('reviews')
        .select('id, edit_token')
        .eq('profile_id', reviewData.profile_id)
        .eq('reviewer_phone', reviewData.reviewer_phone)
        .limit(1);

    if (existing && existing.length > 0) {
        return { error: { message: 'Ya dejaste una reseña para este profesional. Usá tu código de edición para modificarla.' }, existingToken: existing[0].edit_token };
    }

    const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();
    return { data, error };
}

export async function updateReviewStatus(reviewId, status) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };
    const { data, error } = await supabase
        .from('reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reviewId)
        .select()
        .single();
    return { data, error };
}

export async function updateReviewByToken(editToken, updates) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };
    const { data, error } = await supabase
        .from('reviews')
        .update({ ...updates, status: 'pending', updated_at: new Date().toISOString() })
        .eq('edit_token', editToken)
        .select()
        .single();
    return { data, error };
}

export async function recalculateRating(profileId) {
    if (!supabase) return;
    const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('profile_id', profileId)
        .eq('status', 'approved');

    if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
        await supabase
            .from('profiles')
            .update({ rating: parseFloat(avg.toFixed(1)), review_count: reviews.length })
            .eq('id', profileId);
    }
}


export async function updateLocation(profileId, latitude, longitude, address) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };
    const { data, error } = await supabase
        .from('profiles')
        .update({ latitude, longitude, address, updated_at: new Date().toISOString() })
        .eq('id', profileId)
        .select()
        .single();
    return { data, error };
}

export async function uploadProfilePhoto(profileId, file) {
    if (!supabase) return { error: { message: 'Supabase no conectado' } };

    const fileExt = file.name.split('.').pop();
    const fileName = `${profileId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        return { error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Update profile with new photo URL
    const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', profileId)
        .select()
        .single();

    if (updateError) {
        return { error: updateError };
    }

    return { data };
}

export async function fetchMyStats(profileId) {
    // TODO: Implementar tracking real de visitas y clics
    return {
        profile_views: 0,
        whatsapp_clicks: 0,
        search_appearances: 0,
        views_trend: 'Sin datos aún',
        clicks_trend: 'Sin datos aún'
    };
}


// — Grupos temáticos para la UI (producción) —
export const CATEGORY_GROUPS = [
    { id: 'salud', name: '🏥 Salud' },
    { id: 'legal', name: '⚖️ Legal y Finanzas' },
    { id: 'hogar', name: '🏠 Hogar y Mantenimiento' },
    { id: 'construccion', name: '🏗️ Construcción' },
    { id: 'automotor', name: '🚗 Automotor' },
    { id: 'servicios', name: '📦 Servicios Generales' },
    { id: 'inmuebles', name: '🏨 Inmuebles y Hotelería' },
    { id: 'bienestar', name: '💇 Bienestar y Estética' },
    { id: 'comunicacion', name: '📣 Comunicación y Marketing' },
];
