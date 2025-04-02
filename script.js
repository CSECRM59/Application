// ==================================================
//              SCRIPT COMPLET POUR AppliCSE
//        (Multi-Thèmes, News, Formulaires, Menu, Partenaires)
//         [Version Finale Révisée - 2024]
// ==================================================

// --- CONSTANTES ET VARIABLES GLOBALES ---

// URLs des Google Sheets publiés au format CSV
// ** Assurez-vous que ces Sheets sont bien "Publiés sur le Web" au format CSV **
const newsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=0&single=true&output=csv'; // Feuille Actualités
const partnersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1082465411&single=true&output=csv'; // Feuille Partenaires

// Drapeau pour l'état de soumission des formulaires
let isFormSubmitting = false;

// Constantes pour la gestion des thèmes
const THEME_STORAGE_KEY = 'cse-app-selected-theme';
const DEFAULT_THEME = 'theme-default';
const KNOWN_THEMES = ['theme-default', 'theme-dark', 'theme-fun']; // Doit correspondre aux classes CSS

// --- GESTION DES THÈMES ---

/**
 * Applique un thème en modifiant la classe du body
 * et sauvegarde le choix dans localStorage.
 * @param {string} themeName - Nom de la classe du thème (ex: 'theme-dark').
 */
function applyTheme(themeName) {
    const validThemeName = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME;
    document.body.classList.remove(...KNOWN_THEMES);
    document.body.classList.add(validThemeName);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, validThemeName);
    } catch (e) {
        console.warn("LocalStorage indisponible ou erreur:", e);
    }
    updateThemeButtonStates(validThemeName);
}

/**
 * Charge le thème sauvegardé ou applique le thème par défaut au démarrage.
 */
function loadSavedTheme() {
    let savedTheme = DEFAULT_THEME;
    try {
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    } catch (e) {
        savedTheme = DEFAULT_THEME;
    }
    if (!KNOWN_THEMES.includes(savedTheme)) {
        savedTheme = DEFAULT_THEME;
    }
    applyTheme(savedTheme);
}

/**
 * Met à jour l'état visuel (classe 'active-theme') des boutons du sélecteur.
 * @param {string} activeTheme - Nom du thème actuellement actif.
 */
function updateThemeButtonStates(activeTheme) {
    const themeButtons = document.querySelectorAll('.theme-switcher-container button.theme-button[data-theme]');
    themeButtons.forEach(button => {
        button.classList.toggle('active-theme', button.dataset.theme === activeTheme);
    });
}

// --- GESTION DU MENU SIDEBAR ---

/**
 * Ferme le menu latéral (sidebar).
 */
function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar) sidebar.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
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
        console.error("Élément du menu introuvable (sidebar ou hamburger).");
    }
}

// --- CHARGEMENT DU CONTENU DES PAGES ---

/**
 * Charge le contenu HTML d'une section et lance les fonctions JS associées.
 * @param {string} pageId - Identifiant de la page (ex: 'actualites').
 * @param {boolean} [fromMenuClick=false] - Si appelé depuis le menu.
 */
