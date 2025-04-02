// ==================================================
//              SCRIPT COMPLET POUR AppliCSE
//        (Multi-Thèmes, News, Formulaires, Menu)
//         [Version Révisée - 2024]
// ==================================================

// --- CONSTANTES ET VARIABLES GLOBALES ---

// URL du Google Sheet publié au format CSV pour les actualités
// ** Assurez-vous que ce Sheet est bien "Publié sur le Web" au format CSV **
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?output=csv';

// Drapeau pour gérer l'état de soumission des formulaires (évite le message prématuré)
let isFormSubmitting = false;

// Constantes pour la gestion des thèmes et localStorage
const THEME_STORAGE_KEY = 'cse-app-selected-theme'; // Clé unique pour localStorage
const DEFAULT_THEME = 'theme-default'; // Thème par défaut si rien n'est sauvegardé
const KNOWN_THEMES = ['theme-default', 'theme-dark', 'theme-fun']; // Liste des thèmes valides (doit correspondre aux classes CSS)

// --- GESTION DES THÈMES ---

/**
 * Applique un thème en modifiant la classe du body
 * et sauvegarde le choix dans localStorage.
 * @param {string} themeName - Le nom de la classe du thème (ex: 'theme-dark')
 */
function applyTheme(themeName) {
    // Vérifier si le thème demandé est valide, sinon utiliser le défaut
    const validThemeName = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME;
    // console.log(`[applyTheme] Applying: ${validThemeName}`); // Débug

    // Nettoyer les anciennes classes de thème du body pour éviter les conflits
    document.body.classList.remove(...KNOWN_THEMES);

    // Ajouter la nouvelle classe de thème
    document.body.classList.add(validThemeName);

    // Sauvegarder le choix dans localStorage (si possible)
    try {
        localStorage.setItem(THEME_STORAGE_KEY, validThemeName);
    } catch (e) {
        console.warn("Impossible de sauvegarder le thème dans localStorage:", e);
    }

    // Mettre à jour l'état visuel des boutons du sélecteur de thème
    updateThemeButtonStates(validThemeName);
}

/**
 * Charge le thème sauvegardé depuis localStorage ou applique le thème par défaut.
 */
function loadSavedTheme() {
    let savedTheme = DEFAULT_THEME;
    try {
        // Récupérer le thème sauvegardé, ou utiliser le défaut s'il n'y en a pas
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    } catch (e) {
        console.warn("Impossible de lire le thème depuis localStorage:", e);
        savedTheme = DEFAULT_THEME; // Retour au défaut en cas d'erreur
    }

    // Vérifier si le thème sauvegardé est toujours valide (au cas où un thème serait supprimé)
    if (!KNOWN_THEMES.includes(savedTheme)) {
        // console.warn(`Thème sauvegardé '${savedTheme}' non reconnu, retour au défaut.`); // Débug
        savedTheme = DEFAULT_THEME;
    }
    // console.log(`[loadSavedTheme] Loading: ${savedTheme}`); // Débug
    applyTheme(savedTheme); // Appliquer le thème déterminé
}

/**
 * Met à jour l'apparence (classe 'active-theme') des boutons du sélecteur
 * pour indiquer visuellement quel thème est actif.
 * @param {string} activeTheme - Le nom de la classe du thème actuellement actif.
 */
function updateThemeButtonStates(activeTheme) {
    // Cibler spécifiquement les boutons dans le conteneur du sélecteur
    const themeButtons = document.querySelectorAll('.theme-switcher-container button.theme-button[data-theme]');
    // console.log(`[updateThemeButtonStates] Updating for: ${activeTheme}`, themeButtons); // Débug
    themeButtons.forEach(button => {
        if (button.dataset.theme === activeTheme) {
            button.classList.add('active-theme');
        } else {
            button.classList.remove('active-theme');
        }
    });
}


// --- GESTION DU MENU SIDEBAR ---

/**
 * Ferme le menu latéral (sidebar).
 */
