const state = {
    photos: [],
    currentGlobalFrame: 'classic',
    frameStyles: [
        { id: 'classic', name: 'Clásico' },
        { id: 'modern', name: 'Moderno' },
        { id: 'vintage', name: 'Vintage' },
        { id: 'minimalist', name: 'Minimalista' },
        { id: 'ornate', name: 'Ornado' },
        { id: 'wood', name: 'Madera' },
        { id: 'metallic', name: 'Metálico' },
        { id: 'shadow', name: 'Sombra' },
        { id: 'custom-gray', name: 'Gris Antiguo' }
    ]
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen Logic (Ensure it runs first)
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.addEventListener('click', () => {
            // Check if we have an image to show
            const params = new URLSearchParams(window.location.search);
            if (!params.get('img')) {
                // No image = Redirect to Collections to pick one
                window.location.href = '../colecciones.html';
                return;
            }

            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.visibility = 'hidden';
            }, 800);
        });
    }

    // Landing Page Logic (Ensure it runs first too)
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            const landing = document.getElementById('landingPage');
            const app = document.getElementById('appContainer');

            landing.style.opacity = '0';
            landing.style.visibility = 'hidden';

            app.style.display = 'flex';
            setTimeout(() => {
                app.style.opacity = '1';
            }, 50);
        });
    }

    loadPreferences(); // Load saved settings
    initApp();
});

function initApp() {
    renderFrameSelector();
    loadDynamicImages();
    setupEventListeners();
    updatePhotoCount();

    // Home Button Logic
    document.getElementById('homeBtn').addEventListener('click', () => {
        try {
            window.location.href = '../index.html';
        } catch (e) { console.error(e); }
    });

    // Back Button Logic
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Force reload to fix scroll issues
            const params = new URLSearchParams(window.location.search);
            const currentCat = params.get('category');
            if (currentCat) {
                window.location.href = '../galeria.html?category=' + encodeURIComponent(currentCat);
            } else {
                window.location.href = '../galeria.html';
            }
        });
    }
}

function setupEventListeners() {
    // Sidebar Frame Selector Delegate
    document.getElementById('frameSelector').addEventListener('click', (e) => {
        const option = e.target.closest('.frame-option');
        if (option) {
            setGlobalFrame(option.dataset.frame);
        }
    });

    // Modal Close
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.close-modal');
    closeBtn.onclick = () => closeModal();
    window.onclick = (e) => { if (e.target == modal) closeModal(); }

    // Customization Listeners
    const thicknessInput = document.getElementById('frameThickness');
    thicknessInput.addEventListener('input', (e) => {
        updateFrameThickness(e.target.value);
        savePreferences();
    });

    const titleInput = document.getElementById('appTitleInput');
    titleInput.addEventListener('input', (e) => {
        document.querySelector('.brand h1').innerText = e.target.value;
        savePreferences();
    });

    const subtitleInput = document.getElementById('appSubtitleInput');
    subtitleInput.addEventListener('input', (e) => {
        document.querySelector('.brand p').innerText = e.target.value;
        savePreferences();
    });

    // Logo Upload
    const logoInput = document.getElementById('logoInput');
    logoInput.addEventListener('change', handleLogoUpload);

    // Remove Logo
    document.getElementById('removeLogo').addEventListener('click', () => {
        document.getElementById('brandLogo').src = '';
        document.getElementById('brandLogo').style.display = 'none';
        document.getElementById('removeLogo').style.display = 'none';
        savePreferences();
    });

    // Background Upload
    const bgInput = document.getElementById('bgInput');
    bgInput.addEventListener('change', handleBgUpload);

    // Background Size
    const bgSizeInput = document.getElementById('bgSizeInput');
    bgSizeInput.addEventListener('input', (e) => {
        const val = e.target.value;
        document.body.style.backgroundSize = `${val}%`;
        savePreferences();
    });

    // Remove Background
    document.getElementById('removeBg').addEventListener('click', () => {
        document.body.style.backgroundImage = '';
        document.getElementById('removeBg').style.display = 'none';
        savePreferences();
    });

    // Admin Toggle
    document.getElementById('adminToggle').addEventListener('click', () => {
        const panel = document.getElementById('customizationPanel');
        if (panel.style.display === 'none') {
            const password = prompt("Introduce la contraseña de administrador:");
            if (password === "admin") {
                panel.style.display = 'block';
            } else if (password !== null) {
                alert("Contraseña incorrecta.");
            }
        } else {
            panel.style.display = 'none';
        }
    });

    // Scale Reference Toggle
    const scaleCheckbox = document.getElementById('showScaleRef');
    if (scaleCheckbox) {
        scaleCheckbox.addEventListener('change', (e) => {
            const ref = document.getElementById('scaleReference');
            if (e.target.checked) {
                ref.style.display = 'flex';
                setTimeout(() => ref.classList.add('visible'), 10);
            } else {
                ref.classList.remove('visible');
                setTimeout(() => ref.style.display = 'none', 500);
            }
        });
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const base64 = readerEvent.target.result;
            if (base64.length > 2000000) {
                alert("La imagen del logo es demasiado grande para guardarse. Intenta con una más pequeña.");
                return;
            }
            const logoImg = document.getElementById('brandLogo');
            logoImg.src = base64;
            logoImg.style.display = 'block';
            document.getElementById('removeLogo').style.display = 'block';
            savePreferences();
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
}

function handleBgUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const base64 = readerEvent.target.result;
            if (base64.length > 5000000) {
                alert("La imagen es demasiado pesada (>5MB).");
                return;
            }
            document.body.style.backgroundImage = `url('${base64}')`;
            document.getElementById('removeBg').style.display = 'inline';
            savePreferences();
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
}

