// ==================================================
//              SCRIPT COMPLET POUR AppliCSE
// ==================================================

// --- CONSTANTES ET VARIABLES GLOBALES ---

// URL du Google Sheet publié au format CSV pour les actualités
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?output=csv';

// Drapeau pour gérer l'état de soumission des formulaires (évite le message prématuré)
let isFormSubmitting = false; 

// --- GESTION DU MENU SIDEBAR ---

// Fonction pour fermer le menu explicitement
function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar && hamburger) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
        // console.log('Menu fermé'); // Décommenter pour débugger
    } else {
        console.error('Erreur : sidebar ou hamburger non trouvé pour closeMenu');
    }
}

// Fonction pour ouvrir/fermer le menu hamburger
function toggleMenu() {
    console.log('toggleMenu function CALLED!'); // <-- Vérifie si elle est appelée
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    
    if (sidebar && hamburger) {
        console.log('Elements found, toggling active class...'); // <-- Vérifie si les éléments sont trouvés
        sidebar.classList.toggle('active');
        hamburger.classList.toggle('active');
        console.log('Sidebar active state now:', sidebar.classList.contains('active')); // <-- Vérifie l'état après
    } else {
        // Si un des éléments n'est pas trouvé, l'indiquer clairement
        console.error('Error in toggleMenu: Could not find sidebar or hamburger element.');
        if (!sidebar) console.error('Sidebar element NOT FOUND (check ID)');
        if (!hamburger) console.error('Hamburger element NOT FOUND (check class)');
    }
}

// --- CHARGEMENT DU CONTENU DES PAGES ---

