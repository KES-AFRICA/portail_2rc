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

        // Fonction pour obtenir l'adresse IP publique
        async function getPublicIP() {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                return data.ip;
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'IP:', error);
                return 'Non disponible';
            }
        }

        // Fonction pour obtenir les informations de géolocalisation
        async function getLocationInfo(ip) {
            try {
                const response = await fetch(`https://ipapi.co/${ip}/json/`);
                const data = await response.json();
                return {
                    country: data.country_name || 'Non disponible',
                    region: data.region || 'Non disponible',
                    city: data.city || 'Non disponible',
                    latitude: data.latitude || null,
                    longitude: data.longitude || null
                };
            } catch (error) {
                console.error('Erreur lors de la récupération de la géolocalisation:', error);
                return {
                    country: 'Non disponible',
                    region: 'Non disponible',
                    city: 'Non disponible',
                    latitude: null,
                    longitude: null
                };
            }
        }

        // Fonction pour obtenir les informations du navigateur
        function getBrowserInfo() {
            const ua = navigator.userAgent;
            let browserName = 'Inconnu';
            let browserVersion = 'Inconnu';

            if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
                browserName = 'Chrome';
                browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Inconnu';
            } else if (ua.indexOf('Firefox') > -1) {
                browserName = 'Firefox';
                browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Inconnu';
            } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
                browserName = 'Safari';
                browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Inconnu';
            } else if (ua.indexOf('Edg') > -1) {
                browserName = 'Edge';
                browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Inconnu';
            }

            return `${browserName} ${browserVersion}`;
        }

        // Fonction pour enregistrer la connexion
        function logConnection(email, ip, location, browser) {
            const connections = JSON.parse(localStorage.getItem('connectionLogs') || '[]');
            
            const connectionLog = {
                email: email,
                ip: ip,
                browser: browser,
                country: location.country,
                region: location.region,
                city: location.city,
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString('fr-FR'),
                time: new Date().toLocaleTimeString('fr-FR')
            };

            connections.unshift(connectionLog); // Ajouter au début pour avoir les plus récents en premier
            localStorage.setItem('connectionLogs', JSON.stringify(connections));
        }

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
            
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const errorMessage = document.getElementById('errorMessage');
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Masquer le message d'erreur
            errorMessage.style.display = 'none';

            // Validation basique
            if (!email || !password) {
                errorMessage.textContent = 'Veuillez remplir tous les champs.';
                errorMessage.style.display = 'block';
                return;
            }

            // Validation de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errorMessage.textContent = 'Veuillez entrer une adresse email valide.';
                errorMessage.style.display = 'block';
                emailInput.focus();
                return;
            }

            // Affichage du loading
            this.classList.add('loading');

            try {
                // Vérifier le mot de passe
                const enteredPasswordHash = await hashPassword(password);
                
                if (enteredPasswordHash === correctPasswordHash) {
                    // Mot de passe correct - récupérer les informations de connexion
                    const ip = await getPublicIP();
                    const location = await getLocationInfo(ip);
                    const browser = getBrowserInfo();

                    // Enregistrer la connexion
                    logConnection(email, ip, location, browser);

                    // Stocker l'authentification
                    sessionStorage.setItem('authenticated', 'true');
                    sessionStorage.setItem('authTime', Date.now().toString());
                    sessionStorage.setItem('userEmail', email);
                    
                    // Animation de succès
                    emailInput.style.borderColor = '#10B981';
                    passwordInput.style.borderColor = '#10B981';
                    
                    // Rediriger vers le portail après un court délai
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    // Mot de passe incorrect
                    errorMessage.textContent = 'Mot de passe incorrect. Veuillez réessayer.';
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
                console.error('Erreur lors de la connexion:', error);
                errorMessage.textContent = 'Erreur technique. Veuillez réessayer.';
                errorMessage.style.display = 'block';
            } finally {
                // Retirer le loading
                this.classList.remove('loading');
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
                    sessionStorage.removeItem('userEmail');
                }
            }
        }

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            // Vérifier l'authentification au chargement de la page
            checkAuthentication();
            
            // Focus automatique sur le champ email
            document.getElementById('email').focus();
            
            // Gérer l'appui sur Entrée
            document.getElementById('password').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
                }
            });
        });