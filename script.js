// ==================================================
//              SCRIPT COMPLET POUR AppliCSE
//        (Multi-Thèmes, News, Partenaires, Formulaires Café/Contact via Iframe)
//         [Version Simplifiée - Sans Carte Cadeau ni Upload Fichier]
// ==================================================

/*
 * Prérequis pour ce script :
 * 1. Bibliothèque PapaParse incluse dans le HTML : <script src="...papaparse.min.js"></script>
 * 2. Bibliothèque d'icônes (ex: Font Awesome) incluse si utilisée dans le CSS/HTML.
 * 3. REMPLACER LES PLACEHOLDERS ci-dessous :
 *    - Dans `loadPage` -> `case 'formulaire-contact'`: URL et TOUS les `entry.XXXX` de votre Google Form Contact.
 *    - Vérifier `newsCsvUrl` et `partnersCsvUrl` si vos URLs publiées sont différentes.
 *    - Vérifier les noms de colonnes CSV dans les fonctions displayNews/displayPartners si différents.
*/

// --- CONSTANTES ET VARIABLES GLOBALES ---

// URLs des Google Sheets publiés au format CSV
const newsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=0&single=true&output=csv'; // Feuille Actualités
const partnersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1082465411&single=true&output=csv'; // Feuille Partenaires

// Drapeau pour l'état de soumission des formulaires IFRAME (Café/Contact)
let isFormSubmitting = false;

// Constantes pour la gestion des thèmes
const THEME_STORAGE_KEY = 'cse-app-selected-theme';
const DEFAULT_THEME = 'theme-default';
const KNOWN_THEMES = ['theme-default', 'theme-dark', 'theme-fun']; // Doit correspondre aux classes CSS

// --- GESTION DES THÈMES ---

/**
 * Applique un thème en modifiant la classe du body et sauvegarde le choix.
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
    } catch (e) { /* Ignorer erreur localStorage, garder défaut */ }
    if (!KNOWN_THEMES.includes(savedTheme)) savedTheme = DEFAULT_THEME;
    applyTheme(savedTheme);
}

/**
 * Met à jour l'état visuel des boutons du sélecteur de thème.
 * @param {string} activeTheme - Nom du thème actuellement actif.
 */
function updateThemeButtonStates(activeTheme) {
    const themeButtons = document.querySelectorAll('.theme-switcher-container button.theme-button[data-theme]');
    themeButtons.forEach(button => {
        button.classList.toggle('active-theme', button.dataset.theme === activeTheme);
    });
}

// --- GESTION DU MENU SIDEBAR ---

/** Ferme le menu latéral. */
function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar) sidebar.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
}

/** Ouvre/Ferme le menu latéral. */
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar && hamburger) {
        sidebar.classList.toggle('active');
        hamburger.classList.toggle('active');
    } else { console.error("Élément du menu introuvable (sidebar ou hamburger)."); }
}

// --- CHARGEMENT DU CONTENU DES PAGES ---

/**
 * Charge le contenu HTML d'une section et lance les fonctions JS associées.
 * @param {string} pageId - Identifiant de la page (ex: 'actualites').
 * @param {boolean} [fromMenuClick=false] - Si appelé depuis le menu.
 */
