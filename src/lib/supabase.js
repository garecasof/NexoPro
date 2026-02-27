import { createClient } from '@supabase/supabase-js';

// NexoPro — Supabase Client
const SUPABASE_URL = 'https://dsdvjpdacezgmqlozzei.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jHULIs_rMehwQA5sGQ4j4w_C-aa4pZG';

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
    return DEMO_CATEGORIES.filter(c => !c.parent_id);
}

export async function fetchAllCategories() {
    if (supabaseReady && supabase) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order');
        if (!error && data.length > 0) return data;
    }
    return DEMO_CATEGORIES;
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
        query = query.order('rating', { ascending: false });

        const { data, error } = await query;
        if (!error && data) {
            return data.map(p => ({
                ...p,
                category_name: p.categories?.name || '',
                category_icon: p.categories?.icon || '📋',
            }));
        }
    }
    // Fallback to demo data
    let results = [...DEMO_PROFESSIONALS];
    if (filters.category_id) {
        results = results.filter(p => p.category_id === filters.category_id);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(p =>
            (p.full_name || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q) ||
            (p.category_name || '').toLowerCase().includes(q) ||
            (p.address || '').toLowerCase().includes(q)
        );
    }
    return results;
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
    return DEMO_PROFESSIONALS.find(p => p.id === id) || null;
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

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data, error };
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

// ============================================================
// DATOS DE DEMOSTRACIÓN (se usan mientras no haya Supabase)
// ============================================================

// — Grupos temáticos para organizar la vista —
export const CATEGORY_GROUPS = [
    { id: 'salud', name: '🏥 Salud' },
    { id: 'legal', name: '⚖️ Legal y Finanzas' },
    { id: 'hogar', name: '🏠 Hogar y Mantenimiento' },
    { id: 'construccion', name: '🏗️ Construcción' },
    { id: 'automotor', name: '🚗 Automotor' },
    { id: 'servicios', name: '📦 Servicios Generales' },
    { id: 'inmuebles', name: '🏨 Inmuebles y Hotelería' },
    { id: 'bienestar', name: '💇 Bienestar y Estética' },
];

export const DEMO_CATEGORIES = [
    // ── 🏥 Salud ──
    { id: '1', name: 'Médicos', icon: '🩺', group: 'salud' },
    { id: '3', name: 'Veterinarios', icon: '🐾', group: 'salud' },
    { id: '12', name: 'Farmacias Turno', icon: '💊', group: 'salud' },
    { id: '13', name: 'Laboratorios', icon: '🔬', group: 'salud' },
    { id: '27', name: 'Psicólogos', icon: '🧠', group: 'salud' },
    { id: '28', name: 'Kinesiólogos', icon: '🦴', group: 'salud' },

    // ── ⚖️ Legal y Finanzas ──
    { id: '2', name: 'Abogados', icon: '⚖️', group: 'legal' },
    { id: '6', name: 'Escribanos', icon: '📝', group: 'legal' },
    { id: '4', name: 'Contadores', icon: '📊', group: 'legal' },
    { id: '29', name: 'Seguros', icon: '🛡️', group: 'legal' },

    // ── 🏠 Hogar y Mantenimiento ──
    { id: '7', name: 'Electricistas', icon: '⚡', group: 'hogar' },
    { id: '8', name: 'Plomeros', icon: '🚿', group: 'hogar' },
    { id: '5', name: 'Técnicos', icon: '🔧', group: 'hogar' },
    { id: '18', name: 'Gasistas', icon: '🔥', group: 'hogar' },
    { id: '20', name: 'Cerrajeros', icon: '🔑', group: 'hogar' },
    { id: '25', name: 'Fumigadores', icon: '🪲', group: 'hogar' },

    // ── 🏗️ Construcción ──
    { id: '19', name: 'Construcción', icon: '🏗️', group: 'construccion' },
    { id: '21', name: 'Carpintería', icon: '🪚', group: 'construccion' },
    { id: '22', name: 'Arquitectos', icon: '📐', group: 'construccion' },
    { id: '26', name: 'Pintores', icon: '🎨', group: 'construccion' },

    // ── 🚗 Automotor ──
    { id: '16', name: 'Mecánicos', icon: '🔩', group: 'automotor' },
    { id: '15', name: 'Gomerías', icon: '🛞', group: 'automotor' },

    // ── 📦 Servicios Generales ──
    { id: '14', name: 'Cadetería', icon: '📬', group: 'servicios' },
    { id: '17', name: 'Seguridad', icon: '🛡️', group: 'servicios' },
    { id: '23', name: 'Lunch/Catering', icon: '🍽️', group: 'servicios' },
    { id: '24', name: 'Mudanzas', icon: '🚚', group: 'servicios' },
    { id: '30', name: 'Profesores', icon: '📚', group: 'servicios' },

    // ── 🏨 Inmuebles y Hotelería ──
    { id: '9', name: 'Alquileres', icon: '🏠', group: 'inmuebles' },
    { id: '10', name: 'Hotelería', icon: '🏨', group: 'inmuebles' },

    // ── 💇 Bienestar y Estética ──
    { id: '11', name: 'Peluquería', icon: '💇', group: 'bienestar' },
];

