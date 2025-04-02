// ==================================================
//              SCRIPT COMPLET POUR AppliCSE
//        (Multi-Thèmes, News, Formulaires, Menu)
// ==================================================

// --- CONSTANTES ET VARIABLES GLOBALES ---

// URL du Google Sheet publié au format CSV pour les actualités
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?output=csv';

// Drapeau pour gérer l'état de soumission des formulaires (évite le message prématuré)
let isFormSubmitting = false;

// Constantes pour la gestion des thèmes et localStorage
const THEME_STORAGE_KEY = 'cse-app-selected-theme'; // Clé unique pour localStorage
const DEFAULT_THEME = 'theme-default'; // Thème par défaut si rien n'est sauvegardé
const KNOWN_THEMES = ['theme-default', 'theme-dark', 'theme-fun']; // Liste des thèmes valides

// --- GESTION DES THÈMES ---

/**
 * Applique un thème en ajoutant/retirant la classe du body
 * et sauvegarde le choix dans localStorage.
 * @param {string} themeName - Le nom de la classe du thème (ex: 'theme-dark')
 */
function applyTheme(themeName) {
    // Vérifier si le thème demandé est valide
    const validThemeName = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME;

    // Nettoyer les anciennes classes de thème du body
    document.body.classList.remove(...KNOWN_THEMES);

    // Ajouter la nouvelle classe de thème
    document.body.classList.add(validThemeName);

    // Sauvegarder le choix dans localStorage
    try {
        localStorage.setItem(THEME_STORAGE_KEY, validThemeName);
    } catch (e) {
        console.warn("Impossible de sauvegarder le thème dans localStorage:", e);
    }

    // Mettre à jour l'état visuel des boutons du sélecteur de thème
    updateThemeButtonStates(validThemeName);

    // console.log(`Thème appliqué : ${validThemeName}`); // Décommenter pour débug
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
        // Garder le thème par défaut en cas d'erreur
        savedTheme = DEFAULT_THEME;
    }

    // Vérifier si le thème sauvegardé est toujours valide (au cas où on supprime un thème)
    if (!KNOWN_THEMES.includes(savedTheme)) {
        savedTheme = DEFAULT_THEME;
    }

    applyTheme(savedTheme); // Appliquer le thème déterminé
}

/**
 * Met à jour l'apparence des boutons du sélecteur pour indiquer le thème actif.
 * @param {string} activeTheme - Le nom de la classe du thème actuellement actif.
 */
function updateThemeButtonStates(activeTheme) {
    const themeButtons = document.querySelectorAll('.theme-switcher button[data-theme]');
    themeButtons.forEach(button => {
        if (button.dataset.theme === activeTheme) {
            button.classList.add('active-theme'); // Ajoute la classe pour le style CSS
        } else {
            button.classList.remove('active-theme');
        }
    });
}


// --- GESTION DU MENU SIDEBAR ---

/**
 * Ferme le menu latéral.
 */
function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar && hamburger) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
    } else {
        console.error('Erreur : sidebar ou hamburger non trouvé pour closeMenu');
    }
}

/**
 * Ouvre ou ferme le menu latéral (toggle).
 */
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar && hamburger) {
        sidebar.classList.toggle('active');
        hamburger.classList.toggle('active');
    } else {
         console.error('Erreur : sidebar ou hamburger non trouvé pour toggleMenu');
    }
}

// --- CHARGEMENT DU CONTENU DES PAGES ---

/**
 * Charge le contenu HTML d'une section spécifique dans la zone principale.
 * @param {string} page - L'identifiant de la page à charger (ex: 'actualites').
 * @param {boolean} [fromMenuClick=false] - Indique si l'appel provient d'un clic menu.
 */