function loadPage(pageId, fromMenuClick = false) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error("CRITICAL: #main-content introuvable.");
        return;
    }
    if (fromMenuClick) closeMenu();
    isFormSubmitting = false; // Réinitialiser état formulaire
    mainContent.innerHTML = ''; // Vider avant de charger

    let pageHTML = '';
    let deferredAction = null; // Fonction à exécuter après injection HTML

    switch (pageId) {
        case 'actualites':
            pageHTML = `<section id="actualites"><h2>Dernières Actualités</h2><div id="news-container"><p class="loading-message">Chargement...</p></div></section>`;
            deferredAction = loadNews;
            break;

        case 'formulaire-cafe':
            pageHTML = `
                <section id="formulaire-cafe"><div class="form-container"><h2>Signalement Machine à Café</h2>
                <form id="reportForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw2H0lzEAvt7niVxRhpkPQTLOaOfXz3SoI3IC9NfNxnY33Ag/formResponse" method="POST" target="hidden_iframe">
                    <div class="form-group"><label for="email" class="required">Email</label><input type="email" id="email" name="entry.1494559432" required></div>
                    <div class="form-group"><label for="name" class="required">Nom & Prénom</label><input type="text" id="name" name="entry.36162321" required></div>
                    <div class="form-group"><label for="operation" class="required">Opération</label><input type="text" id="operation" name="entry.1034050778" required></div>
                    <div class="form-group"><label for="machine" class="required">Machine concernée</label><select id="machine" name="entry.212638394" required><option value="">Sélectionnez...</option><option value="DEV125543 (E-1)">DEV125543 (E-1)</option><option value="BBRD0152 (E-1)">BBRD0152 (E-1)</option><option value="DEV16567 (E-1)">DEV16567 (E-1)</option><option value="BBRDL0196 (E-1)">BBRDL0196 (E-1)</option><option value="DBIC799 (E0)">DBIC799 (E0)</option><option value="B72ES1979 (E1)">B72ES1979 (E1)</option><option value="B72ES1903 (E2)">B72ES1903 (E2)</option><option value="DEV95042 (E2)">DEV95042 (E2)</option><option value="B72ES1977 (E3)">B72ES1977 (E3)</option></select></div>
                    <div class="form-group"><label for="problem" class="required">Type de problème</label><select id="problem" name="entry.1333521310" required><option value="">Sélectionnez...</option><option value="Pas de gobelet">Pas de gobelet</option><option value="Gobelet vide">Gobelet vide</option><option value="Produit non conforme">Produit non conforme</option><option value="Problème de rechargement">Problème de rechargement</option></select></div>
                    <div class="form-group"><p class="note">Si problème de rechargement, précisez date/heure/moyen de paiement :</p><label for="date">Date</label><input type="date" id="date" name="entry.789458747"><label for="time">Heure</label><input type="time" id="time" name="entry.1519520523"><label for="payment">Moyen de paiement</label><select id="payment" name="entry.1578764886"><option value="">Sélectionnez...</option><option value="CB">CB</option><option value="Pluxee">Pluxee</option><option value="Espece">Espèce</option><option value="Badge">Badge</option></select></div>
                    <div class="form-group"><label for="comment">Commentaire</label><textarea id="comment" name="entry.1120842974"></textarea></div>
                    <button type="submit">Envoyer Signalement</button>
                </form>
                <div class="form-status-sending" style="display: none;">Envoi en cours...</div>
                <div id="confirmation" class="confirmation" style="display: none;">Merci, signalement enregistré !</div>
                <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                </div></section>`;
             deferredAction = () => attachFormEvents('reportForm');
             break;

        case 'formulaire-contact':
             // =======================================================================
             // !!! REMPLACER URL_FORMULAIRE ET LES entry.XXXX PAR VOS VALEURS RÉELLES !!!
             // =======================================================================
             pageHTML = `
                <section id="formulaire-contact"><div class="form-container"><h2>Contacter le CSE</h2>
                <form id="contactForm" action="URL_FORMULAIRE_CONTACT/formResponse" method="POST" target="hidden_iframe">
                    <div class="form-group"><label for="name" class="required">Nom</label><input type="text" id="name" name="entry.XXXX_NOM" required></div>
                    <div class="form-group"><label for="email" class="required">Email</label><input type="email" id="email" name="entry.XXXX_EMAIL" required></div>
                    <div class="form-group"><label for="subject" class="required">Sujet</label><input type="text" id="subject" name="entry.XXXX_SUJET" required></div>
                    <div class="form-group"><label for="message" class="required">Message</label><textarea id="message" name="entry.XXXX_MESSAGE" required></textarea></div>
                    <button type="submit">Envoyer Message</button>
                </form>
                <div class="form-status-sending" style="display: none;">Envoi en cours...</div>
                <div id="confirmation" class="confirmation" style="display: none;">Merci, message envoyé !</div>
                <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                </div></section>`;
             deferredAction = () => attachFormEvents('contactForm');
             break;

        case 'partenaires':
            pageHTML = `<section id="partenaires"><h2>Nos Partenaires</h2><div id="partners-container"><p class="loading-message">Chargement...</p></div></section>`;
            deferredAction = loadPartners;
            break;

        default:
            console.warn(`Page inconnue: '${pageId}'. Affichage Actualités.`);
            if (pageId !== 'actualites') {
                deferExecution(() => loadPage('actualites', fromMenuClick));
            } else {
                pageHTML = '<p class="error-message">Erreur chargement page.</p>';
            }
            if (!pageHTML && pageId === 'actualites') return;
    }

    mainContent.innerHTML = pageHTML; // Injecter le HTML
    if (deferredAction) {
        deferExecution(deferredAction); // Exécuter l'action JS associée
    }
}