// Fonction pour charger une page dynamiquement dans main-content
function loadPage(page, fromMenuClick = false) {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) {
        console.error("Erreur critique : main-content n'existe pas.");
        return;
    }

    // Ferme le menu SI l'appel vient d'un clic dans le menu
    if (fromMenuClick) {
        closeMenu(); // Utiliser closeMenu pour être sûr de le fermer
    }

    // Réinitialiser le drapeau de soumission au changement de page
    isFormSubmitting = false; 

    // Injecter le HTML correspondant à la page demandée
    if (page === 'actualites') {
        mainContent.innerHTML = `
            <section id="actualites">
                <h2>Dernières Actualités</h2>
                <div id="news-container"><p>Chargement des actualités...</p></div>
            </section>
        `;
        loadNews(); // Lancer le chargement des news
    } else if (page === 'formulaire-cafe') {
        mainContent.innerHTML = `
            <section id="formulaire-cafe">
                <div class="form-container">
                    <h2>Signalement Problème Machine à Café</h2>
                    <form id="reportForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw2H0lzEAvt7niVxRhpkPQTLOaOfXz3SoI3IC9NfNxnY33Ag/formResponse" method="POST" target="hidden_iframe">
                        <!-- Champs du formulaire café -->
                        <div class="form-group">
                            <label for="email" class="required">Email</label>
                            <input type="email" id="email" name="entry.1494559432" required>
                        </div>
                        <div class="form-group">
                            <label for="name" class="required">Nom & Prénom</label>
                            <input type="text" id="name" name="entry.36162321" required>
                        </div>
                        <div class="form-group">
                            <label for="operation" class="required">Opération</label>
                            <input type="text" id="operation" name="entry.1034050778" required>
                        </div>
                        <div class="form-group">
                            <label for="machine" class="required">Machine concernée</label>
                            <select id="machine" name="entry.212638394" required>
                                <option value="">Sélectionnez une machine</option>
                                <option value="DEV125543 (E-1)">DEV125543 (E-1)</option>
                                <option value="BBRD0152 (E-1)">BBRD0152 (E-1)</option>
                                <option value="DEV16567 (E-1)">DEV16567 (E-1)</option>
                                <option value="BBRDL0196 (E-1)">BBRDL0196 (E-1)</option>
                                <option value="DBIC799 (E0)">DBIC799 (E0)</option>
                                <option value="B72ES1979 (E1)">B72ES1979 (E1)</option>
                                <option value="B72ES1903 (E2)">B72ES1903 (E2)</option>
                                <option value="DEV95042 (E2)">DEV95042 (E2)</option>
                                <option value="B72ES1977 (E3)">B72ES1977 (E3)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="problem" class="required">Type de problème</label>
                            <select id="problem" name="entry.1333521310" required>
                                <option value="">Sélectionnez un problème</option>
                                <option value="Pas de gobelet">Pas de gobelet</option>
                                <option value="Gobelet vide">Gobelet vide</option>
                                <option value="Produit non conforme à la demande">Produit non conforme à la demande</option>
                                <option value="Problème de rechargement">Problème de rechargement</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <p class="note">S’il s'agit d'un problème de rechargement, merci d'indiquer la date, heure et moyen de paiement.</p>
                            <label for="date">Date</label>
                            <input type="date" id="date" name="entry.789458747">
                        </div>
                        <div class="form-group">
                            <label for="time">Heure</label>
                            <input type="time" id="time" name="entry.1519520523">
                        </div>
                        <div class="form-group">
                            <label for="payment">Moyen de paiement</label>
                            <select id="payment" name="entry.1578764886">
                                <option value="">Sélectionnez un moyen de paiement</option>
                                <option value="CB">CB</option>
                                <option value="Pluxee">Pluxee</option>
                                <option value="Espece">Espèce</option>
                                <option value="Badge">Badge</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="comment">Commentaire (optionnel)</label>
                            <textarea id="comment" name="entry.1120842974"></textarea>
                        </div>
                        <button type="submit">Envoyer le signalement</button>
                    </form>
                    <!-- Div pour le message d'envoi (optionnel) -->
                    <div class="form-status-sending" style="display: none;">Envoi en cours...</div> 
                    <!-- Div pour la confirmation -->
                    <div id="confirmation" class="confirmation" style="display: none;"> 
                        Merci pour votre signalement ! Il a bien été enregistré.
                    </div>
                    <!-- Iframe cachée -->
                    <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                </div>
            </section>
        `;
        attachFormEvents('reportForm'); // Attacher les écouteurs à ce formulaire
    } else if (page === 'formulaire-contact') {
        mainContent.innerHTML = `
            <section id="formulaire-contact">
                <div class="form-container">
                    <h2>Formulaire de Contact</h2>
                    <!-- !!! REMPLACEZ URL_GOOGLE_FORM ET LES entry.XXXX !!! -->
                    <form id="contactForm" action="URL_GOOGLE_FORM" method="POST" target="hidden_iframe"> 
                        <div class="form-group">
                            <label for="name" class="required">Nom</label>
                            <input type="text" id="name" name="entry.XXXXXXXXXX1" required>
                        </div>
                        <div class="form-group">
                            <label for="email" class="required">Email</label>
                            <input type="email" id="email" name="entry.XXXXXXXXXX2" required>
                        </div>
                        <div class="form-group">
                            <label for="subject" class="required">Sujet</label>
                            <input type="text" id="subject" name="entry.XXXXXXXXXX3" required>
                        </div>
                        <div class="form-group">
                            <label for="message" class="required">Message</label>
                            <textarea id="message" name="entry.XXXXXXXXXX4" required></textarea>
                        </div>
                        <button type="submit">Envoyer le message</button>
                    </form>
                     <!-- Div pour le message d'envoi (optionnel) -->
                    <div class="form-status-sending" style="display: none;">Envoi en cours...</div> 
                    <!-- Div pour la confirmation -->
                    <div id="confirmation" class="confirmation" style="display: none;">
                        Merci pour votre message ! Il a bien été envoyé.
                    </div>
                     <!-- Iframe cachée -->
                    <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                </div>
            </section>
        `;
        attachFormEvents('contactForm'); // Attacher les écouteurs à ce formulaire
    } else if (page === 'partenaires') {
        mainContent.innerHTML = `
            <section id="partenaires">
                <h2>Nos Partenaires</h2>
                <!-- Contenu statique des partenaires -->
                <div class="partner">
                    <h3>Partenaire 1</h3>
                    <p>Un super partenaire qui propose des réductions sur les loisirs.</p>
                    <p><a href="https://exemple.com" target="_blank">Visiter leur site</a></p>
                </div>
                <div class="partner">
                    <h3>Partenaire 2</h3>
                    <p>Partenaire spécialisé dans les voyages à prix réduit.</p>
                    <p><a href="https://exemple.com" target="_blank">Visiter leur site</a></p>
                </div>
                <!-- Ajoutez d'autres partenaires ici -->
            </section>
        `;
    } else {
        // Page inconnue ou page d'accueil par défaut
        mainContent.innerHTML = '<p>Contenu non trouvé.</p>';
        // Charger les actualités par défaut si aucune page n'est spécifiée
        if (!page) loadPage('actualites'); 
    }
}