function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar && hamburger) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
    } else {
        // Ne pas bloquer l'application, juste logguer une erreur si les éléments sont absents
        if (!sidebar) console.error('Erreur: Element #sidebar non trouvé pour closeMenu.');
        if (!hamburger) console.error('Erreur: Element .hamburger non trouvé pour closeMenu.');
    }
}

/**
 * Ouvre ou ferme le menu latéral (sidebar) en basculant la classe 'active'.
 */
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar && hamburger) {
        sidebar.classList.toggle('active');
        hamburger.classList.toggle('active');
    } else {
        if (!sidebar) console.error('Erreur: Element #sidebar non trouvé pour toggleMenu.');
        if (!hamburger) console.error('Erreur: Element .hamburger non trouvé pour toggleMenu.');
    }
}

// --- CHARGEMENT DU CONTENU DES PAGES ---

/**
 * Charge le contenu HTML d'une section spécifique dans la zone principale '#main-content'.
 * Gère également l'appel aux fonctions JS nécessaires après chargement (news, formulaires).
 * @param {string} pageId - L'identifiant de la page à charger (ex: 'actualites').
 * @param {boolean} [fromMenuClick=false] - Indique si l'appel provient d'un clic menu pour fermer le menu.
 */
function loadPage(pageId, fromMenuClick = false) {
    const mainContent = document.getElementById('main-content');

    if (!mainContent) {
        console.error("Erreur critique : élément '#main-content' introuvable. La navigation est impossible.");
        return; // Bloquer si conteneur principal absent
    }

    // Ferme le menu SI l'appel vient d'un clic dans le menu
    if (fromMenuClick) {
        closeMenu();
    }

    // Réinitialiser le drapeau de soumission de formulaire lors d'un changement de page
    isFormSubmitting = false;

    let pageHTML = ''; // Variable pour stocker le HTML à injecter

    // Construire le HTML basé sur la page demandée
    switch (pageId) {
        case 'actualites':
            pageHTML = `
                <section id="actualites">
                    <h2>Dernières Actualités</h2>
                    <div id="news-container"><p class="loading-message">Chargement des actualités...</p></div>
                </section>
            `;
            // Lancer le chargement des news après l'injection HTML
            deferExecution(loadNews);
            break;

        case 'formulaire-cafe':
            pageHTML = `
                <section id="formulaire-cafe">
                    <div class="form-container">
                        <h2>Signalement Machine à Café</h2>
                        <form id="reportForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw2H0lzEAvt7niVxRhpkPQTLOaOfXz3SoI3IC9NfNxnY33Ag/formResponse" method="POST" target="hidden_iframe">
                            <div class="form-group"><label for="email" class="required">Email</label><input type="email" id="email" name="entry.1494559432" required></div>
                            <div class="form-group"><label for="name" class="required">Nom & Prénom</label><input type="text" id="name" name="entry.36162321" required></div>
                            <div class="form-group"><label for="operation" class="required">Opération</label><input type="text" id="operation" name="entry.1034050778" required></div>
                            <div class="form-group">
                                <label for="machine" class="required">Machine concernée</label>
                                <select id="machine" name="entry.212638394" required>
                                    <option value="">Sélectionnez...</option><option value="DEV125543 (E-1)">DEV125543 (E-1)</option><option value="BBRD0152 (E-1)">BBRD0152 (E-1)</option><option value="DEV16567 (E-1)">DEV16567 (E-1)</option><option value="BBRDL0196 (E-1)">BBRDL0196 (E-1)</option><option value="DBIC799 (E0)">DBIC799 (E0)</option><option value="B72ES1979 (E1)">B72ES1979 (E1)</option><option value="B72ES1903 (E2)">B72ES1903 (E2)</option><option value="DEV95042 (E2)">DEV95042 (E2)</option><option value="B72ES1977 (E3)">B72ES1977 (E3)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="problem" class="required">Type de problème</label>
                                <select id="problem" name="entry.1333521310" required>
                                    <option value="">Sélectionnez...</option><option value="Pas de gobelet">Pas de gobelet</option><option value="Gobelet vide">Gobelet vide</option><option value="Produit non conforme">Produit non conforme</option><option value="Problème de rechargement">Problème de rechargement</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <p class="note">Si problème de rechargement, précisez date/heure/moyen de paiement :</p>
                                <label for="date">Date</label><input type="date" id="date" name="entry.789458747">
                            </div>
                            <div class="form-group">
                                <label for="time">Heure</label><input type="time" id="time" name="entry.1519520523">
                            </div>
                            <div class="form-group">
                                <label for="payment">Moyen de paiement</label>
                                <select id="payment" name="entry.1578764886">
                                    <option value="">Sélectionnez...</option><option value="CB">CB</option><option value="Pluxee">Pluxee</option><option value="Espece">Espèce</option><option value="Badge">Badge</option>
                                </select>
                            </div>
                            <div class="form-group"><label for="comment">Commentaire</label><textarea id="comment" name="entry.1120842974"></textarea></div>
                            <button type="submit">Envoyer Signalement</button>
                        </form>
                        <div class="form-status-sending" style="display: none;">Envoi en cours...</div>
                        <div id="confirmation" class="confirmation" style="display: none;">Merci, signalement enregistré !</div>
                        <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                    </div>
                </section>
            `;
             // Attacher les événements après l'injection HTML
            deferExecution(() => attachFormEvents('reportForm'));
            break;

        case 'formulaire-contact':
            pageHTML = `
                <section id="formulaire-contact">
                    <div class="form-container">
                        <h2>Contacter le CSE</h2>
                        <!-- ============================================================ -->
                        <!-- !!!   METTRE A JOUR L'URL ET LES NOMS (entry.XXXX)   !!! -->
                        <!-- ============================================================ -->
                        <form id="contactForm" action="VOTRE_URL_GOOGLE_FORM_CONTACT/formResponse" method="POST" target="hidden_iframe">
                            <div class="form-group"><label for="name" class="required">Nom</label><input type="text" id="name" name="entry.XXXXXXXXXX_NOM" required></div>
                            <div class="form-group"><label for="email" class="required">Email</label><input type="email" id="email" name="entry.XXXXXXXXXX_EMAIL" required></div>
                            <div class="form-group"><label for="subject" class="required">Sujet</label><input type="text" id="subject" name="entry.XXXXXXXXXX_SUJET" required></div>
                            <div class="form-group"><label for="message" class="required">Message</label><textarea id="message" name="entry.XXXXXXXXXX_MESSAGE" required></textarea></div>
                            <button type="submit">Envoyer Message</button>
                        </form>
                        <div class="form-status-sending" style="display: none;">Envoi en cours...</div>
                        <div id="confirmation" class="confirmation" style="display: none;">Merci, message envoyé !</div>
                        <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                    </div>
                </section>
            `;
            // Attacher les événements après l'injection HTML
            deferExecution(() => attachFormEvents('contactForm'));
            break;

        case 'partenaires':
            // Contenu statique, pas besoin de JS supplémentaire après chargement
            pageHTML = `
                <section id="partenaires">
                    <h2>Nos Partenaires</h2>
                    <div class="partner">
                        <h3>Partenaire A</h3>
                        <p>Description des avantages du partenaire A.</p>
                        <p><a href="https://lien-partenaire-a.com" target="_blank" rel="noopener noreferrer">Visiter le site</a></p>
                    </div>
                    <div class="partner">
                        <h3>Partenaire B</h3>
                        <p>Description des avantages du partenaire B.</p>
                        <p><a href="https://lien-partenaire-b.com" target="_blank" rel="noopener noreferrer">Voir l'offre</a></p>
                    </div>
                    <!-- Ajouter d'autres partenaires ici -->
                </section>
            `;
            break;

        default:
            console.warn(`Page inconnue demandée : '${pageId}'. Affichage de la page d'accueil (Actualités).`);
            // Sécurité: éviter boucle infinie si 'actualites' cause problème
            if (pageId !== 'actualites') {
                deferExecution(() => loadPage('actualites', fromMenuClick));
            } else {
                pageHTML = '<p class="error-message">Erreur : Impossible de charger la page demandée.</p>';
            }
            // Si on n'a pas pu définir pageHTML et qu'on ne redirige pas, il faut sortir.
             if (!pageHTML && pageId === 'actualites') return;
    }

    // Injecter le HTML construit dans la zone principale
    mainContent.innerHTML = pageHTML;
}