/**
 * Exécute une fonction après un délai de 0ms, utile après manipulation du DOM.
 * @param {Function} callback Fonction à exécuter.
 */
function deferExecution(callback) {
    if (typeof callback === 'function') {
        setTimeout(callback, 0);
    }
}

// --- GESTION DES FORMULAIRES ---

/**
 * Attache les listeners de soumission à un formulaire.
 * @param {string} formId ID du formulaire.
 */
function attachFormEvents(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Formulaire introuvable: #${formId}`);
        return;
    }
    const submitButton = form.querySelector('button[type="submit"]');
    const statusDiv = form.parentNode.querySelector('.form-status-sending');
    const confirmationDiv = form.parentNode.querySelector('#confirmation');

    form.addEventListener("submit", function() {
        isFormSubmitting = true;
        if(submitButton) submitButton.disabled = true;
        if(statusDiv) statusDiv.style.display = 'block';
        if(confirmationDiv) confirmationDiv.style.display = 'none';
    });
}

/**
 * Gère la réponse de l'iframe après soumission du formulaire.
 */
function onFormSubmit() {
    if (!isFormSubmitting) return; // Ignorer si pas une soumission réelle

    const currentForm = document.querySelector('#main-content form');
    if (!currentForm) {
         console.error("onFormSubmit: Formulaire courant non trouvé.");
         isFormSubmitting = false;
         return;
    }
    const confirmationDiv = currentForm.parentNode.querySelector('#confirmation');
    const statusDiv = currentForm.parentNode.querySelector('.form-status-sending');
    const submitButton = currentForm.querySelector('button[type="submit"]');

    currentForm.style.display = "none";
    if (statusDiv) statusDiv.style.display = 'none';
    if (confirmationDiv) confirmationDiv.style.display = "block";

    setTimeout(() => {
        if(currentForm) currentForm.reset();
        if(currentForm) currentForm.style.display = "block";
        if(confirmationDiv) confirmationDiv.style.display = "none";
        if(submitButton) submitButton.disabled = false;
        isFormSubmitting = false; // Réinitialiser pour prochaine soumission
    }, 3000);
}

// --- CHARGEMENT ET AFFICHAGE DES ACTUALITÉS ---

/**
 * Charge et affiche les actualités depuis le CSV.
 */