function loadPage(page, fromMenuClick = false) {
    const mainContent = document.getElementById('main-content');

    if (!mainContent) {
        console.error("Erreur critique : élément 'main-content' introuvable.");
        return;
    }

    // Ferme le menu SI l'appel vient d'un clic dans le menu
    if (fromMenuClick) {
        closeMenu();
    }

    // Réinitialiser le drapeau de soumission de formulaire au changement de page
    isFormSubmitting = false;

    let pageHTML = ''; // Variable pour stocker le HTML à injecter

    // Construire le HTML basé sur la page demandée
    switch (page) {
        case 'actualites':
            pageHTML = `
                <section id="actualites">
                    <h2>Dernières Actualités</h2>
                    <div id="news-container"><p>Chargement des actualités...</p></div>
                </section>
            `;
            // Lancer le chargement des news après l'injection HTML
            deferExecution(loadNews);
            break;

        case 'formulaire-cafe':
            pageHTML = `
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
                        <div class="form-status-sending" style="display: none;">Envoi en cours...</div>
                        <div id="confirmation" class="confirmation" style="display: none;">
                            Merci pour votre signalement ! Il a bien été enregistré.
                        </div>
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
                        <h2>Formulaire de Contact</h2>
                        <!-- !!! REMPLACEZ URL_GOOGLE_FORM ET LES entry.XXXX !!! -->
                        <form id="contactForm" action="URL_VOTRE_GOOGLE_FORM_CONTACT_RESPONSE" method="POST" target="hidden_iframe">
                            <div class="form-group">
                                <label for="name" class="required">Nom</label>
                                <input type="text" id="name" name="ENTRY_ID_NOM" required>
                            </div>
                            <div class="form-group">
                                <label for="email" class="required">Email</label>
                                <input type="email" id="email" name="ENTRY_ID_EMAIL" required>
                            </div>
                            <div class="form-group">
                                <label for="subject" class="required">Sujet</label>
                                <input type="text" id="subject" name="ENTRY_ID_SUJET" required>
                            </div>
                            <div class="form-group">
                                <label for="message" class="required">Message</label>
                                <textarea id="message" name="ENTRY_ID_MESSAGE" required></textarea>
                            </div>
                            <button type="submit">Envoyer le message</button>
                        </form>
                        <div class="form-status-sending" style="display: none;">Envoi en cours...</div>
                        <div id="confirmation" class="confirmation" style="display: none;">
                            Merci pour votre message ! Il a bien été envoyé.
                        </div>
                        <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                    </div>
                </section>
            `;
            // Attacher les événements après l'injection HTML
            deferExecution(() => attachFormEvents('contactForm'));
            break;

        case 'partenaires':
            pageHTML = `
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
            break;

        default:
            console.warn(`Page inconnue demandée : ${page}. Affichage des actualités.`);
            // Rediriger vers les actualités si page inconnue
            // Utiliser setTimeout pour éviter appel récursif immédiat si 'actualites' échoue aussi
            setTimeout(() => loadPage('actualites', fromMenuClick), 0); 
            return; // Sortir pour éviter d'injecter du HTML vide
    }

    // Injecter le HTML dans la page
    mainContent.innerHTML = pageHTML;
}

/**
 * Diffère l'exécution d'une fonction après la mise à jour du DOM.
 * Utile pour s'assurer que les éléments HTML sont présents avant d'y attacher des événements.
 * @param {Function} callback - La fonction à exécuter.
 */
function deferExecution(callback) {
    // Utilise setTimeout avec 0ms pour placer l'exécution à la fin de la file d'attente des événements
    setTimeout(callback, 0);
}


// --- GESTION DES FORMULAIRES ---

/**
 * Attache les écouteurs d'événements nécessaires à un formulaire spécifique.
 * @param {string} formId - L'ID du formulaire auquel attacher les événements.
 */
function attachFormEvents(formId) {
    const form = document.getElementById(formId);

    if (!form) {
        console.error(`Formulaire non trouvé avec l'ID: ${formId} dans attachFormEvents.`);
        return; // Sortir si le formulaire n'existe pas
    }

    const submitButton = form.querySelector('button[type="submit"]');
    // Trouver les divs de statut et confirmation relatives à CE formulaire
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

/**
 * Fonction appelée par l'attribut 'onload' de l'iframe cachée après soumission.
 */
function onFormSubmit() {
    // console.log("onFormSubmit déclenché. isFormSubmitting:", isFormSubmitting); // Débug

    // NE RIEN FAIRE si le drapeau n'est pas levé (chargement initial de l'iframe)
    if (!isFormSubmitting) {
        // console.log("Chargement initial de l'iframe ignoré."); // Débug
        return;
    }

    // Le formulaire a été soumis et la réponse de Google est chargée dans l'iframe

    // Cibler les éléments du formulaire ACTUELLEMENT affiché dans main-content
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

/**
 * Charge les actualités depuis le fichier CSV Google Sheet.
 */
function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) {
        console.error("Conteneur de news 'news-container' introuvable.");
        return;
    }
    // Afficher un message pendant le chargement (sera remplacé par les news ou un message d'erreur)
    // container.innerHTML = '<p>Chargement des actualités...</p>';

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur réseau ${response.status} : ${response.statusText}. Vérifiez l'URL et les autorisations de partage du Google Sheet.`);
            }
            return response.text();
        })
        .then(csvText => {
            // Utiliser PapaParse pour parser le CSV
            Papa.parse(csvText, {
                header: true,       // La première ligne contient les en-têtes
                skipEmptyLines: true, // Ignorer les lignes vides
                complete: function(results) {
                    // console.log('Données parsées par PapaParse:', results.data); // Débug
                    if (results.errors.length > 0) {
                         console.warn("Erreurs de parsing PapaParse:", results.errors);
                         // Afficher un message d'erreur partiel si possible
                         container.innerHTML = `<p class="error-message">Certaines lignes du fichier d'actualités n'ont pas pu être lues correctement.</p>`;
                    }
                    if (results.data && results.data.length > 0) {
                        displayNews(results.data); // Afficher les news
                    } else {
                         container.innerHTML = '<p>Aucune actualité trouvée pour le moment.</p>';
                    }
                },
                error: function(error) {
                     console.error('Erreur PapaParse:', error);
                     container.innerHTML = `<p class="error-message">Erreur lors du traitement du fichier d'actualités : ${error.message}</p>`;
                }
            });
        })
        .catch(error => {
            console.error('Erreur lors du fetch des actualités:', error);
            container.innerHTML = `<p class="error-message">Impossible de charger les actualités. ${error.message}</p>`;
        });
}

