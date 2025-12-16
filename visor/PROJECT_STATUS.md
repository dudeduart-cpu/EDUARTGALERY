# Photo Catalog Portable - Estado del Proyecto

**Última actualización**: 12 de Diciembre, 2025
**Estado**: ✅ Completado (Web Completa v2.0)

Este archivo sirve para mantener el contexto del proyecto entre diferentes sesiones de IA o desarrolladores.

## 📌 Resumen
Aplicación web estática ("Portable") para mostrar un catálogo de marcos de fotos. Diseñada para ser "Drag & Drop", sin instalación, y altamente visual. Permite subir fotos, probar marcos y personalizar la marca.

## 🛠 Estado Actual
La aplicación es funcional y reside en la carpeta actual.

### Características Completadas
1.  **Galería Dinámica**: Carga imágenes locales o de muestra.
2.  **Selector de Marcos**: 8 Estilos (Clásico, Moderno, Vintage, etc.).
3.  **Persistencia**: Las preferencias (Logo, Títulos, Grosor) se guardan en `localStorage`.
4.  **Marca Personalizable**:
    *   Subida de Logo propio.
    *   Edición de Título y Subtítulo.
    *   *Nota*: Panel de administración oculto (Click en "Drag & Drop habilitado" en el footer). **Requiere contraseña** ("admin").
6.  **Fondo Personalizado**:
    *   Subida de imagen de fondo propia.
    *   **Control de Zoom**: Slider para ajustar el tamaño del fondo (10% - 250%).
    *   Estilo Glassmorphism (transparencia) en paneles.
    *   Persistencia en navegador.
7.  **Experiencia de Usuario**:
    *   **Landing Page**: Pantalla de bienvenida con introducción visual.
    *   **Landing Page**: Pantalla de bienvenida con introducción visual.
    *   **Selector de Formato**: Visualización e interacción S/M/L en el visor.
8.  **Mejoras Visuales**:
    *   Marcos con texturas 3D realistas (sombras, biseles, gradientes).
    *   Efectos de material (Madera, Oro, Acero).

### Estructura de Archivos
*   `index.html`: Estructura principal.
*   `style.css`: Estilos, variables CSS para personalización rápida.
*   `app.js`: Lógica de carga, modal, persistencia y renderizado.
*   `assets/`: Imágenes de ejemplo.

*   [ ] **Exportación**: Botón para descargar una "vista previa" de la foto con el marco.
*   [ ] **Más Estilos**: Añadir más clases CSS para nuevos tipos de marcos.

### Cambios Recientes (v2.1 - Dic 2025)
*   **Rediseño de Colecciones**: Grid más limpio con "portadillas" neutras por categoría.
*   **Navegación Mejorada**: Botones de "Atrás" explícitos en Visor y Galería. Filtro por categorías en URL.
*   **Marcos Personalizados**: Implementación de marco "Gris Antiguo" con CSS puro (Ridge Border) para máxima nitidez.
*   **Correcciones**: Cache-busting automático para imágenes (`?v=2`), visibilidad de tarjetas en galería.

## 🤖 Para la IA (Contexto Técnico)
Si retomas este proyecto:
1.  Lee `app.js` para entender la lógica de estado (`state` object).
2.  Revisa `style.css` para las variables de colores (`--primary-color`, etc.).
3.  El "Modo Admin" se activa vía JS en el elemento `#adminToggle`.
