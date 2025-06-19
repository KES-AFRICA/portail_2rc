// Configuration des applications avec images
const applications = [
    {
        name: "Gestion de l'éclairage public",
        description: "Application de gestion de l'éclairage public, incluant la maintenance et le suivi des pannes.",
        url: "http://relec.2rc.kesafrica.com/",
        image: "src/relec_img.jpg",
        status: "active",
        category: "infrastructure"
    },
    {
        name: "Déclaration des pannes d'éclairage public",
        description: "Site web pour permettre aux citoyens de déclarer une panne constatée sur le réseau d'éclairage public.",
        url: "http://pannes-relec.2rc.kesafrica.com/",
        image: "src/pannes_relec_img.jpg",
        status: "active",
        category: "services"
    },
    {
        name: "Gestion des panneaux de signalisation",
        description: "Application pour la gestion des panneaux de signalisation, incluant l'état et la maintenance.",
        url: "#",
        image: "src/panneaux_img.webp",
        status: "maintenance",
        category: "signalisation"
    },
    {
        name: "Gestion des feux de signalisation",
        description: "Application pour la gestion intelligente des feux de signalisation, incluant la synchronisation et le suivi des pannes.",
        url: "#",
        image: "src/feux_signalisation_img.jpg",
        status: "maintenance",
        category: "signalisation"
    },
    {
        name: "Gestion des états des routes",
        description: "Application pour le suivi de l'état des routes, incluant les réparations et les signalements.",
        url: "#",
        image: "src/etat_route_img.jpg",
        status: "maintenance",
        category: "infrastructure"
    },
    {
        name: "Gestion des canalisations",
        description: "Application pour la gestion des canalisations, incluant l'état et la maintenance.",
        url: "#",
        image: "src/canalisations_img.jpg",
        status: "maintenance",
        category: "infrastructure"
    },
];

// Vérification de l'authentification
function checkAuthentication() {
    const authenticated = sessionStorage.getItem('authenticated');
    const authTime = sessionStorage.getItem('authTime');
    
    if (authenticated !== 'true' || !authTime) {
        // Non authentifié, rediriger vers la page de connexion
        window.location.href = 'login.html';
        return false;
    }
    
    // Vérifier si la session n'a pas expiré (24 heures)
    const currentTime = Date.now();
    const sessionAge = currentTime - parseInt(authTime);
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
    
    if (sessionAge >= sessionTimeout) {
        // Session expirée, nettoyer et rediriger
        sessionStorage.removeItem('authenticated');
        sessionStorage.removeItem('authTime');
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Fonction de déconnexion
function logout() {
    // Nettoyer les données de session
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('authTime');
    
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
}

// Fonction pour créer une carte d'application
function createAppCard(app) {
    let statusClass, statusText;
    
    switch(app.status) {
        case 'active':
            statusClass = 'status-active';
            statusText = 'Actif';
            break;
        case 'maintenance':
            statusClass = 'status-maintenance';
            statusText = 'Maintenance';
            break;
        default:
            statusClass = 'status-inactive';
            statusText = 'Inactif';
    }

    return `
        <div class="app-card" data-url="${app.url}" data-name="${app.name}" data-status="${app.status}">
            <img src="${app.image}" alt="${app.name}" class="app-image" loading="lazy" />
            <div class="app-content">
                <h3 class="app-title">${app.name}</h3>
                <p class="app-description">${app.description}</p>
                <div class="app-meta">
                    <span class="app-status ${statusClass}">${statusText}</span>
                    <span class="app-category">${app.category}</span>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour ouvrir une application
function openApp(url, status) {
    if (status === 'active') {
        window.open(url, '_blank');
    } else {
        alert('Cette application est actuellement en maintenance. Veuillez réessayer plus tard.');
    }
}

// Fonction de recherche
function filterApps(searchTerm) {
    const cards = document.querySelectorAll('.app-card');

    cards.forEach(card => {
        const title = card.querySelector('.app-title').textContent.toLowerCase();
        const description = card.querySelector('.app-description').textContent.toLowerCase();
        const category = card.querySelector('.app-category').textContent.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        if (title.includes(searchLower) || 
            description.includes(searchLower) || 
            category.includes(searchLower)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Fonction pour afficher un message de bienvenue
function showWelcomeMessage() {
    const authTime = sessionStorage.getItem('authTime');
    if (authTime) {
        const loginTime = new Date(parseInt(authTime));
        const currentTime = new Date();
        const timeDiff = Math.floor((currentTime - loginTime) / 1000 / 60); // en minutes
        
        if (timeDiff < 5) {
            // Afficher un message de bienvenue subtil
            const welcomeMsg = document.createElement('div');
            welcomeMsg.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #1E3A8A, #FF5722);
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    animation: slideIn 0.5s ease-out;
                ">
                    <strong>✅ Connexion réussie!</strong><br>
                    <small>Bienvenue sur le portail 2RC</small>
                </div>
                <style>
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                </style>
            `;
            
            document.body.appendChild(welcomeMsg);
            
            // Supprimer le message après 4 secondes
            setTimeout(() => {
                welcomeMsg.remove();
            }, 4000);
        }
    }
}

// Initialisation
function init() {
    // Vérifier l'authentification avant tout
    if (!checkAuthentication()) {
        return;
    }

    const appsGrid = document.getElementById('appsGrid');
    const searchInput = document.getElementById('searchInput');
    const logoutBtn = document.getElementById('logoutBtn');

    // Charger les applications
    if (appsGrid) {
        appsGrid.innerHTML = applications.map(app => createAppCard(app)).join('');
    }

    // Configurer la recherche
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterApps(e.target.value);
        });
    }

    // Configurer le bouton de déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Demander confirmation
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                logout();
            }
        });
    }

    // Configurer la délégation d'événements pour l'ouverture des applications
    if (appsGrid) {
        appsGrid.addEventListener('click', (e) => {
            const appCard = e.target.closest('.app-card');
            if (appCard) {
                const url = appCard.dataset.url;
                const status = appCard.dataset.status;
                
                if (url && url !== '#') {
                    openApp(url, status);
                } else if (status === 'maintenance') {
                    alert('Cette application est actuellement en maintenance. Veuillez réessayer plus tard.');
                } else {
                    alert('Cette application n\'est pas encore disponible.');
                }
            }
        });
    }

    // Afficher le message de bienvenue si récemment connecté
    showWelcomeMessage();

    // Vérifier périodiquement l'authentification (toutes les 5 minutes)
    setInterval(() => {
        checkAuthentication();
    }, 5 * 60 * 1000);
}

// Gestion des erreurs d'images
function handleImageError() {
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            // Image de fallback si l'image ne se charge pas
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwMCAxMDBoNTB2NTBoLTUweiIvPjwvc3ZnPg==';
        }
    }, true);
}

// Exécuter l'initialisation lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    init();
    handleImageError();
});
// Vérifier l'authentification à chaque chargement de la page
window.addEventListener('load', () => {
    checkAuthentication();
});
// Ajouter un écouteur d'événement pour la touche "Escape" pour fermer les modales
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.open');
        if (openModal) {
            openModal.classList.remove('open');
        }
    }
});