/**
 * Utilitaire pour différer l'exécution d'une fonction jusqu'à la fin de la
 * boucle d'événements JavaScript courante. Utile pour exécuter du code
 * après que le navigateur ait rendu les modifications du DOM (ex: innerHTML).
 * @param {Function} callback - La fonction à exécuter de manière différée.
 */
function deferExecution(callback) {
    if (typeof callback === 'function') {
        setTimeout(callback, 0);
    } else {
        console.error("deferExecution a reçu une valeur non-fonctionnelle:", callback);
    }
}


// --- GESTION DES FORMULAIRES (Google Forms via Iframe) ---

/**
 * Attache les écouteurs d'événements 'submit' à un formulaire spécifique
 * pour gérer l'indicateur visuel et le drapeau de soumission.
 * @param {string} formId - L'ID du formulaire HTML.
 */
function attachFormEvents(formId) {
    const form = document.getElementById(formId);

    if (!form) {
        console.error(`Formulaire introuvable avec l'ID: '${formId}' dans attachFormEvents.`);
        return;
    }

    // Trouver les éléments relatifs à ce formulaire pour les retours visuels
    const submitButton = form.querySelector('button[type="submit"]');
    const statusDiv = form.parentNode.querySelector('.form-status-sending');
    const confirmationDiv = form.parentNode.querySelector('#confirmation');

    form.addEventListener("submit", function(event) {
        // Ne PAS faire event.preventDefault() - on veut que le form POST vers l'iframe

        // 1. Mettre à jour le drapeau global pour indiquer qu'une soumission est active
        isFormSubmitting = true;
        // console.log(`Formulaire '${formId}' soumis, isFormSubmitting = true`); // Débug

        // 2. Gérer l'interface utilisateur pendant l'envoi
        if(submitButton) submitButton.disabled = true; // Désactiver bouton
        if(statusDiv) statusDiv.style.display = 'block'; // Afficher "Envoi..."
        if(confirmationDiv) confirmationDiv.style.display = 'none'; // Cacher ancienne confirmation
    });
}

