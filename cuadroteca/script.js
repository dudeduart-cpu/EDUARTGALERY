// Referencias al DOM
const shelfContainer = document.getElementById('shelf-container');
const resetBtn = document.getElementById('reset-view-btn');
const searchInput = document.getElementById('search-input');
const libraryContainer = document.querySelector('.library-container');
const scene = document.querySelector('.scene');
const heroOverlay = document.getElementById('hero-overlay');

// Estado
let isDragging = false;
let startX, startY;
let currentX = 0;
let currentY = 0;
let activeBookOriginal = null; // Referencia al libro original oculto
let isHeroMode = false;

function init() {
    console.log("Iniciando Biblioteca 3D V9 (Hero Overlay)...");

    if (typeof artworkData === 'undefined') {
        console.error("No se han cargado los datos de las obras.");
        shelfContainer.innerHTML = "<p style='color:white; text-align:center;'>Error: No se encontraron obras.</p>";
        return;
    }

    renderLibraryByCategories(artworkData);
    setupEvents();
    setupPanNavigation();
    setupHeroOverlayParams();
}

function renderLibraryByCategories(data) {
    shelfContainer.innerHTML = '';
    const booksPerShelf = 20;

    const groupedData = {};
    data.forEach(item => {
        const cat = item.category || 'Otros';
        if (!groupedData[cat]) groupedData[cat] = [];
        groupedData[cat].push(item);
    });

    Object.keys(groupedData).forEach(category => {
        const items = groupedData[category];
        let currentShelf = createShelf();

        const label = document.createElement('div');
        label.className = 'shelf-label';
        label.innerText = category;
        currentShelf.appendChild(label);

        const spacer = document.createElement('div');
        spacer.style.width = '100px';
        currentShelf.appendChild(spacer);

        shelfContainer.appendChild(currentShelf);

        let countOnShelf = 0;

        items.forEach((artwork) => {
            if (countOnShelf >= booksPerShelf) {
                currentShelf = createShelf();
                shelfContainer.appendChild(currentShelf);
                countOnShelf = 0;

                const spacerSmall = document.createElement('div');
                spacerSmall.style.width = '40px';
                currentShelf.appendChild(spacerSmall);
            }

            const book = createBook(artwork);
            currentShelf.appendChild(book);
            countOnShelf++;
        });
    });
}

function createShelf() {
    const shelf = document.createElement('div');
    shelf.className = 'shelf';
    return shelf;
}

function createBook(artwork) {
    const wrapper = document.createElement('div');
    wrapper.className = 'book-wrapper';
    wrapper.dataset.id = artwork.id;
    wrapper.dataset.title = artwork.title.toLowerCase();

    // Guardamos datos para reconstruir en modo héroe
    wrapper.dataset.src = artwork.src;
    wrapper.dataset.price = artwork.price;
    wrapper.dataset.fullTitle = artwork.title;

    const spine = document.createElement('div');
    spine.className = 'spine';
    spine.innerText = artwork.title.substring(0, 20) + (artwork.title.length > 20 ? '...' : '');
    const hue = Math.floor(Math.random() * 40) + 10;
    spine.style.backgroundColor = `hsl(${hue}, 40%, 30%)`;

    const cover = document.createElement('div');
    cover.className = 'cover';
    const imagePath = `../${artwork.src}`;
    cover.style.backgroundImage = `url('${imagePath}')`;

    // Info oculta en el cover (se verá al abrir)
    const info = document.createElement('div');
    info.className = 'cover-info';
    info.innerHTML = `<strong>${artwork.title}</strong><br>${artwork.price} €`;

    cover.appendChild(info);
    wrapper.appendChild(spine);
    wrapper.appendChild(cover);

    wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isDragging && !isHeroMode) {
            activateHeroMode(wrapper);
        }
    });

    return wrapper;
}

// --- LÓGICA HERO OVERLAY ---

function setupHeroOverlayParams() {
    // Cerrar al hacer clic en el fondo del overlay
    heroOverlay.addEventListener('click', closeHeroMode);
}