function updateFrameThickness(value) {
    document.documentElement.style.setProperty('--frame-thickness', value);
}

function savePreferences() {
    const prefs = {
        thickness: document.getElementById('frameThickness').value,
        title: document.getElementById('appTitleInput').value,
        subtitle: document.getElementById('appSubtitleInput').value,
        globalFrame: state.currentGlobalFrame,
        logoData: document.getElementById('brandLogo').getAttribute('src'),
        bgData: document.body.style.backgroundImage,
        bgSize: document.getElementById('bgSizeInput').value
    };
    localStorage.setItem('lumiere_prefs', JSON.stringify(prefs));
}

function loadPreferences() {
    const saved = localStorage.getItem('lumiere_prefs');
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            if (prefs.thickness) {
                document.getElementById('frameThickness').value = prefs.thickness;
                updateFrameThickness(prefs.thickness);
            }
            if (prefs.title) {
                document.getElementById('appTitleInput').value = prefs.title;
                document.querySelector('.brand h1').innerText = prefs.title;
            }
            if (prefs.subtitle) {
                document.getElementById('appSubtitleInput').value = prefs.subtitle;
                document.querySelector('.brand p').innerText = prefs.subtitle;
            }
            if (prefs.globalFrame) {
                state.currentGlobalFrame = prefs.globalFrame;
            }
            if (prefs.logoData && prefs.logoData.length > 10) {
                const logoImg = document.getElementById('brandLogo');
                logoImg.src = prefs.logoData;
                logoImg.style.display = 'block';
                document.getElementById('removeLogo').style.display = 'block';
            }
            if (prefs.bgData && prefs.bgData.length > 5) {
                document.body.style.backgroundImage = prefs.bgData;
                document.getElementById('removeBg').style.display = 'inline';
            }
            if (prefs.bgSize) {
                document.getElementById('bgSizeInput').value = prefs.bgSize;
                document.body.style.backgroundSize = `${prefs.bgSize}%`;
            }
        } catch (e) {
            console.error("Error loading preferences:", e);
            localStorage.removeItem('lumiere_prefs');
        }
    }
}

