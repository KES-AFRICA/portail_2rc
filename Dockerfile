# Utilise une image Nginx très légère pour servir les fichiers statiques
FROM nginx:alpine

# Copie les fichiers du portail dans le répertoire de service de Nginx
# Le contenu de votre dossier portal-app/ sera copié dans /usr/share/nginx/html/
COPY . /usr/share/nginx/html

# Le port 80 est le port par défaut sur lequel Nginx écoute dans ce conteneur.
# Il n'est pas nécessaire d'un EXPOSE explicite ici car c'est le port par défaut de Nginx pour servir du contenu web.