let allConnections = [];
let filteredConnections = [];
let currentPage = 1;
const itemsPerPage = 10;

// Vérifier l'accès administrateur
function checkAdminAccess() {
    const authenticated = sessionStorage.getItem('authenticated');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (authenticated !== 'true' || userEmail !== 'jb.onomo@kes-africa.com') {
        alert('Accès refusé. Cette page est réservée aux administrateurs.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Fonction pour gérer les utilisateurs connectés
function manageConnectedUsers(action, email = null) {
    const connectedUsers = JSON.parse(localStorage.getItem('connectedUsers') || '{}');
    const currentTime = Date.now();
    
    // Nettoyer les sessions expirées (plus de 30 minutes d'inactivité)
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    Object.keys(connectedUsers).forEach(userEmail => {
        if (currentTime - connectedUsers[userEmail].lastActivity > sessionTimeout) {
            delete connectedUsers[userEmail];
        }
    });

    switch (action) {
        case 'get':
            return connectedUsers;
        case 'count':
            return Object.keys(connectedUsers).length;
        case 'isConnected':
            return email && connectedUsers[email] ? true : false;
    }

    localStorage.setItem('connectedUsers', JSON.stringify(connectedUsers));
    return connectedUsers;
}

// Charger les données de connexion
function loadConnections() {
    const connections = JSON.parse(localStorage.getItem('connectionLogs') || '[]');
    allConnections = connections;
    filteredConnections = connections;
    updateStats();
    displayConnections();
}

// Mettre à jour les statistiques
function updateStats() {
    const totalConnections = allConnections.length;
    const uniqueUsers = new Set(allConnections.map(conn => conn.email)).size;
    const connectedUsers = manageConnectedUsers('count');
    const lastConnection = allConnections.length > 0 ? 
        new Date(allConnections[0].timestamp).toLocaleString('fr-FR') : '-';

    document.getElementById('totalConnections').textContent = totalConnections;
    document.getElementById('uniqueUsers').textContent = uniqueUsers;
    document.getElementById('connectedUsers').textContent = connectedUsers;
    document.getElementById('lastConnection').textContent = lastConnection;
}

// Afficher les connexions
function displayConnections() {
    const container = document.getElementById('connectionsContainer');
    
    if (filteredConnections.length === 0) {
        container.innerHTML = `
            <div class="no-connections">
                <div class="no-connections-icon">📭</div>
                <h3>Aucune connexion trouvée</h3>
                <p>Aucun log de connexion ne correspond à vos critères de recherche.</p>
            </div>
        `;
        document.getElementById('pagination').style.display = 'none';
        return;
    }

    // Pagination
    const totalPages = Math.ceil(filteredConnections.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentConnections = filteredConnections.slice(startIndex, endIndex);

    let html = '<div class="connections-grid">';
    
    currentConnections.forEach((connection, index) => {
        const isRecent = (Date.now() - new Date(connection.timestamp).getTime()) < 3600000; // 1 heure
        const isConnected = manageConnectedUsers('isConnected', connection.email);
        
        html += `
            <div class="connection-card ${isConnected ? 'connected-user' : ''}">
                <div class="connection-header">
                    <div>
                        <div class="connection-email">
                            ${connection.email}
                            ${isConnected ? '<span class="online-indicator">🟢 En ligne</span>' : ''}
                        </div>
                        <div class="connection-time">
                            📅 ${connection.date} à ${connection.time}
                        </div>
                    </div>
                    <div class="connection-status ${isRecent ? 'recent' : ''}">
                        ${isConnected ? '🟢 Connecté' : (isRecent ? '🟡 Récent' : '✅ Déconnecté')}
                    </div>
                </div>
                
                <div class="connection-details">
                    <div class="detail-item">
                        <span class="detail-icon">🌐</span>
                        <span class="detail-label">IP:</span>
                        <span class="detail-value">${connection.ip}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">💻</span>
                        <span class="detail-label">Navigateur:</span>
                        <span class="detail-value">${connection.browser}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">🏳️</span>
                        <span class="detail-label">Pays:</span>
                        <span class="detail-value">${connection.country}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">📍</span>
                        <span class="detail-label">Région:</span>
                        <span class="detail-value">${connection.region}</span>
                    </div>
                </div>
                
                ${connection.city !== 'Non disponible' || (connection.latitude && connection.longitude) ? `
                <div class="location-info">
                    <div class="location-title">
                        <span>📍</span>
                        Localisation détaillée
                    </div>
                    <div><strong>Ville:</strong> ${connection.city}</div>
                    ${connection.latitude && connection.longitude ? `
                    <div class="coordinates">
                        <strong>Coordonnées:</strong> ${connection.latitude}, ${connection.longitude}
                        <a href="https://www.openstreetmap.org/?mlat=${connection.latitude}&mlon=${connection.longitude}&zoom=12" target="_blank" style="margin-left: 10px; color: var(--blue-2rc);">🗺️ Voir sur la carte</a>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;

    // Mise à jour de la pagination
    updatePagination(totalPages);
}

// Mettre à jour la pagination
function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
}

// Changer de page
function changePage(direction) {
    const totalPages = Math.ceil(filteredConnections.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayConnections();
    }
}

// Recherche et filtrage
function filterConnections(searchTerm) {
    if (!searchTerm.trim()) {
        filteredConnections = allConnections;
    } else {
        const term = searchTerm.toLowerCase();
        filteredConnections = allConnections.filter(connection => 
            connection.email.toLowerCase().includes(term) ||
            connection.ip.toLowerCase().includes(term) ||
            connection.country.toLowerCase().includes(term) ||
            connection.region.toLowerCase().includes(term) ||
            connection.city.toLowerCase().includes(term) ||
            connection.browser.toLowerCase().includes(term)
        );
    }
    currentPage = 1;
    displayConnections();
}

// Actualiser les données
function refreshData() {
    loadConnections();
}

// Exporter en CSV
function exportToCSV() {
    if (allConnections.length === 0) {
        alert('Aucune donnée à exporter.');
        return;
    }

    const connectedUsers = manageConnectedUsers('get');
    const headers = ['Email', 'Date', 'Heure', 'IP', 'Navigateur', 'Pays', 'Région', 'Ville', 'Latitude', 'Longitude', 'Statut'];
    const csvContent = [
        headers.join(','),
        ...allConnections.map(conn => [
            `"${conn.email}"`,
            `"${conn.date}"`,
            `"${conn.time}"`,
            `"${conn.ip}"`,
            `"${conn.browser}"`,
            `"${conn.country}"`,
            `"${conn.region}"`,
            `"${conn.city}"`,
            conn.latitude || '',
            conn.longitude || '',
            connectedUsers[conn.email] ? 'Connecté' : 'Déconnecté'
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `connexions-2rc-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Vider les logs
function clearLogs() {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les logs de connexion ? Cette action est irréversible.')) {
        localStorage.removeItem('connectionLogs');
        allConnections = [];
        filteredConnections = [];
        updateStats();
        displayConnections();
        alert('Tous les logs ont été supprimés.');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'accès administrateur
    if (!checkAdminAccess()) {
        return;
    }

    loadConnections();
    
    // Recherche en temps réel
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterConnections(this.value);
        }, 300);
    });

    // Actualisation automatique toutes les 30 secondes
    setInterval(refreshData, 30000);
});