function loadPage(pageId, fromMenuClick = false) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) { console.error("CRITICAL: #main-content introuvable."); return; }
    if (fromMenuClick) closeMenu();
    isFormSubmitting = false; // Réinitialiser état formulaire iframe
    mainContent.innerHTML = '<p class="loading-message">Chargement...</p>'; // Message chargement générique

    let pageHTML = '';
    let deferredAction = null; // Fonction à exécuter après injection HTML

    switch (pageId) {
        case 'actualites':
            pageHTML = `<section id="actualites"><h2>Dernières Actualités</h2><div id="news-container"></div></section>`;
            deferredAction = loadNews;
            break;

        case 'formulaire-cafe': // Formulaire simple (iframe)
             pageHTML = `
                <section id="formulaire-cafe"><div class="form-container"><h2>Signalement Machine à Café</h2>
                <form id="reportForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw2H0lzEAvt7niVxRhpkPQTLOaOfXz3SoI3IC9NfNxnY33Ag/formResponse" method="POST" target="hidden_iframe">
                    <div class="form-group"><label for="email" class="required">Email</label><input type="email" id="email" name="entry.1494559432" required></div>
                    <div class="form-group"><label for="name" class="required">Nom & Prénom</label><input type="text" id="name" name="entry.36162321" required></div>
                    <div class="form-group"><label for="operation" class="required">Opération</label><input type="text" id="operation" name="entry.1034050778" required></div>
                    <div class="form-group"><label for="machine" class="required">Machine concernée</label><select id="machine" name="entry.212638394" required><option value="">Sélectionnez...</option><option value="DEV125543 (E-1)">DEV125543 (E-1)</option><option value="BBRD0152 (E-1)">BBRD0152 (E-1)</option><option value="DEV16567 (E-1)">DEV16567 (E-1)</option><option value="BBRDL0196 (E-1)">BBRDL0196 (E-1)</option><option value="DBIC799 (E0)">DBIC799 (E0)</option><option value="B72ES1979 (E1)">B72ES1979 (E1)</option><option value="B72ES1903 (E2)">B72ES1903 (E2)</option><option value="DEV95042 (E2)">DEV95042 (E2)</option><option value="B72ES1977 (E3)">B72ES1977 (E3)</option></select></div>
                    <div class="form-group"><label for="problem" class="required">Type de problème</label><select id="problem" name="entry.1333521310" required><option value="">Sélectionnez...</option><option value="Pas de gobelet">Pas de gobelet</option><option value="Gobelet vide">Gobelet vide</option><option value="Produit non conforme">Produit non conforme</option><option value="Problème de rechargement">Problème de rechargement</option></select></div>
                    <div class="form-group"><p class="note">Si problème de rechargement, précisez :</p><label for="date">Date</label><input type="date" id="date" name="entry.789458747"><label for="time">Heure</label><input type="time" id="time" name="entry.1519520523"><label for="payment">Moyen de paiement</label><select id="payment" name="entry.1578764886"><option value="">Sélectionnez...</option><option value="CB">CB</option><option value="Pluxee">Pluxee</option><option value="Espece">Espèce</option><option value="Badge">Badge</option></select></div>
                    <div class="form-group"><label for="comment">Commentaire</label><textarea id="comment" name="entry.1120842974"></textarea></div>
                    <button type="submit">Envoyer Signalement</button>
                </form>
                <div class="form-status-sending" style="display: none;">Envoi en cours...</div>
                <div id="confirmation" class="confirmation" style="display: none;">Merci, signalement enregistré !</div>
                <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                </div></section>`;
             deferredAction = () => attachFormEvents('reportForm'); // Utilise l'ancienne méthode iframe
             break;

        case 'formulaire-contact': // Formulaire contact (iframe)
             // =======================================================================
             // !!! REMPLACER URL_FORMULAIRE ET LES entry.XXXX PAR VOS VALEURS RÉELLES !!!
             // =======================================================================
             pageHTML = `
                <section id="formulaire-contact"><div class="form-container"><h2>Contacter le CSE</h2>
                <form id="contactForm" action="VOTRE_URL_GOOGLE_FORM_CONTACT/formResponse" method="POST" target="hidden_iframe">

                    <div class="form-group">
                        <label for="contact_nomPrenom" class="required">Nom & Prénom</label>
                        <input type="text" id="contact_nomPrenom" name="ENTRY_ID_NOM_PRENOM" required placeholder="Ex: Jean Dupont">
                    </div>

                    <div class="form-group">
                        <label for="contact_email" class="required">Mail</label>
                        <input type="email" id="contact_email" name="ENTRY_ID_EMAIL" required placeholder="Ex: jean.dupont@entreprise.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="contact_operation" class="required">Opération</label>
                        <select id="contact_operation" name="ENTRY_ID_OPERATION" required>
                            <option value="" disabled selected>-- Sélectionnez une opération --</option>
                            <option value="Direction / Service généraux / IT">Direction / Service généraux / IT</option>
                            <option value="AG2R">AG2R</option>
                            <option value="UCPA">UCPA</option>
                            <option value="CNAV">CNAV</option>
                            <option value="IRP Auto">IRP Auto</option>
                            <option value="Abeille">Abeille</option>
                            <option value="EHS">EHS</option>
                            <option value="DCP">EHS</option>
                            <option value="Enedis">EHS</option>

                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="required">Nature de la Demande (cochez ce qui s'applique)</label>
                        <div class="checkbox-group">
                                // IMPORTANT: Chaque checkbox ci-dessous doit avoir :
                              //  1) Le MEME attribut name="ENTRY_ID_DEMANDE"
                                //  2) Un attribut value="..." EXACTEMENT identique au texte de l'option dans Google Forms */}
                            <label class="checkbox-label"><input type="checkbox" name="ENTRY_ID_DEMANDE" value="Clé"> Clé café</label>
                            <label class="checkbox-label"><input type="checkbox" name="ENTRY_ID_DEMANDE" value="CarteCE"> Carte AccésCE</label>
                            <label class="checkbox-label"><input type="checkbox" name="ENTRY_ID_DEMANDE" value="Carte naissance"> Carte cadeau naissance</label>
                            <label class="checkbox-label"><input type="checkbox" name="ENTRY_ID_DEMANDE" value="Carte mariage"> Carte mariage / pacs</label>
                            <label class="checkbox-label"><input type="checkbox" name="ENTRY_ID_DEMANDE" value="Carte retraite"> Carte cadeau retraite</label>
                            <label class="checkbox-label"><input type="checkbox" name="ENTRY_ID_DEMANDE" value="Autre"> Autre...</label>
                            
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="contact_message">Votre Message (optionnel)</label>
                        <textarea id="contact_message" name="ENTRY_ID_MESSAGE" rows="5" placeholder="Décrivez votre demande ici..."></textarea>
                    </div>
                    
                    <button type="submit">Envoyer le Message</button>
                </form>
                <div class="form-status-sending" style="display: none;">Envoi en cours...</div>
                <div id="confirmation" class="confirmation" style="display: none;">Merci, message envoyé ! Nous vous répondrons bientôt.</div>
                <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                </div></section>`;
             deferredAction = () => attachFormEvents('contactForm'); // Utilise toujours la méthode iframe
             break;

        case 'partenaires':
            pageHTML = `<section id="partenaires"><h2>Nos Partenaires</h2><div id="partners-container"></div></section>`;
            deferredAction = loadPartners;
            break;

        default:
            pageHTML = '<p class="error-message">Page non trouvée.</p>';
            console.warn(`Page inconnue: '${pageId}'.`);
    }

    mainContent.innerHTML = pageHTML; // Injecter le HTML
    if (deferredAction) {
        deferExecution(deferredAction); // Exécuter l'action JS associée
    }
}