function loadDynamicImages() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');

    if (typeof artworkData !== 'undefined') {
        let dataToLoad = artworkData;

        if (categoryFilter && categoryFilter !== 'null' && categoryFilter !== '') {
            dataToLoad = artworkData.filter(art => art.category === categoryFilter);
            const headerTitle = document.querySelector('.top-bar h2');
            if (headerTitle) {
                const cleanTitle = categoryFilter.replace(/^\d+/, '').replace(/_/g, ' ');
                headerTitle.innerText = `Colección: ${cleanTitle}`;
            }
        }

        dataToLoad.forEach(art => {
            const adjustedPath = '../' + art.src;
            addPhoto(adjustedPath, art.title, art.id, art);
        });
    }

    const directImg = urlParams.get('img');
    const directTitle = urlParams.get('title');

    if (directImg) {
        const directId = 'direct_' + Date.now();
        let targetId = null;
        const existing = state.photos.find(p => p.url === directImg);

        if (existing) {
            targetId = existing.id;
        } else {
            addPhoto(directImg, directTitle || 'Obra Seleccionada', directId, {
                description: 'Obra personalizada',
                price: 'Consultar',
                size: 'Consultar'
            });
            targetId = directId;
        }

        const landing = document.getElementById('landingPage');
        const app = document.getElementById('appContainer');
        const splash = document.getElementById('splashScreen');

        if (splash) splash.style.display = 'none';
        landing.style.display = 'none';
        app.style.display = 'flex';
        app.style.opacity = '1';

        setTimeout(() => {
            openModal(targetId);
        }, 100);
    }
}

function addPhoto(url, name, specificId = null, metadata = {}) {
    const photo = {
        id: specificId || (Date.now() + Math.random()),
        url: url,
        name: name,
        frame: state.currentGlobalFrame,
        metadata: metadata
    };
    state.photos.unshift(photo);
    renderGallery();
    updatePhotoCount();
}

function renderFrameSelector() {
    const container = document.getElementById('frameSelector');
    container.innerHTML = state.frameStyles.map(style => `
        <div class="frame-option ${state.currentGlobalFrame === style.id ? 'active' : ''}" 
             data-frame="${style.id}">
            <span>${style.name}</span>
            <div style="width: 20px; height: 20px; background: #ddd; border-radius: 50%;"></div>
        </div>
    `).join('');
}

function setGlobalFrame(frameId) {
    state.currentGlobalFrame = frameId;
    renderFrameSelector();
    state.photos.forEach(p => p.frame = frameId);
    renderGallery();
}

