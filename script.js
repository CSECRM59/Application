// ==================================================
//              SCRIPT COMPLET POUR AppliCSE
//        (Multi-Thèmes, News, Partenaires, Formulaires Café/Contact via Iframe, PWA Install Button)
//         [Version Finale - Intégrant toutes les fonctionnalités + PWA Install]
// ==================================================

/*
 * Prérequis pour ce script :
 * 1. Bibliothèque PapaParse incluse dans le HTML : <script src="...papaparse.min.js"></script>
 * 2. Bibliothèque d'icônes (ex: Font Awesome) incluse si utilisée dans le CSS/HTML.
 * 3. Fichier `manifest.json` correctement configuré et lié dans le HTML.
 * 4. Fichier `service-worker.js` présent à la racine et enregistré ci-dessous.
 * 5. Un élément HTML avec id="install-button" (initialement caché) pour le bouton d'installation.
 * 6. REMPLACER LES PLACEHOLDERS ci-dessous :
 *    - Dans `loadPage` -> `case 'formulaire-contact'`: URL et TOUS les `entry.XXXX` de votre Google Form Contact.
 *    - Vérifier `newsCsvUrl` et `partnersCsvUrl` si vos URLs publiées sont différentes.
 *    - Vérifier les noms de colonnes CSV dans les fonctions displayNews/displayPartners si différents.
*/

// --- CONSTANTES ET VARIABLES GLOBALES ---

const newsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=0&single=true&output=csv'; // Feuille Actualités
const partnersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1082465411&single=true&output=csv'; // Feuille Partenaires

let isFormSubmitting = false; // Drapeau pour formulaires iframe
const THEME_STORAGE_KEY = 'cse-app-selected-theme';
const DEFAULT_THEME = 'theme-default';
const KNOWN_THEMES = ['theme-default', 'theme-dark', 'theme-fun'];

// --- GESTION DES THÈMES ---

function applyTheme(themeName) {
    const validThemeName = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME;
    document.body.classList.remove(...KNOWN_THEMES);
    document.body.classList.add(validThemeName);
    try { localStorage.setItem(THEME_STORAGE_KEY, validThemeName); } catch (e) { console.warn("LocalStorage indisponible:", e); }
    updateThemeButtonStates(validThemeName);
}

function loadSavedTheme() {
    let savedTheme = DEFAULT_THEME;
    try { savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME; } catch (e) { /* Ignorer */ }
    if (!KNOWN_THEMES.includes(savedTheme)) savedTheme = DEFAULT_THEME;
    applyTheme(savedTheme);
}

function updateThemeButtonStates(activeTheme) {
    const themeButtons = document.querySelectorAll('.theme-switcher-container button.theme-button[data-theme]');
    themeButtons.forEach(button => { button.classList.toggle('active-theme', button.dataset.theme === activeTheme); });
}

// --- GESTION DU MENU SIDEBAR ---

function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar) sidebar.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar && hamburger) { sidebar.classList.toggle('active'); hamburger.classList.toggle('active'); }
    else { console.error("Menu introuvable."); }
}

// --- CHARGEMENT DU CONTENU DES PAGES ---

