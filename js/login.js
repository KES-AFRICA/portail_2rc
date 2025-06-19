// Hachage sécurisé du mot de passe (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash du mot de passe correct (pré-calculé pour "2Rc@@2025-")
const correctPasswordHash = 'f52d7d0dbb72dd20df4484f6149befeead5a64a5a03f82eeb805467cd0fb88ea';

// Gestion de l'affichage/masquage du mot de passe
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// Gestion de la soumission du formulaire
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const password = passwordInput.value;

    // Masquer le message d'erreur
    errorMessage.style.display = 'none';

    // Validation basique
    if (!password) {
        errorMessage.textContent = 'Veuillez entrer un mot de passe.';
        errorMessage.style.display = 'block';
        return;
    }

    // Vérifier le mot de passe
    try {
        const enteredPasswordHash = await hashPassword(password);
        
        if (enteredPasswordHash === correctPasswordHash) {
            // Mot de passe correct - stocker l'authentification
            sessionStorage.setItem('authenticated', 'true');
            sessionStorage.setItem('authTime', Date.now().toString());
            
            // Animation de succès (optionnel)
            passwordInput.style.borderColor = '#10B981';
            
            // Rediriger vers le portail après un court délai
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            // Mot de passe incorrect
            errorMessage.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
            
            // Animation d'erreur
            passwordInput.style.borderColor = '#EF4444';
            setTimeout(() => {
                passwordInput.style.borderColor = '';
            }, 2000);
        }
    } catch (error) {
        console.error('Erreur lors du hachage:', error);
        errorMessage.textContent = 'Erreur technique. Veuillez réessayer.';
        errorMessage.style.display = 'block';
    }
});

// Vérifier si l'utilisateur est déjà connecté
function checkAuthentication() {
    const authenticated = sessionStorage.getItem('authenticated');
    const authTime = sessionStorage.getItem('authTime');
    
    if (authenticated === 'true' && authTime) {
        // Vérifier si la session n'a pas expiré (24 heures)
        const currentTime = Date.now();
        const sessionAge = currentTime - parseInt(authTime);
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
        
        if (sessionAge < sessionTimeout) {
            // Session valide, rediriger vers le index.html
            window.location.href = 'index.html';
        } else {
            // Session expirée, nettoyer
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('authTime');
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification au chargement de la page
    checkAuthentication();
    
    // Focus automatique sur le champ mot de passe
    document.getElementById('password').focus();
    
    // Gérer l'appui sur Entrée
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }
    });
});