function activateHeroMode(originalWrapper) {
    if (isHeroMode) return;
    isHeroMode = true;
    activeBookOriginal = originalWrapper;

    // 1. Obtener coordenadas iniciales (donde está el libro ahora)
    const rect = originalWrapper.getBoundingClientRect();

    // 2. Clonar el libro para el overlay
    // No usamos cloneNode directamente para evitar coger eventos o estados raros,
    // mejor reconstruimos una "versión héroe" limpia.
    const heroBook = document.createElement('div');
    heroBook.className = 'hero-book book-wrapper'; // book-wrapper para heredar estilos básicos
    // Necesitamos dimensions iguales al inicio
    heroBook.style.width = rect.width + 'px';
    heroBook.style.height = rect.height + 'px';
    heroBook.style.position = 'absolute';
    heroBook.style.left = rect.left + 'px';
    heroBook.style.top = rect.top + 'px';
    heroBook.style.margin = '0'; // Quitar margen de lista

    // Recreamos estructura interna para que se vea igual
    // Copiamos el HTML interno es más rápido
    heroBook.innerHTML = originalWrapper.innerHTML;

    // Ajustes visuales iniciales para que coincida con el libro cerrado/spine
    // Ojo: originalWrapper tiene un rotateY y translateZ por CSS.
    // Al ponerlo en overlay (flat), perderemos esa perspectiva inmediata.
    // Para que la transición sea suave, deberíamos empezar con transformaciones similares?
    // Simplificación: Empezamos "plano" en la posición de pantalla del spine.

    heroOverlay.appendChild(heroBook);

    // 3. Ocultar original (para que no se vea duplicado detrás)
    originalWrapper.classList.add('hidden');

    // 4. Activar Overlay (fondo oscuro)
    heroOverlay.classList.add('active');

    // 5. ANIMACIÓN REDIMENSIONADO REAL (Resolution Independence)
    // En lugar de scale(), cambiamos width/height reales para que el browser renderice full quality.

    // Dimensiones iniciales (coinciden con el CSS actual para suavidad)
    // Asumimos que la portada empieza siendo de 250px x 250px (aprox, cuadrado contenedor)
    // Importante: Si empezamos con 40px (spine), al poner width:100% en cover se aplastaría.
    // Hack visual: Empezamos la animación asumiendo que ya "somos" la portada.
    heroBook.style.width = '250px';
    heroBook.style.height = '250px';

    requestAnimationFrame(() => {
        // CÁLCULO DE TAMAÑO OBJETIVO (85% del alto de pantalla)
        const vh = window.innerHeight;
        const targetHeight = Math.floor(vh * 0.85);
        const targetWidth = targetHeight; // Mantenemos relación 1:1 del contenedor (la imagen se ajusta con contain)

        heroBook.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';

        // Aplicamos tamaño físico (píxeles reales)
        heroBook.style.width = targetWidth + 'px';
        heroBook.style.height = targetHeight + 'px';

        // Centramos y rotamos (SIN SCALE)
        heroBook.style.left = '50%';
        heroBook.style.top = '50%';
        heroBook.style.transform = 'translate(-50%, -50%) rotateY(0deg)';

        // Asegurar que la portada se ve con info
        const info = heroBook.querySelector('.cover-info');
        if (info) info.style.opacity = '1';
    });
}