function renderGallery() {
    const grid = document.getElementById('photoGrid');

    // Safety check: Filter out null/undefined photos
    const validPhotos = state.photos.filter(p => p && p.url);

    grid.innerHTML = validPhotos.map(photo => {
        try {
            // Safe URL encoding (fix for "Grey Boxes" in Visor)
            const safeUrl = encodeURI(photo.url).replace(/'/g, "%27");

            return `
        <div class="photo-card frame-${photo.frame}" onclick="openModal('${photo.id}')">
            <img src="${safeUrl}" alt="${photo.name}" loading="lazy">
        </div>
            `;
        } catch (e) {
            console.warn("Error rendering photo in visor:", photo, e);
            return '';
        }
    }).join('');
}

function updatePhotoCount() {
    document.getElementById('photoCount').innerText = `${state.photos.length} fotos en colección`;
}

let currentModalPhotoId = null;

function openModal(id) {
    const photo = state.photos.find(p => p.id == id);
    if (!photo) return;

    currentModalPhotoId = id;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalControls = document.getElementById('modalFrameSelector');

    modalImg.src = photo.url;
    modalImg.className = '';
    modalImg.classList.add(`frame-${photo.frame}`);

    const container = document.getElementById('modalFrameContainer');
    container.className = `modal-frame-container frame-${photo.frame}`;

    // Reset Environment to Neutral on open
    changeEnvironment('neutral');
    changePreviewSize('large');

    modalControls.innerHTML = state.frameStyles.map(style => `
        <div class="frame-option ${photo.frame === style.id ? 'active' : ''}" 
             onclick="changeSinglePhotoFrame('${style.id}')">
            <span>${style.name}</span>
        </div>
    `).join('');

    document.getElementById('artTitle').innerText = photo.name;
    document.getElementById('artDesc').innerText = photo.metadata?.description || 'Sin descripción';

    let priceVal = photo.metadata?.price || '';
    if (priceVal && !isNaN(priceVal.replace('.', '').replace(',', ''))) {
        priceVal += ' €';
    } else if (priceVal && !priceVal.includes('€') && !priceVal.toLowerCase().includes('consultar')) {
        if (/^\d+$/.test(priceVal)) priceVal += ' €';
    }

    const priceText = priceVal ? `Precio: ${priceVal}` : '';
    const sizeText = photo.metadata?.size ? `📏 Tamaño Real: ${photo.metadata.size}` : '';
    const techText = photo.metadata?.tech_info || ''; // New Tech Info

    document.getElementById('artPrice').innerText = priceText;
    document.getElementById('artSize').innerText = sizeText;
    document.getElementById('artSize').style.display = sizeText ? 'block' : 'none';

    // Update Tech Info
    const techEl = document.getElementById('artTechInfo');
    if (techEl) {
        techEl.innerText = techText;
        techEl.style.display = techText ? 'block' : 'none';
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
    currentModalPhotoId = null;
}

window.changeSinglePhotoFrame = function (styleId) {
    const photo = state.photos.find(p => p.id === currentModalPhotoId);
    if (photo) {
        photo.frame = styleId;
        document.getElementById('modalFrameContainer').className = `modal-frame-container frame-${styleId}`;
        const buttons = document.getElementById('modalFrameSelector').getElementsByClassName('frame-option');
        Array.from(buttons).forEach(btn => {
            if (btn.innerText === state.frameStyles.find(f => f.id === styleId).name) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        renderGallery();
    }
};

let currentSize = 'large';

window.changePreviewSize = function (size) {
    currentSize = size;
    const container = document.getElementById('modalFrameContainer');

    container.classList.remove('preview-small', 'preview-medium', 'preview-large');
    container.classList.add(`preview-${size}`);

    const buttons = document.querySelectorAll('.btn-size');
    buttons.forEach(btn => {
        const map = { 'small': 'S', 'medium': 'M', 'large': 'L' };
        // Check if button text matches map value 
        if (btn.innerText.trim() === map[size]) btn.classList.add('active');
        else if (btn.classList.contains('active') && ['S', 'M', 'L'].includes(btn.innerText.trim())) btn.classList.remove('active');
    });
};

document.getElementById('confirmSelectionBtn').addEventListener('click', () => {
    const photo = state.photos.find(p => p.id === currentModalPhotoId);
    const frameName = state.frameStyles.find(f => f.id === photo.frame).name;
    const sizeMap = { 'small': 'Pequeño', 'medium': 'Medio', 'large': 'Grande' };

    alert(`¡Selección Confirmada!\n\nHas elegido:\nEstilo: ${frameName}\nFormato: ${sizeMap[currentSize]}`);
});

window.changeEnvironment = function (mode) {
    const container = document.getElementById('modalFrameContainer');
    const btnNeutral = document.getElementById('btnEnvNeutral'); // Bedroom
    const btnRoom = document.getElementById('btnEnvRoom');       // Living
    const btnClassic = document.getElementById('btnEnvClassic'); // Classic / Neutral
    const btnTable = document.getElementById('btnEnvTable');     // Tabletop

    const img = container.querySelector('img');

    // Reset all
    container.classList.remove('env-room', 'env-bedroom', 'env-table');
    if (btnNeutral) btnNeutral.classList.remove('active');
    if (btnRoom) btnRoom.classList.remove('active');
    if (btnClassic) btnClassic.classList.remove('active');
    if (btnTable) btnTable.classList.remove('active');

    // Remove forced styles (reset to clean state)
    if (img) {
        img.style.transform = '';
        img.style.boxShadow = '';
        img.style.maxHeight = '';
        img.style.transformOrigin = '';
    }

    if (mode === 'room') {
        container.classList.add('env-room');
        if (btnRoom) btnRoom.classList.add('active');
    } else if (mode === 'bedroom') {
        container.classList.add('env-bedroom');
        if (btnNeutral) btnNeutral.classList.add('active');
    } else if (mode === 'table') {
        container.classList.add('env-table');
        if (btnTable) btnTable.classList.add('active');
    } else {
        // Neutral logic (Classic/Default)
        if (btnClassic) btnClassic.classList.add('active');
        // Ensure size is reapplied if needed, though strictly we just resetting environment
        changePreviewSize(currentSize || 'large');
    }
};