/** Exécute une fonction après un délai de 0ms. */
function deferExecution(callback) { if (typeof callback === 'function') setTimeout(callback, 0); }

// --- GESTION DES FORMULAIRES (IFRAME UNIQUEMENT) ---

/** Attache listeners pour formulaires simples (iframe). */
function attachFormEvents(formId) {
    const form = document.getElementById(formId);
    if (!form) { console.error(`Formulaire iframe introuvable: #${formId}`); return; }
    const submitButton = form.querySelector('button[type="submit"]');
    const statusDiv = form.parentNode.querySelector('.form-status-sending');
    const confirmationDiv = form.parentNode.querySelector('#confirmation');

    form.addEventListener("submit", () => {
        // Ce code s'exécute LORSQUE l'utilisateur clique sur "Envoyer"
        isFormSubmitting = true; // Indique qu'une soumission est en cours
        if(submitButton) submitButton.disabled = true; // Désactive bouton
        if(statusDiv) statusDiv.style.display = 'block'; // Affiche "Envoi..."
        if(confirmationDiv) confirmationDiv.style.display = 'none'; // Cache ancien message
        // La soumission vers l'iframe se fait automatiquement (pas de preventDefault)
    });
}

/** Gère réponse iframe après soumission (pour formulaires simples). */
function onFormSubmit() { // Déclenché par l'iframe APRÈS que Google Forms ait répondu
    if (!isFormSubmitting) return; // Ne rien faire si pas une vraie soumission

    // Trouver le formulaire qui a été soumis (celui utilisant l'iframe)
    const currentForm = document.querySelector('#main-content form[target="hidden_iframe"]');
    if (!currentForm) { isFormSubmitting = false; return; } // Sécurité

    const confirmationDiv = currentForm.parentNode.querySelector('#confirmation');
    const statusDiv = currentForm.parentNode.querySelector('.form-status-sending');
    const submitButton = currentForm.querySelector('button[type="submit"]');

    currentForm.style.display = "none"; // Cacher le formulaire
    if (statusDiv) statusDiv.style.display = 'none'; // Cacher "Envoi..."
    if (confirmationDiv) confirmationDiv.style.display = "block"; // Afficher confirmation

    // Réinitialiser après 3 secondes
    setTimeout(() => {
        if(currentForm) currentForm.reset();             // Vider champs
        if(currentForm) currentForm.style.display = "block"; // Réafficher formulaire
        if(confirmationDiv) confirmationDiv.style.display = "none"; // Cacher confirmation
        if(submitButton) submitButton.disabled = false;     // Réactiver bouton
        isFormSubmitting = false; // Permettre une nouvelle soumission
    }, 3000);
}