function loadPage(pageId, fromMenuClick = false) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) { console.error("CRITICAL: #main-content introuvable."); return; }
    if (fromMenuClick) closeMenu();
    isFormSubmitting = false;
    mainContent.innerHTML = '<p class="loading-message">Chargement...</p>';

    let pageHTML = '';
    let deferredAction = null;

    switch (pageId) {
        case 'actualites':
            pageHTML = `<section id="actualites"><h2>Dernières Actualités</h2><div id="news-container"></div></section>`;
            deferredAction = loadNews;
            break;
        case 'formulaire-cafe':
             pageHTML = `
                <section id="formulaire-cafe"><div class="form-container"><h2>Signalement Machine à Café</h2>
                <form id="reportForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw2H0lzEAvt7niVxRhpkPQTLOaOfXz3SoI3IC9NfNxnY33Ag/formResponse" method="POST" target="hidden_iframe">
                    <div class="form-group"><label for="email" class="required">Email</label><input type="email" id="email" name="entry.1494559432" required></div>
                    <div class="form-group"><label for="name" class="required">Nom & Prénom</label><input type="text" id="name" name="entry.36162321" required></div>
                    <div class="form-group"><label for="operation" class="required">Opération</label><input type="text" id="operation" name="entry.1034050778" required></div>
                    <div class="form-group"><label for="machine" class="required">Machine</label><select id="machine" name="entry.212638394" required><option value="">Sélectionnez...</option><option value="DEV125543 (E-1)">DEV125543 (E-1)</option><option value="BBRD0152 (E-1)">BBRD0152 (E-1)</option><option value="DEV16567 (E-1)">DEV16567 (E-1)</option><option value="BBRDL0196 (E-1)">BBRDL0196 (E-1)</option><option value="DBIC799 (E0)">DBIC799 (E0)</option><option value="B72ES1979 (E1)">B72ES1979 (E1)</option><option value="B72ES1903 (E2)">B72ES1903 (E2)</option><option value="DEV95042 (E2)">DEV95042 (E2)</option><option value="B72ES1977 (E3)">B72ES1977 (E3)</option></select></div>
                    <div class="form-group"><label for="problem" class="required">Problème</label><select id="problem" name="entry.1333521310" required><option value="">Sélectionnez...</option><option value="Pas de gobelet">Pas de gobelet</option><option value="Gobelet vide">Gobelet vide</option><option value="Produit non conforme">Produit non conforme</option><option value="Problème de rechargement">Problème de rechargement</option></select></div>
                    <div class="form-group"><p class="note">Si rechargement:</p><label for="date">Date</label><input type="date" id="date" name="entry.789458747"><label for="time">Heure</label><input type="time" id="time" name="entry.1519520523"><label for="payment">Paiement</label><select id="payment" name="entry.1578764886"><option value="">Sélectionnez...</option><option value="CB">CB</option><option value="Pluxee">Pluxee</option><option value="Espece">Espèce</option><option value="Badge">Badge</option></select></div>
                    <div class="form-group"><label for="comment">Commentaire</label><textarea id="comment" name="entry.1120842974"></textarea></div>
                    <button type="submit">Envoyer</button>
                </form>
                <div class="form-status-sending" style="display: none;">Envoi...</div>
                <div id="confirmation" class="confirmation" style="display: none;">Merci !</div>
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
                <form id="contactForm" action="VOTRE_URL_GOOGLE_FORM_CONTACT/formResponse" method="POST" target="hidden_iframe">
                    <div class="form-group"><label for="contact_nomPrenom" class="required">Nom & Prénom</label><input type="text" id="contact_nomPrenom" name="entry.XXXX_NOM_PRENOM" required></div>
                    <div class="form-group"><label for="contact_email" class="required">Mail</label><input type="email" id="contact_email" name="entry.XXXX_EMAIL" required></div>
                    <div class="form-group"><label for="contact_operation" class="required">Opération</label><select id="contact_operation" name="entry.XXXX_OPERATION" required><option value="" disabled selected>-- Sélectionnez --</option><option value="Direction / Service généraux / IT">Direction / SG / IT</option><option value="AG2R">AG2R</option><option value="UCPA">UCPA</option><option value="CNAV">CNAV</option><option value="IRP Auto">IRP Auto</option><option value="Abeille">Abeille</option><option value="EHS">EHS</option><option value="DCP">DCP</option><option value="Enedis">Enedis</option><option value="Autre...">Autre...</option></select></div>
                    <div class="form-group"><label class="required">Nature Demande</label><div class="checkbox-group">
                        <label class="checkbox-label"><input type="checkbox" name="entry.XXXX_DEMANDE" value="Clé café"> Clé café</label>
                        <label class="checkbox-label"><input type="checkbox" name="entry.XXXX_DEMANDE" value="Carte AccèsCE"> Carte AccèsCE</label>
                        <label class="checkbox-label"><input type="checkbox" name="entry.XXXX_DEMANDE" value="Carte cadeau naissance"> C. naissance</label>
                        <label class="checkbox-label"><input type="checkbox" name="entry.XXXX_DEMANDE" value="Carte cadeau mariage / pacs"> C. mariage/pacs</label>
                        <label class="checkbox-label"><input type="checkbox" name="entry.XXXX_DEMANDE" value="Carte cadeau retraite"> C. retraite</label>
                        <label class="checkbox-label"><input type="checkbox" name="entry.XXXX_DEMANDE" value="Autre"> Autre...</label>
                    </div></div>
                    <div class="form-group"><label for="contact_message">Message</label><textarea id="contact_message" name="entry.XXXX_MESSAGE" rows="5"></textarea></div>
                    <button type="submit">Envoyer</button>
                </form>
                <div class="form-status-sending" style="display: none;">Envoi...</div>
                <div id="confirmation" class="confirmation" style="display: none;">Merci !</div>
                <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
                </div></section>`;
             deferredAction = () => attachFormEvents('contactForm');
             break;
        case 'partenaires':
            pageHTML = `<section id="partenaires"><h2>Nos Partenaires</h2><div id="partners-container"></div></section>`;
            deferredAction = loadPartners;
            break;
        default:
            pageHTML = '<p class="error-message">Page non trouvée.</p>';
            console.warn(`Page inconnue: '${pageId}'.`);
    }
    mainContent.innerHTML = pageHTML;
    if (deferredAction) deferExecution(deferredAction);
}