// --- GESTION DES FORMULAIRES ---

// Fonction pour attacher les événements aux formulaires (levée du drapeau)
function attachFormEvents(formId) {
    const form = document.getElementById(formId);
    
    if (!form) {
        console.error("Formulaire non trouvé avec l'ID:", formId);
        return; // Sortir si le formulaire n'existe pas
    }

    const submitButton = form.querySelector('button[type="submit"]');
    // Trouver les divs de statut et confirmation relatives à ce formulaire
    const statusDiv = form.parentNode.querySelector('.form-status-sending');
    const confirmationDiv = form.parentNode.querySelector('#confirmation'); 

    form.addEventListener("submit", function(event) {
        // On ne fait PAS event.preventDefault() pour laisser la soumission vers l'iframe

        // Mettre à jour le drapeau pour indiquer une soumission en cours
        isFormSubmitting = true; 
        // console.log("Formulaire soumis, isFormSubmitting mis à true"); // Débug

        // Afficher "Envoi en cours..." et gérer les états visuels
        if(submitButton) submitButton.disabled = true;
        if(statusDiv) statusDiv.style.display = 'block'; 
        if(confirmationDiv) confirmationDiv.style.display = 'none'; // Cacher l'ancienne confirmation

    });
}

// Fonction appelée par l'attribut 'onload' de l'iframe cachée
function onFormSubmit() {
    // console.log("onFormSubmit déclenché. isFormSubmitting:", isFormSubmitting); // Débug

    // NE RIEN FAIRE si le drapeau n'est pas levé (chargement initial)
    if (!isFormSubmitting) {
        // console.log("Chargement initial de l'iframe ignoré."); // Débug
        return; 
    }

    // Le formulaire a été soumis et la réponse de Google est chargée dans l'iframe

    // Cibler les éléments du formulaire ACTUELLEMENT affiché
    const currentForm = document.querySelector('#main-content form'); 
    const confirmationDiv = currentForm ? currentForm.parentNode.querySelector('#confirmation') : null; 
    const statusDiv = currentForm ? currentForm.parentNode.querySelector('.form-status-sending') : null;
    const submitButton = currentForm ? currentForm.querySelector('button[type="submit"]') : null;

    if (currentForm && confirmationDiv) {
        // Cacher le formulaire et le message "Envoi..."
        currentForm.style.display = "none";
        if (statusDiv) statusDiv.style.display = 'none';

        // Afficher le message de confirmation
        confirmationDiv.style.display = "block";
        
        // Réinitialiser après un délai
        setTimeout(() => {
            if(currentForm) currentForm.reset(); // Vider les champs
            if(currentForm) currentForm.style.display = "block"; // Réafficher
            if(confirmationDiv) confirmationDiv.style.display = "none"; // Cacher
            if(submitButton) submitButton.disabled = false; // Réactiver
            
            // Réinitialiser le drapeau !
            isFormSubmitting = false; 
            // console.log("Fin du timeout, isFormSubmitting réinitialisé à false"); // Débug

        }, 3000); // Délai de 3 secondes

    } else {
        console.error("Impossible de trouver le formulaire courant ou la div de confirmation dans onFormSubmit.");
         // Réinitialiser le drapeau même en cas d'erreur pour éviter de bloquer
         isFormSubmitting = false;
    }
}


// --- CHARGEMENT ET AFFICHAGE DES ACTUALITÉS ---

