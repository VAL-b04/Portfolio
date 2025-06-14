// Variables globales
let activeWindows = new Set();
let minimizedWindows = new Map();
let isDragging = false;
let currentWindow = null;
let offset = { x: 0, y: 0 };

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 1000);
    setupDesktopIcons();
    setupWindowDragging();
});

// Gestion de l'horloge
function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    
    timeElement.textContent = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    dateElement.textContent = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Gestion du menu Démarrer
function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    startMenu.classList.toggle('active');
}

// Fermer le menu Démarrer au clic ailleurs
document.addEventListener('click', function(e) {
    const startMenu = document.getElementById('start-menu');
    const startButton = document.querySelector('.start-button');
    
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
        startMenu.classList.remove('active');
    }
});

// Gestion des icônes du bureau
function setupDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    
    icons.forEach(icon => {
        icon.addEventListener('click', function() {
            if (this.dataset.inactive === "true") return;
            
            icons.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
        });
        
        icon.addEventListener('dblclick', function() {
            if (this.dataset.inactive === "true") return;
            
            const windowId = this.dataset.window + '-window';
            if (windowId !== 'undefined-window') {
                openWindow(windowId);
            }
        });
    });
}

// Ouvrir une fenêtre
function openWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.classList.add('active');
        window.classList.remove('minimized');
        window.style.zIndex = getHighestZIndex() + 1;
        activeWindows.add(windowId);
        
        removeFromTaskbar(windowId);
    }
    
    document.getElementById('start-menu').classList.remove('active');
}

// Fermer une fenêtre
function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.classList.remove('active');
        window.classList.remove('maximized');
        window.classList.remove('minimized');
        activeWindows.delete(windowId);
        minimizedWindows.delete(windowId);
        removeFromTaskbar(windowId);
    }
}

// Minimiser une fenêtre
function minimizeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.classList.remove('active');
        window.classList.add('minimized');
        activeWindows.delete(windowId);
        
        addToTaskbar(windowId);
    }
}

// Ajouter une fenêtre à la barre des tâches
function addToTaskbar(windowId) {
    const taskbarApps = document.getElementById('taskbar-apps');
    
    if (document.getElementById('taskbar-' + windowId)) return;
    
    const taskbarApp = document.createElement('div');
    taskbarApp.className = 'taskbar-app';
    taskbarApp.id = 'taskbar-' + windowId;
    taskbarApp.onclick = () => restoreWindow(windowId);
    
    const icon = document.createElement('div');
    icon.className = 'taskbar-app-icon';
    
    const title = document.createElement('div');
    title.className = 'taskbar-app-title';
    
    // Définir l'icône et le titre selon le type de fenêtre
    const windowTitles = {
        'project-window': 'Mes Projets',
        'galerie-window': 'Galerie',
        'pauvocoder-gallery-window': 'Galerie Pauvocoder',
        'bouygues-gallery-window': 'Galerie Bouygues',
        'naturalis-gallery-window': 'Galerie Naturalis',
        'administrateur-window': 'Administrateur',
        'pauvocoder-window': 'Pauvocoder',
        'bouygues-window': 'Bouygues Telecom',
        'naturalis-window': 'Naturalis'
    };
    
    const windowIcons = {
        'galerie-window': 'url("image/galerie.png")',
        'pauvocoder-gallery-window': 'url("image/galerie.png")',
        'bouygues-gallery-window': 'url("image/galerie.png")',
        'naturalis-gallery-window': 'url("image/galerie.png")'
    };
    
    icon.style.backgroundImage = windowIcons[windowId] || 'url("image/documents.png")';
    title.textContent = windowTitles[windowId] || 'Application';
    
    taskbarApp.appendChild(icon);
    taskbarApp.appendChild(title);
    taskbarApps.appendChild(taskbarApp);
    
    minimizedWindows.set(windowId, taskbarApp);
}

// Supprimer une fenêtre de la barre des tâches
function removeFromTaskbar(windowId) {
    const taskbarApp = document.getElementById('taskbar-' + windowId);
    if (taskbarApp) {
        taskbarApp.remove();
        minimizedWindows.delete(windowId);
    }
}

// Restaurer une fenêtre depuis la barre des tâches
function restoreWindow(windowId) {
    openWindow(windowId);
}

// Maximiser/Restaurer une fenêtre
function maximizeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.classList.toggle('maximized');
    }
}

// Ouvrir un projet - Fonction pour "Mes Projets"
function openProject(projectName) {
    const windowId = projectName + '-window';
    openWindow(windowId);
}

// Ouvrir une galerie de projet - Fonction mise à jour pour tous les projets
function openProjectGallery(projectName) {
    const galleryWindowId = projectName + '-gallery-window';
    openWindow(galleryWindowId);
}

// Visualiser une image en grand
function viewImage(imagePath) {
    const viewer = document.getElementById('image-viewer');
    const viewerImage = document.getElementById('viewer-image');
    
    viewerImage.src = imagePath;
    viewer.classList.add('active');
}

// Fermer le visualiseur d'images
function closeImageViewer() {
    const viewer = document.getElementById('image-viewer');
    viewer.classList.remove('active');
}

// Fermer le visualiseur en cliquant sur l'arrière-plan
document.getElementById('image-viewer').addEventListener('click', function(e) {
    if (e.target === this) {
        closeImageViewer();
    }
});

// Obtenir le z-index le plus élevé
function getHighestZIndex() {
    let highest = 1000;
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(window => {
        const zIndex = parseInt(window.style.zIndex) || 1000;
        if (zIndex > highest) {
            highest = zIndex;
        }
    });
    
    return highest;
}

// Gestion du glisser-déposer des fenêtres
function setupWindowDragging() {
    const windowHeaders = document.querySelectorAll('.window-header');
    
    windowHeaders.forEach(header => {
        header.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('window-control')) return;
            
            const window = this.parentElement;
            if (window.classList.contains('maximized')) return;
            
            isDragging = true;
            currentWindow = window;
            
            const rect = currentWindow.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            
            currentWindow.style.zIndex = getHighestZIndex() + 1;
            
            e.preventDefault();
        });
    });
}

// Gestion du mouvement de la souris
document.addEventListener('mousemove', function(e) {
    if (isDragging && currentWindow && !currentWindow.classList.contains('maximized')) {
        const x = e.clientX - offset.x;
        const y = e.clientY - offset.y;
        
        const maxX = window.innerWidth - currentWindow.offsetWidth;
        const maxY = window.innerHeight - currentWindow.offsetHeight - 60;
        
        currentWindow.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        currentWindow.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    }
});

// Arrêter le glisser-déposer
document.addEventListener('mouseup', function() {
    isDragging = false;
    currentWindow = null;
});

// Clic sur les fenêtres pour les mettre au premier plan
document.addEventListener('click', function(e) {
    const window = e.target.closest('.window');
    if (window) {
        window.style.zIndex = getHighestZIndex() + 1;
    }
});

function restartComputer() {
    window.location.href = 'index.html';
}

function shutdownComputer() {
    window.close();
}