/** Exécute une fonction après un délai de 0ms. */
function deferExecution(callback) { if (typeof callback === 'function') setTimeout(callback, 0); }

// --- GESTION DES FORMULAIRES (IFRAME UNIQUEMENT) ---

function attachFormEvents(formId) {
    const form = document.getElementById(formId);
    if (!form) { console.error(`Form iframe introuvable: #${formId}`); return; }
    const sb = form.querySelector('button[type="submit"]');
    const st = form.parentNode.querySelector('.form-status-sending');
    const cf = form.parentNode.querySelector('#confirmation');
    form.addEventListener("submit", () => { isFormSubmitting = true; if(sb) sb.disabled = true; if(st) st.style.display = 'block'; if(cf) cf.style.display = 'none'; });
}

function onFormSubmit() { // Déclenché par iframe
    if (!isFormSubmitting) return;
    const form = document.querySelector('#main-content form[target="hidden_iframe"]');
    if (!form) { isFormSubmitting = false; return; }
    const cf = form.parentNode.querySelector('#confirmation');
    const st = form.parentNode.querySelector('.form-status-sending');
    const sb = form.querySelector('button[type="submit"]');
    form.style.display = "none";
    if(st) st.style.display = 'none';
    if(cf) cf.style.display = "block"; // Laisser affiché
    setTimeout(() => { if(form) form.reset(); if(sb) sb.disabled = false; isFormSubmitting = false; }, 3000);
}

// --- CHARGEMENT ET AFFICHAGE DES ACTUALITÉS ---

function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) return; container.innerHTML = '<p class="loading-message">Chargement...</p>';
    fetch(newsCsvUrl)
        .then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.text(); })
        .then(csv => Papa.parse(csv, { header: true, skipEmptyLines: 'greedy', complete: res => displayNews(res.data), error: e => console.error('PapaParse News:', e) }))
        .catch(err => { console.error('Fetch News:', err); if(container) container.innerHTML = `<p class="error-message">Actu indisponible.</p>`; });
}

function displayNews(newsData) {
    const c = document.getElementById('news-container'); if (!c) return; c.innerHTML = '';
    const valid = (newsData || []).filter(i => i && Object.values(i).some(v => v && String(v).trim()))
        .sort((a, b) => (parseDate(b.Date || b.date)?.getTime() || 0) - (parseDate(a.Date || a.date)?.getTime() || 0));
    if (valid.length === 0) { c.innerHTML = '<p>Aucune actualité.</p>'; return; }
    valid.forEach(i => {
        const t = i.Titre || i.titre || 'Actu'; const d = i.Date || i.date || ''; const ds = i.Description || i.description || ''; const img = i.Lien_image || i['Lien image'] || i.Image || i.image || '';
        const el = document.createElement('div'); el.className = 'actu';
        const im = img ? `<img src="${img}" alt="${t}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" loading="lazy"><p class="error-message image-error" style="display:none;">Img?</p>` : '';
        el.innerHTML = `<h3>${t}</h3>${d ? `<p><strong>Date:</strong> ${d}</p>` : ''}<p>${ds}</p>${im}`; c.appendChild(el);
    });
}

// --- CHARGEMENT ET AFFICHAGE DES PARTENAIRES ---

function loadPartners() {
    const c = document.getElementById('partners-container'); if (!c) return; c.innerHTML = '<p class="loading-message">Chargement...</p>';
    fetch(partnersCsvUrl)
        .then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.text(); })
        .then(csv => Papa.parse(csv, { header: true, skipEmptyLines: 'greedy', complete: res => {
            if(c) c.classList.remove('partners-loading');
            const v = (res.data || []).filter(i => i && i.Nom && String(i.Nom).trim());
            if(v.length > 0) displayPartners(groupPartnersByCategory(v)); else if(c) c.innerHTML = '<p>Aucun partenaire.</p>';
        }, error: e => console.error('PapaParse Partenaires:', e) }))
        .catch(err => { console.error('Fetch Partenaires:', err); if(c) { c.classList.remove('partners-loading'); c.innerHTML = `<p class="error-message">Partenaires indisponibles.</p>`; }});
}