// Fonction pour charger les actualités depuis le CSV Google Sheet
function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) {
        console.error("Conteneur de news introuvable.");
        return;
    }
    container.innerHTML = '<p>Chargement des actualités...</p>'; // Message pendant le chargement

    fetch(csvUrl)
        .then(response => {
            // console.log('Statut de la réponse fetch:', response.status); // Débug
            if (!response.ok) {
                throw new Error(`Erreur réseau ${response.status} : ${response.statusText}`);
            }
            return response.text();
        })
        .then(csvText => {
            // console.log('Contenu brut du CSV:', csvText); // Débug
            // Utiliser PapaParse pour parser le CSV
            Papa.parse(csvText, {
                header: true,       // La première ligne contient les en-têtes
                skipEmptyLines: true, // Ignorer les lignes vides
                complete: function(results) {
                    // console.log('Données parsées par PapaParse:', results.data); // Débug
                    if (results.errors.length > 0) {
                         console.warn("Erreurs de parsing PapaParse:", results.errors);
                    }
                    if (results.data && results.data.length > 0) {
                        displayNews(results.data); // Afficher les news si données valides
                    } else {
                         container.innerHTML = '<p class="error-message">Aucune actualité trouvée dans le fichier.</p>';
                    }
                },
                error: function(error) {
                     console.error('Erreur PapaParse:', error);
                     container.innerHTML = `<p class="error-message">Erreur lors du traitement des actualités : ${error.message}</p>`;
                }
            });
        })
        .catch(error => {
            console.error('Erreur lors du fetch des actualités:', error);
            container.innerHTML = `<p class="error-message">Impossible de charger les actualités : ${error.message}. Vérifiez l'URL et le partage du Google Sheet.</p>`;
        });
}

// Fonction pour afficher les actualités dans le DOM
function displayNews(news) {
    const container = document.getElementById('news-container');
    if (!container) return; // Sécurité
    
    container.innerHTML = ''; // Vider le conteneur

    if (!Array.isArray(news) || news.length === 0) {
         container.innerHTML = '<p>Aucune actualité à afficher pour le moment.</p>';
         return;
    }

    // Trier les news par date (la plus récente d'abord) si une colonne 'Date' existe
    // et est dans un format comparable (ex: YYYY-MM-DD ou DD/MM/YYYY)
    if (news[0].Date) {
        news.sort((a, b) => {
            // Tenter de parser les dates - adapter le format si nécessaire
            // Ceci suppose un format comme DD/MM/YYYY ou YYYY-MM-DD
            const dateA = parseDate(a.Date);
            const dateB = parseDate(b.Date);
            // Comparer en timestamp (descendant)
            return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0); 
        });
    }


    news.forEach(item => {
        // Vérifier que les colonnes existent bien (robustesse)
        const title = item.Titre || 'Actualité sans titre';
        const date = item.Date || 'Date non spécifiée';
        const description = item.Description || 'Pas de description.';
        const imageUrl = item.Lien_image || item['Lien image'] || ''; // Tester plusieurs noms de colonnes courants

        const newsItem = document.createElement('div');
        newsItem.className = 'actu'; // Classe CSS pour le style

        // Construire le HTML de l'actualité
        let imageHtml = '';
        if (imageUrl) {
            // Gérer l'erreur de chargement d'image directement dans l'HTML
            imageHtml = `
                <img src="${imageUrl}" 
                     alt="Image pour ${title}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
                     loading="lazy"> 
                <p class="error-message image-error" style="display: none;">Impossible de charger l'image (${imageUrl})</p>
            `;
        }
        
        newsItem.innerHTML = `
            <h3>${title}</h3>
            <p><strong>Date :</strong> ${date}</p>
            <p>${description}</p>
            ${imageHtml} 
        `;
        container.appendChild(newsItem);
    });
}

// Fonction utilitaire pour parser les dates (simple exemple, à adapter)
function parseDate(dateString) {
    if (!dateString) return null;
    // Tente DD/MM/YYYY
    let parts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (parts) {
        // Attention: Mois est 0-indexé en JS (0 = Janvier)
        return new Date(parts[3], parts[2] - 1, parts[1]);
    }
    // Tente YYYY-MM-DD (plus fiable car format ISO partiel)
    parts = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
     if (parts) {
        return new Date(parts[1], parts[2] - 1, parts[3]);
    }
    // Tente de laisser JS faire avec Date.parse ou new Date()
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }
    return null; // Format non reconnu
}

// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---

document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM entièrement chargé et analysé'); // Débug
    
    // S'assurer que le menu est fermé au démarrage
    closeMenu(); 
    
    // Charger la page d'actualités par défaut sans déclencher la fermeture du menu
    loadPage('actualites', false); 
    
    // Attacher le listener au bouton hamburger (même si déjà fait dans l'HTML, sécurité)
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.removeEventListener('click', toggleMenu); // Eviter doublons si rechargement partiel
        hamburger.addEventListener('click', toggleMenu);
    } else {
        console.error("Bouton hamburger non trouvé à l'initialisation.");
    }
});

// ==================================================
//              FIN DU SCRIPT
// ==================================================