// --- CHARGEMENT ET AFFICHAGE DES ACTUALITÉS ---

/** Charge et affiche les news depuis CSV. */
function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '<p class="loading-message">Chargement...</p>';

    fetch(newsCsvUrl)
        .then(response => { if (!response.ok) throw new Error(`Erreur réseau News ${response.status}`); return response.text(); })
        .then(csvText => Papa.parse(csvText, { header: true, skipEmptyLines: 'greedy', complete: r => displayNews(r.data), error: e => { console.error('PapaParse News:', e); if(container) container.innerHTML = '<p class="error-message">Erreur lecture actu.</p>';} }))
        .catch(error => { console.error('Fetch News:', error); if(container) container.innerHTML = `<p class="error-message">Chargement actu impossible. ${error.message}</p>`; });
}

/** Affiche les news dans le DOM. */
function displayNews(newsData) {
    const container = document.getElementById('news-container');
    if (!container) return; container.innerHTML = '';
    const validNews = (newsData || [])
        .filter(item => item && Object.values(item).some(v => v && String(v).trim()))
        .sort((a, b) => (parseDate(b.Date || b.date)?.getTime() || 0) - (parseDate(a.Date || a.date)?.getTime() || 0));

    if (validNews.length === 0) { container.innerHTML = '<p>Aucune actualité pour le moment.</p>'; return; }

    validNews.forEach(item => {
        const title = item.Titre || item.titre || 'Actualité';
        const date = item.Date || item.date || '';
        const desc = item.Description || item.description || '';
        const imgUrl = item.Lien_image || item['Lien image'] || item.Image || item.image || '';
        const el = document.createElement('div'); el.className = 'actu';
        const img = imgUrl ? `<img src="${imgUrl}" alt="${title}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" loading="lazy"><p class="error-message image-error" style="display:none;">Img?</p>` : '';
        el.innerHTML = `<h3>${title}</h3>${date ? `<p><strong>Date:</strong> ${date}</p>` : ''}<p>${desc}</p>${img}`;
        container.appendChild(el);
    });
}

// --- CHARGEMENT ET AFFICHAGE DES PARTENAIRES ---

/** Charge et affiche les partenaires depuis CSV. */
function loadPartners() {
    const container = document.getElementById('partners-container');
    if (!container) return;
    container.innerHTML = '<p class="loading-message">Chargement...</p>';

    fetch(partnersCsvUrl)
        .then(response => { if (!response.ok) throw new Error(`Erreur réseau ${response.status}`); return response.text(); })
        .then(csvText => Papa.parse(csvText, { header: true, skipEmptyLines: 'greedy', complete: r => {
            if(container) container.classList.remove('partners-loading');
            const valid = (r.data || []).filter(i => i && i.Nom && String(i.Nom).trim());
            if(valid.length > 0) displayPartners(groupPartnersByCategory(valid));
            else if(container) container.innerHTML = '<p>Aucun partenaire.</p>';
        }, error: e => { console.error('PapaParse Partenaires:', e); if(container) container.innerHTML = '<p class="error-message">Erreur lecture partenaires.</p>'; } }))
        .catch(error => { console.error('Fetch Partenaires:', error); if(container) { container.classList.remove('partners-loading'); container.innerHTML = `<p class="error-message">Chargement partenaires impossible. ${error.message}</p>`; }});
}

