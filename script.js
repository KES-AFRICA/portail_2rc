// Configuration des applications avec images
const applications = [
    {
        name: "Gestion de l'eclairage public",
        description: "Application de gestion de l'éclairage public, incluant la maintenance et le suivi des pannes.",
        url: "http://relec.2rc.kesafrica.com/",
        image: "src/relec_img.jpg",
        status: "active",
    },
    {
        name: "Déclaration des pannes sur le d'éclairage public",
        description: "Site web pour permettre aux citoyens de déclarer une panne constatée sur le réseau d'éclairage public.",
        url: "http://pannes-relec.2rc.kesafrica.com/",
        image: "src/pannes_relec_img.jpg",
        status: "active",
    },
    {
        name: "Gestion des panneaux de signalisation",
        description: "Application pour la gestion des panneaux de signalisation, incluant l'état et la maintenance.",
        url: "#",
        image: "src/panneaux_img.webp",
        status: "inactive",
    },
    {
        name: "Gestion des panneaux des feux de signalisation",
        description: "Application pour la gestion intelligente des feux de signalisation, incluant la synchronisation et le suivi des pannes.",
        url: "#",
        image: "src/feux_signalisation_img.jpg",
        status: "inactive",
    },
    {
        name: "Gestion des états des routes",
        description: "Application pour le suivi de l'état des routes, incluant les réparations et les signalements.",
        url: "#",
        image: "src/etat_route_img.jpg",
        status: "inactive",
    },
    {
        name: "Gestion des canalisations",
        description: "Application pour la gestion des canalisations, incluant l'état et la maintenance.",
        url: "#",
        image: "src/canalisations_img.jpg",
        status: "inactive",
    },
];

// Fonction pour créer une carte d'application
function createAppCard(app) {
    const statusClass = app.status === 'active' ? 'status-active' : 'status-maintenance';
    const statusText = app.status === 'active' ? 'Actif' : 'Maintenance';

    return `
        <div class="app-card" data-url="${app.url}" data-name="${app.name}">
            <img src="${app.image}" alt="${app.name}" class="app-image" loading="lazy" />
            <div class="app-content">
                <h3 class="app-title">${app.name}</h3>
                <p class="app-description">${app.description}</p>
                <div class="app-meta">
                    <span class="app-status ${statusClass}">${statusText}</span>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour ouvrir une application
function openApp(url) {
    window.open(url, '_blank'); // Ouvre dans un nouvel onglet
}

// Fonction de recherche
function filterApps(searchTerm) {
    const cards = document.querySelectorAll('.app-card');

    cards.forEach(card => {
        const title = card.querySelector('.app-title').textContent.toLowerCase();
        const description = card.querySelector('.app-description').textContent.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        if (title.includes(searchLower) || description.includes(searchLower)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Initialisation
function init() {
    const appsGrid = document.getElementById('appsGrid');
    const searchInput = document.getElementById('searchInput');

    // Charger les applications
    appsGrid.innerHTML = applications.map(app => createAppCard(app)).join('');

    // Configurer la recherche
    searchInput.addEventListener('input', (e) => {
        filterApps(e.target.value);
    });

    // Configurer la délégation d'événements pour l'ouverture des applications
    appsGrid.addEventListener('click', (e) => {
        const appCard = e.target.closest('.app-card');
        if (appCard) {
            const url = appCard.dataset.url;
            // const name = appCard.dataset.name; // Si vous avez besoin du nom pour une autre logique
            if (url) {
                openApp(url);
            }
        }
    });
}

// Lancer l'initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', init);