function closeHeroMode() {
    if (!isHeroMode) return;

    const heroBook = heroOverlay.querySelector('.hero-book');
    if (!heroBook || !activeBookOriginal) {
        resetHeroState();
        return;
    }

    // 1. Calcular rect destino (el libro original original)
    // Ojo: si hemos hecho scroll mientras estaba abierto (aunque deberíamos bloquear scroll?)
    // el original puede haberse movido o estar fuera.
    // Asumimos que no se mueve el fondo.

    // Quitamos 'hidden' un momento para medirlo? No, ya tenemos su posición si no se movió el container.
    // Si permitimos pan/scroll detrás, necesitamos medir de nuevo.
    activeBookOriginal.classList.remove('hidden');
    const rect = activeBookOriginal.getBoundingClientRect();
    activeBookOriginal.classList.add('hidden'); // Ocultar de nuevo hasta que llegue

    // 2. Animar de vuelta
    // Importante: rotateY(0deg) y scale(1)
    heroBook.style.transform = 'translate(0, 0) rotateY(0deg) scale(1)';
    // Pero necesitamos mover left/top también
    heroBook.style.left = rect.left + 'px';
    heroBook.style.top = rect.top + 'px';
    heroBook.style.width = rect.width + 'px';
    heroBook.style.height = rect.height + 'px';

    // Ocultar info
    const info = heroBook.querySelector('.cover-info');
    if (info) info.style.opacity = '0';

    // 3. Al terminar transición, limpiar
    heroOverlay.classList.remove('active'); // Fondo transparente

    setTimeout(() => {
        resetHeroState();
    }, 500); // 0.5s coincide con transición de overlay opacity, libro tarda 0.8s
    // Mejor esperar los 0.8s del libro para que llegue a su sitio visualmente.
    // Pero el usuario quiere rapidez. 0.5s está bien para el fade out del fondo.
    // El libro seguirá moviéndose un poco más hasta "encajar".

    setTimeout(() => {
        if (activeBookOriginal) activeBookOriginal.classList.remove('hidden');
        if (heroBook) heroBook.remove();
        isHeroMode = false;
        activeBookOriginal = null;
    }, 800);
}

function resetHeroState() {
    heroOverlay.innerHTML = '';
    heroOverlay.classList.remove('active');
    if (activeBookOriginal) activeBookOriginal.classList.remove('hidden');
    activeBookOriginal = null;
    isHeroMode = false;
}

// --- NAVEGACIÓN (PAN) ---

function setupPanNavigation() {
    document.addEventListener('mousedown', (e) => {
        if (isHeroMode) return; // No mover si estamos viendo un libro
        if (e.target.closest('.controls') || e.target.closest('.book-wrapper')) return;

        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        document.body.style.cursor = 'grabbing';
        // EVITAR SELECCIÓN DE TEXTO / TEMBLOR
        document.body.style.userSelect = 'none';
        libraryContainer.style.transition = 'none';

        // Asegurar estilos en libraryContainer también si es necesario
        // Para que el drag sea fluido y no pille hijos
        libraryContainer.style.pointerEvents = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        if (isHeroMode) return;

        e.preventDefault(); // Crítico para evitar selección nativa del browser

        currentX = e.clientX - startX;
        currentY = e.clientY - startY;

        libraryContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.cursor = 'grab';
        document.body.style.userSelect = ''; // Restaurar
        libraryContainer.style.pointerEvents = ''; // Restaurar
    });

    document.addEventListener('wheel', (e) => {
        if (isHeroMode) return;

        const scrollSpeed = 0.8;
        currentY -= e.deltaY * scrollSpeed;

        libraryContainer.style.transition = 'transform 0.1s linear';
        libraryContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }, { passive: true });
}

function setupEvents() {
    resetBtn.addEventListener('click', () => {
        if (isHeroMode) closeHeroMode();

        currentX = 0;
        currentY = 0;
        libraryContainer.style.transition = 'transform 0.8s ease';
        libraryContainer.style.transform = `translate(0px, 0px)`;

        searchInput.value = '';
        clearHighlights();
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        clearHighlights();

        if (query.length < 2) return;

        const books = document.querySelectorAll('.book-wrapper');
        let firstMatch = null;

        books.forEach(book => {
            if (book.dataset.title.includes(query)) {
                book.querySelector('.spine').classList.add('highlight');
                if (!firstMatch) firstMatch = book;
            }
        });

        // Auto-centrar en el primero encontrado?
        if (firstMatch) {
            // centerOnElement(firstMatch); // Implementar si se desea
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.spine.highlight').forEach(el => el.classList.remove('highlight'));
}


window.onload = init;