function groupPartnersByCategory(partners) {
    const grp = {}; const def = "Autres";
    partners.forEach(p => { const cat = (p.Categorie || p.categorie || '').trim() || def; if (!grp[cat]) grp[cat] = []; grp[cat].push(p); });
    const keys = Object.keys(grp).sort((a, b) => (a === def) ? 1 : (b === def) ? -1 : a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    const sorted = {}; keys.forEach(k => { sorted[k] = grp[k].sort((a, b) => (a.Nom || '').localeCompare(b.Nom || '', 'fr', { sensitivity: 'base' })); });
    return sorted;
}

function displayPartners(groupedPartners) {
    const c = document.getElementById('partners-container'); if (!c) return; c.innerHTML = '';
    if (Object.keys(groupedPartners).length === 0) { c.innerHTML = '<p>Aucun partenaire.</p>'; return; }
    for (const cat in groupedPartners) { if (groupedPartners.hasOwnProperty(cat)) {
        const ps = groupedPartners[cat]; const t = document.createElement('h3'); t.className = 'partner-category-title'; t.textContent = cat; c.appendChild(t);
        const g = document.createElement('div'); g.className = 'partner-category-grid'; c.appendChild(g);
        ps.forEach(p => {
            const n = p.Nom || ''; const d = p.Description || ''; const l = p.Lien || p.lien || p.URL || p.url || ''; const o = p.Logo || p.logo || '';
            const crd = document.createElement('div'); crd.className = 'partner-card';
            const lo = o ? `<img src="${o}" alt="${n}" class="partner-logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><p class="error-message image-error" style="display:none;">Logo?</p>` : `<div class="partner-logo-placeholder"><i class="fas fa-building"></i></div>`;
            crd.innerHTML = `${lo}<h4>${n}</h4>${d ? `<p>${d}</p>` : ''}`;
            if (l) { const a = document.createElement('a'); a.href = l; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'partner-card-link'; a.appendChild(crd); g.appendChild(a); }
            else { g.appendChild(crd); }
        });
    }}
}

// --- UTILITAIRE DATE ---

function parseDate(dS) { if (!dS || typeof dS !== 'string') return null; dS = dS.trim(); let p, d, m, y, dt; p = dS.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/); if (p) { d = parseInt(p[1], 10); m = parseInt(p[2], 10) - 1; y = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } p = dS.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (p) { y = parseInt(p[1], 10); m = parseInt(p[2], 10) - 1; d = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } p = dS.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/); if (p) { m = parseInt(p[1], 10) - 1; d = parseInt(p[2], 10); y = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } try { const ts = Date.parse(dS); if (!isNaN(ts)) return new Date(ts); } catch(e) {} return null; }

// --- GESTION INSTALLATION PWA ---

let deferredInstallPrompt = null; // Stocke l'événement d'installation

// Écouteur pour capturer l'événement avant que le navigateur ne propose l'installation
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // Empêche l'invite auto du navigateur
    deferredInstallPrompt = event; // Stocke l'événement
    const installButton = document.getElementById('install-button');
    if (installButton) installButton.style.display = 'block'; // Affiche notre bouton
    console.log('[PWA] Prêt à installer.');
});

// Attache le listener au bouton d'installation personnalisé (s'il existe au chargement initial)
const installButton = document.getElementById('install-button');
if (installButton) {
    installButton.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
            console.log('[PWA] Pas d\'invite disponible.');
            // Informer l'utilisateur sur comment installer manuellement ?
            return;
        }
        deferredInstallPrompt.prompt(); // Afficher l'invite navigateur
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`[PWA] Installation: ${outcome}`); // 'accepted' or 'dismissed'
        deferredInstallPrompt = null; // L'invite ne peut être utilisée qu'une fois
        installButton.style.display = 'none'; // Cacher le bouton après le choix
    });
}

// Écouteur pour savoir quand l'app est installée
window.addEventListener('appinstalled', () => {
    console.log('[PWA] Application installée !');
    deferredInstallPrompt = null; // Nettoyer
    if (installButton) installButton.style.display = 'none'; // Cacher le bouton si visible
});

// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---

document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM Ready. Initializing...'); // Debug

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
            const themeBtn = e.target.closest('.theme-switcher-container button.theme-button[data-theme]');
            if (themeBtn) { e.preventDefault(); applyTheme(themeBtn.dataset.theme); return; }
        });
    } else { console.error("CRITICAL: Sidebar not found for theme listener."); }

    // Enregistrement du Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js') // Doit être à la racine
            .then(reg => console.log('[PWA] Service Worker enregistré, scope:', reg.scope))
            .catch(err => console.error('[PWA] Erreur enregistrement Service Worker:', err));
    } else {
        console.log('[PWA] Service Worker non supporté.');
    }

     // Re-vérifier le bouton d'installation au cas où il serait ajouté dynamiquement (peu probable ici)
     // et attacher le listener s'il n'était pas trouvé initialement (normalement inutile si dans HTML initial)
     if (!installButton && document.getElementById('install-button')) {
         const btn = document.getElementById('install-button');
         btn.addEventListener('click', async () => { /* ... même logique que le listener plus haut ... */ });
         console.warn("Listener d'installation attaché après DOMContentLoaded.");
     } else if (!installButton && !document.getElementById('install-button')) {
          console.warn("Aucun bouton avec id='install-button' trouvé.");
     }

});

// ==================================================
//              FIN DU SCRIPT
// ==================================================