export const DEMO_PROFESSIONALS = [
    {
        id: '1',
        full_name: 'Dra. María García',
        category_id: '1',
        category_name: 'Médicos',
        description: 'Especialista en medicina general. Más de 15 años de experiencia atendiendo pacientes de todas las edades.',
        phone: '+5491112345678',
        whatsapp: '5491112345678',
        address: 'Av. Corrientes 1234, CABA',
        latitude: -34.6037,
        longitude: -58.3816,
        photo_url: '',
        license_number: 'MP 12345',
        is_verified: true,
        rating: 4.8,
        review_count: 47,
        services: [
            { title: 'Consulta general', price_range: '$5.000 - $8.000' },
            { title: 'Chequeo completo', price_range: '$12.000 - $18.000' },
        ],
        reviews: [
            { reviewer_name: 'Carlos M.', rating: 5, comment: 'Excelente profesional, muy atenta y dedicada.', created_at: '2026-02-10' },
            { reviewer_name: 'Laura P.', rating: 5, comment: 'Me atendió con mucha paciencia. La recomiendo 100%.', created_at: '2026-01-28' },
            { reviewer_name: 'Juan R.', rating: 4, comment: 'Muy buena doctora, un poco de espera pero vale la pena.', created_at: '2026-01-15' },
        ]
    },
    {
        id: '2',
        full_name: 'Dr. Roberto Fernández',
        category_id: '2',
        category_name: 'Abogados',
        description: 'Abogado especializado en derecho civil y comercial. Consultas presenciales y virtuales.',
        phone: '+5491198765432',
        whatsapp: '5491198765432',
        address: 'Av. Santa Fe 567, CABA',
        latitude: -34.5950,
        longitude: -58.3960,
        photo_url: '',
        license_number: 'T° 45 F° 123',
        is_verified: true,
        rating: 4.6,
        review_count: 31,
        services: [
            { title: 'Consulta legal', price_range: '$8.000 - $12.000' },
            { title: 'Contratos', price_range: '$15.000 - $25.000' },
        ],
        reviews: [
            { reviewer_name: 'Ana S.', rating: 5, comment: 'Resolvió mi caso rápidamente. Muy profesional.', created_at: '2026-02-05' },
            { reviewer_name: 'Pedro L.', rating: 4, comment: 'Buen abogado, explica todo con claridad.', created_at: '2026-01-20' },
        ]
    },
    {
        id: '3',
        full_name: 'Vet. Luciana Martínez',
        category_id: '3',
        category_name: 'Veterinarios',
        description: 'Veterinaria con especialización en animales domésticos. Atención a domicilio disponible.',
        phone: '+5491155578888',
        whatsapp: '5491155578888',
        address: 'Calle Belgrano 890, Palermo',
        latitude: -34.5880,
        longitude: -58.4100,
        photo_url: '',
        license_number: 'MV 6789',
        is_verified: true,
        rating: 4.9,
        review_count: 62,
        services: [
            { title: 'Consulta veterinaria', price_range: '$4.000 - $6.000' },
            { title: 'Vacunación', price_range: '$3.000 - $5.000' },
            { title: 'Atención a domicilio', price_range: '$8.000 - $12.000' },
        ],
        reviews: [
            { reviewer_name: 'Sofía T.', rating: 5, comment: 'Ama a los animales, se nota. Mi perro la adora.', created_at: '2026-02-12' },
            { reviewer_name: 'Martín G.', rating: 5, comment: 'Excelente atención a domicilio para mi gato.', created_at: '2026-02-01' },
        ]
    },
    {
        id: '4',
        full_name: 'Cont. Diego Álvarez',
        category_id: '4',
        category_name: 'Contadores',
        description: 'Contador público matriculado. Liquidación de sueldos, impuestos y asesoría fiscal.',
        phone: '+5491144445555',
        whatsapp: '5491144445555',
        address: 'Av. Rivadavia 2345, CABA',
        latitude: -34.6090,
        longitude: -58.4000,
        photo_url: '',
        license_number: 'CPCE T°312 F°89',
        is_verified: true,
        rating: 4.5,
        review_count: 24,
        services: [
            { title: 'Asesoría fiscal', price_range: '$6.000 - $10.000' },
            { title: 'Liquidación sueldos', price_range: '$4.000 - $7.000' },
        ],
        reviews: [
            { reviewer_name: 'Ricardo F.', rating: 5, comment: 'Muy responsable y siempre disponible.', created_at: '2026-01-30' },
        ]
    },
    {
        id: '5',
        full_name: 'Téc. Javier López',
        category_id: '5',
        category_name: 'Técnicos',
        description: 'Técnico en reparación de PC, notebooks y redes. Servicio a domicilio rápido.',
        phone: '+5491166667777',
        whatsapp: '5491166667777',
        address: 'Calle Florida 456, Microcentro',
        latitude: -34.6010,
        longitude: -58.3750,
        photo_url: '',
        license_number: '',
        is_verified: false,
        rating: 4.7,
        review_count: 38,
        services: [
            { title: 'Reparación PC/Notebook', price_range: '$5.000 - $15.000' },
            { title: 'Instalación de redes', price_range: '$10.000 - $20.000' },
        ],
        reviews: [
            { reviewer_name: 'Miguel A.', rating: 5, comment: 'Me salvo la vida con la notebook. Rápido y honesto.', created_at: '2026-02-08' },
        ]
    },
    {
        id: '6',
        full_name: 'Esc. Patricia Nuñez',
        category_id: '6',
        category_name: 'Escribanos',
        description: 'Escribana pública. Escrituras, poderes, certificaciones y trámites notariales.',
        phone: '+5491133334444',
        whatsapp: '5491133334444',
        address: 'Calle San Martín 789, CABA',
        latitude: -34.6060,
        longitude: -58.3780,
        photo_url: '',
        license_number: 'Reg. 456',
        is_verified: true,
        rating: 4.4,
        review_count: 19,
        services: [
            { title: 'Escrituras', price_range: 'Consultar' },
            { title: 'Certificaciones', price_range: '$3.000 - $5.000' },
        ],
        reviews: [
            { reviewer_name: 'Elena V.', rating: 4, comment: 'Muy profesional, todo en regla y rápido.', created_at: '2026-01-25' },
        ]
    },
    {
        id: '7',
        full_name: 'Farm. Carolina Ramos',
        category_id: '12',
        category_name: 'Farmacias Turno',
        description: 'Farmacia de turno 24hs. Medicamentos, perfumería y envío a domicilio.',
        phone: '+5491177778888',
        whatsapp: '5491177778888',
        address: 'Av. Rivadavia 3456, Caballito',
        latitude: -34.6180, longitude: -58.4380,
        photo_url: '', license_number: 'MN 4567',
        is_verified: true, rating: 4.6, review_count: 52,
        services: [
            { title: 'Venta de medicamentos', price_range: 'Según producto' },
            { title: 'Envío a domicilio', price_range: '$1.500' },
        ],
        reviews: [
            { reviewer_name: 'Marta B.', rating: 5, comment: 'Siempre abierta cuando la necesité. Excelente servicio.', created_at: '2026-02-14' },
        ]
    },
    {
        id: '8',
        full_name: 'Mec. Raúl Benítez',
        category_id: '16',
        category_name: 'Mecánicos',
        description: 'Mecánico automotor con 20 años de experiencia. Diagnóstico computarizado y reparaciones generales.',
        phone: '+5491188889999',
        whatsapp: '5491188889999',
        address: 'Calle Avellaneda 1122, Flores',
        latitude: -34.6290, longitude: -58.4600,
        photo_url: '', license_number: '',
        is_verified: true, rating: 4.7, review_count: 43,
        services: [
            { title: 'Service completo', price_range: '$25.000 - $40.000' },
            { title: 'Diagnóstico computarizado', price_range: '$8.000' },
        ],
        reviews: [
            { reviewer_name: 'Gustavo H.', rating: 5, comment: 'Honesto y rápido. Mi mecánico de confianza.', created_at: '2026-02-11' },
        ]
    },
    {
        id: '9',
        full_name: 'Gom. Neumáticos Express',
        category_id: '15',
        category_name: 'Gomerías',
        description: 'Gomería móvil 24hs. Auxilio mecánico, cambio de cubiertas y balanceo.',
        phone: '+5491199990000',
        whatsapp: '5491199990000',
        address: 'Av. Juan B. Justo 4500, Villa Crespo',
        latitude: -34.5990, longitude: -58.4350,
        photo_url: '', license_number: '',
        is_verified: false, rating: 4.5, review_count: 27,
        services: [
            { title: 'Cambio de cubierta', price_range: '$5.000 - $8.000' },
            { title: 'Auxilio en ruta', price_range: '$10.000 - $15.000' },
        ],
        reviews: [
            { reviewer_name: 'Diego P.', rating: 5, comment: 'Me salvaron a las 3am en la ruta. Impecables.', created_at: '2026-01-18' },
        ]
    },
    {
        id: '10',
        full_name: 'Const. Edifica S.R.L.',
        category_id: '19',
        category_name: 'Construcción',
        description: 'Empresa constructora. Obras civiles, remodelaciones, ampliaciones y proyectos llave en mano.',
        phone: '+5491100001111',
        whatsapp: '5491100001111',
        address: 'Calle Defensa 890, San Telmo',
        latitude: -34.6200, longitude: -58.3730,
        photo_url: '', license_number: 'Hab. GCBA 12345',
        is_verified: true, rating: 4.3, review_count: 15,
        services: [
            { title: 'Presupuesto de obra', price_range: 'Sin cargo' },
            { title: 'Remodelación integral', price_range: 'A convenir' },
        ],
        reviews: [
            { reviewer_name: 'Fernando S.', rating: 4, comment: 'Cumplieron con los plazos y el presupuesto.', created_at: '2026-01-10' },
        ]
    },
    {
        id: '11',
        full_name: 'Gas. Sergio Acosta',
        category_id: '18',
        category_name: 'Gasistas',
        description: 'Gasista matriculado. Instalaciones, reparaciones y certificaciones de gas.',
        phone: '+5491122223333',
        whatsapp: '5491122223333',
        address: 'Calle Pueyrredón 234, Once',
        latitude: -34.6050, longitude: -58.4070,
        photo_url: '', license_number: 'ENARGAS 789',
        is_verified: true, rating: 4.8, review_count: 33,
        services: [
            { title: 'Instalación de gas', price_range: '$15.000 - $30.000' },
            { title: 'Certificación Metrogas', price_range: '$12.000 - $18.000' },
        ],
        reviews: [
            { reviewer_name: 'Laura M.', rating: 5, comment: 'Puntual, limpio y con matrícula. Lo recomiendo.', created_at: '2026-02-03' },
        ]
    },
    {
        id: '12',
        full_name: 'Carp. Martín Herrera',
        category_id: '21',
        category_name: 'Carpintería',
        description: 'Carpintero artesanal. Muebles a medida, restauraciones e instalación de placards.',
        phone: '+5491155556666',
        whatsapp: '5491155556666',
        address: 'Calle Thames 678, Palermo',
        latitude: -34.5860, longitude: -58.4250,
        photo_url: '', license_number: '',
        is_verified: false, rating: 4.9, review_count: 41,
        services: [
            { title: 'Mueble a medida', price_range: '$30.000 - $80.000' },
            { title: 'Instalación placard', price_range: '$20.000 - $45.000' },
        ],
        reviews: [
            { reviewer_name: 'Valeria N.', rating: 5, comment: 'Un artista con la madera. Hermoso trabajo.', created_at: '2026-02-15' },
        ]
    },
    {
        id: '13',
        full_name: 'Cad. FlashEnvíos',
        category_id: '14',
        category_name: 'Cadetería',
        description: 'Servicio de cadetería y mensajería. Entregas en el día en CABA y GBA.',
        phone: '+5491144443333',
        whatsapp: '5491144443333',
        address: 'Av. Córdoba 1500, Microcentro',
        latitude: -34.5990, longitude: -58.3870,
        photo_url: '', license_number: '',
        is_verified: true, rating: 4.4, review_count: 56,
        services: [
            { title: 'Envío CABA', price_range: '$2.000 - $3.500' },
            { title: 'Envío GBA', price_range: '$3.500 - $6.000' },
        ],
        reviews: [
            { reviewer_name: 'Pablo R.', rating: 4, comment: 'Rápidos y confiables para documentos urgentes.', created_at: '2026-02-06' },
        ]
    },
    {
        id: '14',
        full_name: 'Hotel Boutique Sol',
        category_id: '10',
        category_name: 'Hotelería',
        description: 'Hotel boutique céntrico. Habitaciones con desayuno incluido, Wi-Fi y estacionamiento.',
        phone: '+5491166665555',
        whatsapp: '5491166665555',
        address: 'Calle Lavalle 890, CABA',
        latitude: -34.6020, longitude: -58.3810,
        photo_url: '', license_number: 'Hab. Turismo 567',
        is_verified: true, rating: 4.6, review_count: 38,
        services: [
            { title: 'Habitación single', price_range: '$25.000/noche' },
            { title: 'Habitación doble', price_range: '$38.000/noche' },
        ],
        reviews: [
            { reviewer_name: 'Camila V.', rating: 5, comment: 'Hermoso hotel, muy bien ubicado y limpio.', created_at: '2026-02-09' },
        ]
    },
];