function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    fetch(newsCsvUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Erreur réseau News ${response.status}`);
            return response.text();
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true, skipEmptyLines: 'greedy',
                complete: results => displayNews(results.data),
                error: err => {
                     console.error('Erreur parsing News:', err);
                     if(container) container.innerHTML = `<p class="error-message">Erreur lecture actualités.</p>`;
                }
            });
        })
        .catch(error => {
            console.error('Erreur fetch News:', error);
            if(container) container.innerHTML = `<p class="error-message">Impossible charger actualités. ${error.message}</p>`;
        });
}

/**
 * Affiche les actualités dans le DOM.
 * @param {Array<Object>} newsData Données parsées.
 */
function displayNews(newsData) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = ''; // Vider

    const validNews = (newsData || [])
        .filter(item => item && Object.values(item).some(val => val && String(val).trim() !== ''))
        .sort((a, b) => {
            const dateA = parseDate(a.Date || a.date);
            const dateB = parseDate(b.Date || b.date);
            if (!dateB && !dateA) return 0;
            if (!dateB) return -1;
            if (!dateA) return 1;
            return dateB.getTime() - dateA.getTime();
        });

    if (validNews.length === 0) {
        container.innerHTML = '<p>Aucune actualité pour le moment.</p>';
        return;
    }

    validNews.forEach(item => {
        const title = item.Titre || item.titre || 'Actualité';
        const date = item.Date || item.date || '';
        const description = item.Description || item.description || '';
        const imageUrl = item.Lien_image || item['Lien image'] || item.Image || item.image || '';

        const newsItem = document.createElement('div');
        newsItem.className = 'actu';
        let imageHtml = '';
        if (imageUrl) {
            imageHtml = `<img src="${imageUrl}" alt="${title}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" loading="lazy"><p class="error-message image-error" style="display:none;">Erreur image</p>`;
        }
        newsItem.innerHTML = `<h3>${title}</h3>${date ? `<p><strong>Date:</strong> ${date}</p>` : ''}<p>${description}</p>${imageHtml}`;
        container.appendChild(newsItem);
    });
}

// --- CHARGEMENT ET AFFICHAGE DES PARTENAIRES ---

/**
 * Charge et affiche les partenaires depuis le CSV.
 */
function loadPartners() {
    const container = document.getElementById('partners-container');
    if (!container) return;

    fetch(partnersCsvUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Erreur réseau Partenaires ${response.status}`);
            return response.text();
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true, skipEmptyLines: 'greedy',
                complete: results => {
                    // console.log("Partenaires CSV:", results.data); // Debug
                    if (container) container.classList.remove('partners-loading');
                    const validPartners = (results.data || [])
                        .filter(item => item && item.Nom && String(item.Nom).trim() !== ''); // Exiger au moins un nom
                    if (validPartners.length > 0) {
                        const grouped = groupPartnersByCategory(validPartners);
                        displayPartners(grouped);
                    } else {
                         if(container) container.innerHTML = '<p>Aucun partenaire trouvé.</p>';
                    }
                },
                 error: err => {
                     console.error('Erreur parsing Partenaires:', err);
                     if(container) container.innerHTML = `<p class="error-message">Erreur lecture partenaires.</p>`;
                 }
            });
        })
        .catch(error => {
            console.error('Erreur fetch Partenaires:', error);
             if(container) {
                container.classList.remove('partners-loading');
                container.innerHTML = `<p class="error-message">Impossible charger partenaires. ${error.message}</p>`;
             }
        });
}

/**
 * Groupe les partenaires par catégorie.
 * @param {Array<Object>} partners Données brutes.
 * @returns {Object} Partenaires groupés { Categorie: [partenaire1, ...] }.
 */
function groupPartnersByCategory(partners) {
    const grouped = {};
    const defaultCategory = "Autres";

    partners.forEach(partner => {
        const category = (partner.Categorie || partner.categorie || '').trim() || defaultCategory;
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(partner);
    });

    // Tri des catégories (Autres à la fin) et partenaires par nom dans chaque catégorie
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        if (a === defaultCategory) return 1;
        if (b === defaultCategory) return -1;
        return a.localeCompare(b, 'fr', { sensitivity: 'base' });
    });

    const sortedGrouped = {};
    sortedCategories.forEach(cat => {
        sortedGrouped[cat] = grouped[cat].sort((a, b) =>
            (a.Nom || '').localeCompare(b.Nom || '', 'fr', { sensitivity: 'base' })
        );
    });
    return sortedGrouped;
}

/**
 * Affiche les partenaires groupés dans le DOM.
 * @param {Object} groupedPartners Partenaires groupés.
 */