/**
 * Fonction déclenchée par l'attribut 'onload' de l'iframe cachée.
 * Elle gère l'affichage du message de confirmation après une soumission réussie.
 */
function onFormSubmit() {
    // console.log(`onFormSubmit déclenché. isFormSubmitting: ${isFormSubmitting}`); // Débug

    // Condition Clé : Ne traiter que si une soumission était réellement en cours
    if (!isFormSubmitting) {
        // console.log("onFormSubmit ignoré (chargement initial iframe)."); // Débug
        return; // Sortir si ce n'est pas une vraie soumission
    }

    // Si on arrive ici, c'est une vraie soumission et Google Forms a répondu

    // Cibler les éléments du formulaire ACTUELLEMENT affiché dans main-content
    const currentForm = document.querySelector('#main-content form'); // Prendre le 1er form trouvé
    // S'assurer qu'on a bien trouvé un formulaire avant de continuer
    if (!currentForm) {
         console.error("onFormSubmit n'a pas trouvé de formulaire courant dans #main-content.");
         isFormSubmitting = false; // Réinitialiser le drapeau même si erreur
         return;
    }

    // Trouver les éléments relatifs au formulaire courant
    const confirmationDiv = currentForm.parentNode.querySelector('#confirmation');
    const statusDiv = currentForm.parentNode.querySelector('.form-status-sending');
    const submitButton = currentForm.querySelector('button[type="submit"]');

    // Cacher le formulaire et le message "Envoi..."
    currentForm.style.display = "none";
    if (statusDiv) statusDiv.style.display = 'none';

    // Afficher le message de confirmation (s'il existe)
    if (confirmationDiv) {
        confirmationDiv.style.display = "block";
    } else {
        console.warn("Div de confirmation '#confirmation' non trouvée pour le formulaire courant.");
    }

    // Réinitialiser l'état après un court délai (ex: 3 secondes)
    setTimeout(() => {
        if(currentForm) currentForm.reset();             // Vider les champs du formulaire
        if(currentForm) currentForm.style.display = "block"; // Réafficher le formulaire
        if(confirmationDiv) confirmationDiv.style.display = "none"; // Cacher la confirmation
        if(submitButton) submitButton.disabled = false;     // Réactiver le bouton

        // Réinitialiser le drapeau pour permettre une nouvelle soumission
        isFormSubmitting = false;
        // console.log("Fin du timeout onFormSubmit, isFormSubmitting réinitialisé."); // Débug

    }, 3000); // Délai en millisecondes
}


