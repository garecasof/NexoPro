# Plan de Implementación - NexoPro (MVP)

Este plan detalla los pasos para construir la primera versión funcional de NexoPro, el hub de servicios profesionales.

## Objetivos del MVP
- Permitir que los profesionales se registren con sus datos básicos.
- Permitir que los clientes busquen profesionales por categoría y ubicación.
- Facilitar el contacto directo vía WhatsApp.

## Cambios Propuestos

### Módulos del Sistema

#### [NEW] Backend (Supabase)
- **Base de Datos:** PostgreSQL administrado por Supabase.
- **Autenticación:** Supabase Auth (Email/Password, Google).
- **Almacenamiento:** Supabase Storage para fotos de perfiles y servicios.
- **Modelos de datos:**
  - `profiles`: Datos de profesionales (nombre, rubro, WhatsApp, ubicación).
  - `services`: Fichas de servicios ofrecidos.
  - `categories`: Clasificación (Salud, Técnica, etc.).
  - `reviews`: Reseñas de clientes.

#### [NEW] Frontend (Mobile App - React Native / Flutter)
- **Pantalla de Inicio:** Buscador principal y categorías destacadas.
- **Pantalla de Resultados:** Listado de profesionales con filtros.
- **Pantalla de Perfil:** Información detallada, botón de WhatsApp y Mapa.
- **Pantalla de Registro:** Formulario amigable para profesionales.

## Plan de Verificación

### Pruebas Automatizadas
- **API Tests:** Ejecutar `npm test` (o similar) para validar los endpoints de registro y búsqueda.
- **UI Tests:** Validar que los botones de navegación y el botón de WhatsApp funcionen correctamente.

### Verificación Manual
1. **Flujo del Profesional:** Registrar un usuario nuevo con el nombre "Test Pro", verificar que aparezca en la búsqueda.
2. **Flujo del Cliente:** Abrir el perfil del "Test Pro" y hacer clic en el botón de WhatsApp para verificar la redirección.
3. **Filtros:** Buscar por "Médico" y verificar que solo aparezcan resultados de esa categoría.