/**
 * Affiche les actualités formatées dans le conteneur HTML.
 * @param {Array<Object>} news - Un tableau d'objets représentant les actualités.
 */
function displayNews(news) {
    const container = document.getElementById('news-container');
    if (!container) return;

    container.innerHTML = ''; // Vider le conteneur avant d'ajouter

    if (!Array.isArray(news) || news.length === 0) {
         container.innerHTML = '<p>Aucune actualité à afficher pour le moment.</p>';
         return;
    }

    // Trier les news par date (la plus récente d'abord)
    news.sort((a, b) => {
        const dateA = parseDate(a.Date);
        const dateB = parseDate(b.Date);
        // Gérer les dates nulles : les mettre à la fin
        if (!dateB) return -1;
        if (!dateA) return 1;
        // Comparer par timestamp (descendant)
        return dateB.getTime() - dateA.getTime();
    });


    news.forEach(item => {
        // Vérifier et utiliser les noms de colonnes potentiels (gestion des variations)
        const title = item.Titre || item.titre || 'Actualité sans titre';
        const date = item.Date || item.date || 'Date non spécifiée';
        const description = item.Description || item.description || 'Pas de description.';
        const imageUrl = item.Lien_image || item['Lien image'] || item.Image || item.image || '';

        const newsItem = document.createElement('div');
        newsItem.className = 'actu'; // Classe CSS pour le style

        let imageHtml = '';
        if (imageUrl) {
            // Gestion de l'erreur de chargement d'image directement dans l'HTML
            imageHtml = `
                <img src="${imageUrl}"
                     alt="Image pour ${title}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                     loading="lazy">
                <p class="error-message image-error" style="display: none;">Impossible de charger l'image.</p>
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

/**
 * Tente de parser une chaîne de caractères en objet Date.
 * Gère les formats DD/MM/YYYY et YYYY-MM-DD.
 * @param {string} dateString - La chaîne de date à parser.
 * @returns {Date|null} L'objet Date si le parsing réussit, sinon null.
 */
function parseDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;

    dateString = dateString.trim();
    let parts;

    // Tente DD/MM/YYYY
    parts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (parts) {
        // Attention: Mois est 0-indexé en JS (0 = Janvier)
        const day = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1;
        const year = parseInt(parts[3], 10);
        // Vérification simple de validité
        if (month >= 0 && month < 12 && day > 0 && day <= 31) {
            const date = new Date(year, month, day);
            // Vérifier si la date construite correspond (évite ex: 31/02/2024)
            if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                 return date;
            }
        }
    }

    // Tente YYYY-MM-DD (plus fiable car format ISO partiel)
    parts = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
     if (parts) {
        const year = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1;
        const day = parseInt(parts[3], 10);
         if (month >= 0 && month < 12 && day > 0 && day <= 31) {
            const date = new Date(Date.UTC(year, month, day)); // Utiliser UTC pour éviter fuseau horaire
             // Vérifier si la date construite correspond
             if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
                 return date;
             }
         }
    }

    // Tente de laisser JS faire avec new Date() en dernier recours
    // Attention : très dépendant du format et du navigateur/locale
    try {
         const parsed = new Date(dateString);
         if (!isNaN(parsed.getTime())) {
            return parsed;
         }
    } catch(e) {
        // Ignorer l'erreur si new Date() échoue
    }

    console.warn("Format de date non reconnu :", dateString);
    return null; // Format non reconnu ou date invalide
}


// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---

document.addEventListener('DOMContentLoaded', () => {
    // --- CHARGER LE THÈME EN PREMIER ---
    loadSavedTheme();
    // -----------------------------------

    // console.log('DOM entièrement chargé et analysé'); // Débug

    // Fermer le menu au démarrage (sécurité)
    closeMenu();

    // Charger la page d'actualités par défaut
    loadPage('actualites', false);

    // Attacher l'écouteur au bouton hamburger
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        // Utiliser une fonction anonyme pour éviter les problèmes de `this`
        // et s'assurer qu'un seul listener est actif
        hamburger.removeEventListener('click', toggleMenu); // Précaution si rechargement partiel
        hamburger.addEventListener('click', () => toggleMenu());
    } else {
        console.error("CRITICAL: Bouton hamburger '.hamburger' introuvable à l'initialisation.");
    }

    // Attacher l'écouteur pour le sélecteur de thème (délégation d'événement)
    const sidebarElement = document.getElementById('sidebar'); // Utiliser l'élément sidebar
    if (sidebarElement) {
        sidebarElement.addEventListener('click', (event) => {
            // Vérifier si le clic vient bien d'un bouton de thème DANS le switcher
            const themeButton = event.target.closest('.theme-switcher button[data-theme]');
            if (themeButton) {
                const themeToApply = themeButton.dataset.theme;
                applyTheme(themeToApply);
                // Optionnel : Fermer le menu si le sélecteur est dedans et qu'on veut le fermer après choix
                // closeMenu();
            }
        });
    } else {
        console.error("CRITICAL: Élément sidebar '#sidebar' introuvable pour attacher le listener du theme switcher.");
    }
});

// ==================================================
//              FIN DU SCRIPT
// ==================================================