// --- CHARGEMENT ET AFFICHAGE DES ACTUALITÉS (Google Sheet CSV via PapaParse) ---

/**
 * Charge et parse les données CSV depuis l'URL Google Sheet, puis les affiche.
 */
function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) {
        console.error("Conteneur '#news-container' introuvable pour afficher les actualités.");
        return;
    }
    // Le message "Chargement..." est déjà mis par loadPage

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) { // Vérifier si la requête a réussi (status 200-299)
                throw new Error(`Erreur réseau ${response.status}: ${response.statusText}. Vérifiez l'URL et les paramètres de publication du Google Sheet.`);
            }
            return response.text(); // Lire le contenu CSV comme du texte
        })
        .then(csvText => {
            // Utiliser PapaParse pour convertir le texte CSV en objets JavaScript
            Papa.parse(csvText, {
                header: true,           // Utiliser la première ligne comme en-têtes (noms de colonnes)
                skipEmptyLines: 'greedy',// Ignorer les lignes complètement vides et celles avec juste des virgules
                complete: function(results) { // Callback quand le parsing est terminé
                    // console.log('Données CSV parsées:', results.data); // Débug
                    if (results.errors && results.errors.length > 0) {
                         console.warn("Erreurs lors du parsing CSV:", results.errors);
                         // Afficher un message même si erreur partielle
                         container.innerHTML = `<p class="error-message">Certaines actualités n'ont pas pu être lues correctement.</p>`;
                    }
                    if (results.data && results.data.length > 0) {
                        // Filtrer les objets potentiellement vides si skipEmptyLines ne suffit pas
                        const validNews = results.data.filter(item => Object.values(item).some(val => val && val.trim() !== ''));
                        if (validNews.length > 0) {
                            displayNews(validNews); // Afficher les actualités valides
                        } else {
                            container.innerHTML = '<p>Aucune actualité trouvée dans le fichier.</p>';
                        }
                    } else {
                         container.innerHTML = '<p>Aucune actualité à afficher pour le moment.</p>';
                    }
                },
                error: function(error) { // Callback en cas d'erreur de parsing majeure
                     console.error('Erreur PapaParse:', error);
                     container.innerHTML = `<p class="error-message">Erreur lors de la lecture du fichier d'actualités.</p>`;
                }
            });
        })
        .catch(error => { // Gérer les erreurs réseau ou autres erreurs fetch
            console.error('Erreur lors du chargement des actualités (fetch):', error);
            container.innerHTML = `<p class="error-message">Impossible de charger les actualités. ${error.message}</p>`;
        });
}

/**
 * Affiche les actualités (préalablement parsées) dans le conteneur HTML.
 * @param {Array<Object>} newsData - Tableau d'objets où chaque objet représente une ligne/actualité.
 */