function displayPartners(groupedPartners) {
    const container = document.getElementById('partners-container');
    if (!container) return;
    container.innerHTML = ''; // Vider

    if (Object.keys(groupedPartners).length === 0) {
        container.innerHTML = '<p>Aucun partenaire à afficher.</p>';
        return;
    }

    for (const category in groupedPartners) {
        if (groupedPartners.hasOwnProperty(category)) {
            const partnersInCategory = groupedPartners[category];

            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'partner-category-title';
            categoryTitle.textContent = category;
            container.appendChild(categoryTitle);

            const categoryGrid = document.createElement('div');
            categoryGrid.className = 'partner-category-grid';
            container.appendChild(categoryGrid);

            partnersInCategory.forEach(partner => {
                const name = partner.Nom || 'Partenaire';
                const description = partner.Description || '';
                const link = partner.Lien || partner.lien || partner.URL || partner.url || '';
                const logoUrl = partner.Logo || partner.logo || '';

                const partnerCard = document.createElement('div');
                partnerCard.className = 'partner-card';
                let logoHtml = logoUrl
                    ? `<img src="${logoUrl}" alt="Logo ${name}" class="partner-logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><p class="error-message image-error" style="display:none;">Logo?</p>`
                    : `<div class="partner-logo-placeholder"><i class="fas fa-building"></i></div>`; // Utilise FontAwesome ici

                partnerCard.innerHTML = `
                    ${logoHtml}
                    <h4>${name}</h4>
                    ${description ? `<p>${description}</p>` : ''}
                `;

                if (link) {
                    const linkWrapper = document.createElement('a');
                    linkWrapper.href = link;
                    linkWrapper.target = '_blank';
                    linkWrapper.rel = 'noopener noreferrer';
                    linkWrapper.className = 'partner-card-link';
                    linkWrapper.appendChild(partnerCard);
                    categoryGrid.appendChild(linkWrapper);
                } else {
                    categoryGrid.appendChild(partnerCard);
                }
            });
        }
    }
}

// --- UTILITAIRE DATE ---

/**
 * Tente de parser une chaîne en objet Date.
 * @param {string} dateString Chaîne date.
 * @returns {Date|null} Objet Date ou null.
 */
function parseDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;
    dateString = dateString.trim();
    let parts, day, month, year, date;
    // Tente DD/MM/YYYY ou DD.MM.YYYY ou DD-MM-YYYY
    parts = dateString.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
    if (parts) {
        day = parseInt(parts[1], 10); month = parseInt(parts[2], 10) - 1; year = parseInt(parts[3], 10);
        if (year > 1900 && year < 2100 && month >= 0 && month < 12 && day > 0 && day <= 31) {
            date = new Date(Date.UTC(year, month, day));
            if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) return date;
        }
    }
    // Tente YYYY-MM-DD
    parts = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
     if (parts) {
        year = parseInt(parts[1], 10); month = parseInt(parts[2], 10) - 1; day = parseInt(parts[3], 10);
        if (year > 1900 && year < 2100 && month >= 0 && month < 12 && day > 0 && day <= 31) {
           date = new Date(Date.UTC(year, month, day));
           if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) return date;
         }
    }
     // Tente MM/DD/YYYY
     parts = dateString.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
      if (parts) {
         month = parseInt(parts[1], 10) - 1; day = parseInt(parts[2], 10); year = parseInt(parts[3], 10);
         if (year > 1900 && year < 2100 && month >= 0 && month < 12 && day > 0 && day <= 31) {
             date = new Date(Date.UTC(year, month, day));
              if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) return date;
          }
      }
    try { // Dernier recours: parsing navigateur
         const parsedTimestamp = Date.parse(dateString);
         if (!isNaN(parsedTimestamp)) return new Date(parsedTimestamp);
    } catch(e) {}
    return null;
}

// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---

document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM chargé. Initialisation...'); // Débug

    // 1. Appliquer thème
    loadSavedTheme();

    // 2. Fermer menu
    closeMenu();

    // 3. Charger page accueil
    loadPage('actualites', false);

    // 4. Attacher listener hamburger
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    } else {
        console.error("CRITICAL: Bouton hamburger '.hamburger' introuvable.");
    }

    // 5. Attacher listener sélecteur de thème (délégation)
    const sidebarElement = document.getElementById('sidebar');
    if (sidebarElement) {
        sidebarElement.addEventListener('click', (event) => {
            const themeButton = event.target.closest('.theme-switcher-container button.theme-button[data-theme]');
            if (themeButton) {
                 event.preventDefault();
                 applyTheme(themeButton.dataset.theme);
            }
        });
    } else {
        console.error("CRITICAL: Sidebar '#sidebar' introuvable pour listener thèmes.");
    }
});

// ==================================================
//              FIN DU SCRIPT
// ==================================================