/** Groupe les partenaires par catégorie. */
function groupPartnersByCategory(partners) {
    const grouped = {}; const defaultCat = "Autres";
    partners.forEach(p => { const cat = (p.Categorie || p.categorie || '').trim() || defaultCat; if (!grouped[cat]) grouped[cat] = []; grouped[cat].push(p); });
    const sortedCats = Object.keys(grouped).sort((a, b) => (a === defaultCat) ? 1 : (b === defaultCat) ? -1 : a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    const sortedGrouped = {};
    sortedCats.forEach(cat => { sortedGrouped[cat] = grouped[cat].sort((a, b) => (a.Nom || '').localeCompare(b.Nom || '', 'fr', { sensitivity: 'base' })); });
    return sortedGrouped;
}

/** Affiche les partenaires groupés dans le DOM. */
function displayPartners(groupedPartners) {
    const container = document.getElementById('partners-container');
    if (!container) return; container.innerHTML = '';
    if (Object.keys(groupedPartners).length === 0) { container.innerHTML = '<p>Aucun partenaire.</p>'; return; }

    for (const category in groupedPartners) {
        if (groupedPartners.hasOwnProperty(category)) {
            const partners = groupedPartners[category];
            const catTitle = document.createElement('h3'); catTitle.className = 'partner-category-title'; catTitle.textContent = category; container.appendChild(catTitle);
            const catGrid = document.createElement('div'); catGrid.className = 'partner-category-grid'; container.appendChild(catGrid);
            partners.forEach(p => {
                const name = p.Nom || ''; const desc = p.Description || ''; const link = p.Lien || p.lien || p.URL || p.url || ''; const logo = p.Logo || p.logo || '';
                const card = document.createElement('div'); card.className = 'partner-card';
                const logoHTML = logo ? `<img src="${logo}" alt="${name}" class="partner-logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><p class="error-message image-error" style="display:none;">Logo?</p>` : `<div class="partner-logo-placeholder"><i class="fas fa-building"></i></div>`;
                card.innerHTML = `${logoHTML}<h4>${name}</h4>${desc ? `<p>${desc}</p>` : ''}`;
                if (link) { const a = document.createElement('a'); a.href = link; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'partner-card-link'; a.appendChild(card); catGrid.appendChild(a); }
                else { catGrid.appendChild(card); }
            });
        }
    }
}

// --- UTILITAIRE DATE ---

/** Tente de parser une chaîne en objet Date. */
function parseDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;
    dateString = dateString.trim(); let parts, d, m, y, date;
    parts = dateString.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
    if (parts) { d = parseInt(parts[1], 10); m = parseInt(parts[2], 10) - 1; y = parseInt(parts[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { date = new Date(Date.UTC(y, m, d)); if (date.getUTCFullYear() === y && date.getUTCMonth() === m && date.getUTCDate() === d) return date; } }
    parts = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (parts) { y = parseInt(parts[1], 10); m = parseInt(parts[2], 10) - 1; d = parseInt(parts[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { date = new Date(Date.UTC(y, m, d)); if (date.getUTCFullYear() === y && date.getUTCMonth() === m && date.getUTCDate() === d) return date; } }
    parts = dateString.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/); // Réessayer pour MM/DD/YYYY
    if (parts) { m = parseInt(parts[1], 10) - 1; d = parseInt(parts[2], 10); y = parseInt(parts[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { date = new Date(Date.UTC(y, m, d)); if (date.getUTCFullYear() === y && date.getUTCMonth() === m && date.getUTCDate() === d) return date; } }
    try { const ts = Date.parse(dateString); if (!isNaN(ts)) return new Date(ts); } catch(e) {}
    return null;
}

// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---

document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM Ready. Initializing App...'); // Debug

    loadSavedTheme(); // Appliquer thème
    closeMenu();      // Fermer menu
    loadPage('actualites', false); // Charger page accueil

    // Listener Menu Hamburger
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    else console.error("CRITICAL: Hamburger not found.");

    // Listener Thèmes (Délégation sur sidebar)
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            // Gérer clic sur bouton de thème
            const themeBtn = e.target.closest('.theme-switcher-container button.theme-button[data-theme]');
            if (themeBtn) { e.preventDefault(); applyTheme(themeBtn.dataset.theme); return; } // Appliquer thème et arrêter

            // Gérer clic sur bouton de navigation (si vous préférez JS aux onclick HTML)
            // const navBtn = e.target.closest('.sidebar ul li button:not(.theme-button)');
            // if (navBtn && navBtn.dataset.page) { // Supposez que vous ajoutiez data-page="actualites" etc. aux boutons
            //    e.preventDefault();
            //    loadPage(navBtn.dataset.page, true);
            // }
        });
    } else { console.error("CRITICAL: Sidebar not found for listeners."); }
});

// ==================================================
//              FIN DU SCRIPT
// ==================================================