function displayNews(newsData) {
    const container = document.getElementById('news-container');
    if (!container) return; // Sécurité

    container.innerHTML = ''; // Vider le conteneur avant d'ajouter les nouvelles actualités

    if (!Array.isArray(newsData) || newsData.length === 0) {
         container.innerHTML = '<p>Aucune actualité à afficher.</p>';
         return;
    }

    // Trier les actualités par date (la plus récente en premier)
    // S'assurer que la fonction de tri gère les dates invalides/absentes
    newsData.sort((a, b) => {
        const dateA = parseDate(a.Date || a.date); // Essayer 'Date' puis 'date'
        const dateB = parseDate(b.Date || b.date);
        // Mettre les dates non valides à la fin
        if (!dateB && !dateA) return 0; // Les deux invalides, ordre indifférent
        if (!dateB) return -1; // B invalide, A vient avant
        if (!dateA) return 1;  // A invalide, B vient avant
        // Les deux valides, comparer par timestamp (plus grand = plus récent)
        return dateB.getTime() - dateA.getTime();
    });

    // Créer et ajouter un élément HTML pour chaque actualité
    newsData.forEach(item => {
        // Accéder aux propriétés de l'objet (robustesse aux variations de casse/nom)
        const title = item.Titre || item.titre || 'Actualité';
        const date = item.Date || item.date || ''; // Mettre chaîne vide si absent
        const description = item.Description || item.description || 'Détails non disponibles.';
        // Essayer plusieurs noms communs pour l'URL de l'image
        const imageUrl = item.Lien_image || item['Lien image'] || item.Image || item.image || '';

        const newsItem = document.createElement('div');
        newsItem.className = 'actu'; // Appliquer la classe CSS pour le style de carte

        // Construire le HTML interne de la carte d'actualité
        let imageHtml = '';
        if (imageUrl) {
            // Inclure l'image seulement si une URL est fournie
            // L'attribut 'onerror' gère les images cassées
            // 'loading="lazy"' améliore les performances en ne chargeant les images que lorsqu'elles deviennent visibles
            imageHtml = `
                <img src="${imageUrl}"
                     alt="Image pour ${title}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                     loading="lazy">
                <p class="error-message image-error" style="display: none;">Erreur chargement image.</p>
            `;
        }

        newsItem.innerHTML = `
            <h3>${title}</h3>
            ${date ? `<p><strong>Date :</strong> ${date}</p>` : ''}
            <p>${description}</p>
            ${imageHtml}
        `;
        container.appendChild(newsItem); // Ajouter la carte au conteneur
    });
}

// ... (Tout le code précédent jusqu'à la fonction parseDate) ...

/**
 * Tente de parser une chaîne de caractères en objet Date JavaScript.
 * Gère les formats courants comme DD/MM/YYYY et YYYY-MM-DD.
 * @param {string} dateString - La chaîne de date potentielle.
 * @returns {Date|null} Un objet Date valide ou null si le parsing échoue.
 */
function parseDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;

    dateString = dateString.trim();
    let parts, day, month, year, date;

    // 1. Tente DD/MM/YYYY ou DD.MM.YYYY ou DD-MM-YYYY
    parts = dateString.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
    if (parts) {
        day = parseInt(parts[1], 10);
        month = parseInt(parts[2], 10) - 1; // Mois 0-indexé en JS
        year = parseInt(parts[3], 10);
        // Vérification de base de validité
        if (year > 1900 && year < 2100 && month >= 0 && month < 12 && day > 0 && day <= 31) {
            date = new Date(Date.UTC(year, month, day)); // Utiliser UTC pour éviter pb de fuseau horaire
            // Vérifier si la date construite correspond (évite ex: 31/02/2024 devient 03/03/2024)
            if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
                 return date;
            }
        }
    }

    // 2. Tente YYYY-MM-DD (Format ISO partiel, plus fiable)
    parts = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
     if (parts) {
        year = parseInt(parts[1], 10);
        month = parseInt(parts[2], 10) - 1;
        day = parseInt(parts[3], 10);
        if (year > 1900 && year < 2100 && month >= 0 && month < 12 && day > 0 && day <= 31) {
           date = new Date(Date.UTC(year, month, day));
             if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
                 return date;
             }
         }
    }

    // 3. Tente MM/DD/YYYY (Format américain)
    parts = dateString.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
     if (parts) {
        month = parseInt(parts[1], 10) - 1; // Mois en premier
        day = parseInt(parts[2], 10);
        year = parseInt(parts[3], 10);
        if (year > 1900 && year < 2100 && month >= 0 && month < 12 && day > 0 && day <= 31) {
            date = new Date(Date.UTC(year, month, day));
             if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
                 // Retourner seulement si ce n'est pas déjà parsé par le format DD/MM/YYYY
                 // (pour éviter ambiguïté sur 01/02/2024 par exemple)
                 // On peut ajouter une vérification plus stricte si nécessaire,
                 // mais pour l'instant on retourne si ça semble valide.
                 return date;
             }
         }
    }


    // 4. Tentative de parsing par le navigateur (dernier recours, moins fiable)
    try {
         const parsedTimestamp = Date.parse(dateString);
         if (!isNaN(parsedTimestamp)) {
            // console.log(`Date parsed by browser: ${dateString} -> ${new Date(parsedTimestamp)}`); // Débug
            return new Date(parsedTimestamp);
         }
    } catch(e) {
        // Ignorer l'erreur si Date.parse échoue
    }

    // console.warn("Format de date non reconnu ou date invalide :", dateString); // Débug
    return null; // Retourner null si aucun format n'a fonctionné
}


// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---

/**
 * Exécute le code d'initialisation une fois que le DOM est entièrement chargé.
 * Attache les écouteurs d'événements globaux (menu, thèmes) et charge le contenu initial.
 */
document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM chargé. Initialisation de l\'application CSE...'); // Débug

    // 1. Appliquer le thème sauvegardé (ou défaut) immédiatement
    loadSavedTheme();

    // 2. S'assurer que le menu est fermé au démarrage
    closeMenu();

    // 3. Charger la page d'accueil par défaut (Actualités)
    // L'appel à loadNews se fera à l'intérieur de loadPage('actualites')
    loadPage('actualites', false);

    // 4. Attacher l'écouteur au bouton hamburger pour ouvrir/fermer le menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        // Nettoyer un éventuel listener précédent (sécurité si rechargement partiel)
        // hamburger.removeEventListener('click', toggleMenu); // Peut être omis si chargement complet normal
        // Attacher le listener
        hamburger.addEventListener('click', toggleMenu);
        // console.log('Listener attaché au bouton hamburger.'); // Débug
    } else {
        console.error("CRITICAL: Bouton hamburger '.hamburger' introuvable lors de l'initialisation.");
    }

    // 5. Attacher l'écouteur pour le sélecteur de thème (utilisation de la délégation d'événements)
    const sidebarElement = document.getElementById('sidebar'); // Parent stable pour la délégation
    if (sidebarElement) {
        sidebarElement.addEventListener('click', (event) => {
            // Vérifier si l'élément cliqué (ou un de ses parents) est un bouton de thème
            const themeButton = event.target.closest('.theme-switcher-container button.theme-button[data-theme]');

            if (themeButton) {
                 // console.log('Clic détecté sur le bouton de thème:', themeButton.dataset.theme); // Débug
                 event.preventDefault(); // Empêcher comportement par défaut si c'était un lien <a> par ex.
                 const themeToApply = themeButton.dataset.theme;
                 applyTheme(themeToApply);
                 // Optionnel : Fermer le menu après sélection d'un thème
                 // closeMenu();
            }
            // Si ce n'est pas un bouton de thème (ex: clic sur bouton de navigation),
            // l'événement n'est pas intercepté ici et les `onclick` des autres boutons fonctionneront.
        });
         // console.log('Listener pour le sélecteur de thème attaché à la sidebar.'); // Débug
    } else {
        console.error("CRITICAL: Élément sidebar '#sidebar' introuvable. Le sélecteur de thème ne fonctionnera pas.");
    }
});

// ==================================================
//              FIN DU SCRIPT
// ==================================================
