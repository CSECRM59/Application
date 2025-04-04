// ==================================================
//              SCRIPT COMPLET POUR AppliCSE
//        (Multi-Thèmes, News, Partenaires, Formulaires Café/Contact, Calendrier)
// ==================================================

/*
 * Prérequis pour ce script :
 * 1. Bibliothèque PapaParse incluse dans le HTML.
 * 2. Bibliothèque d'icônes (ex: Font Awesome) incluse si utilisée.
 * 3. REMPLACER LES PLACEHOLDERS ci-dessous :
 *    - `eventsCsvUrl` : URL CSV de votre Google Sheet Calendrier.
 *    - Dans `loadPage` -> `case 'formulaire-contact'`: URL et TOUS les `entry.XXXX` de votre Google Form Contact.
 *    - Vérifier `newsCsvUrl` et `partnersCsvUrl` si différentes.
 *    - Vérifier les noms de colonnes CSV (ex: 'DateDebut', 'DateFin', 'Titre', etc.) utilisés dans les fonctions JS.
*/

// --- CONSTANTES ET VARIABLES GLOBALES ---

const newsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=0&single=true&output=csv';
const partnersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1082465411&single=true&output=csv';
const eventsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=377066785&single=true&output=csv';

let isFormSubmitting = false; // Drapeau pour formulaires iframe
const THEME_STORAGE_KEY = 'cse-app-selected-theme';
const DEFAULT_THEME = 'theme-default';
const KNOWN_THEMES = ['theme-default', 'theme-dark', 'theme-eau', 'theme-desert', 'theme-foret'];

// --- GESTION DES THÈMES ---

function applyTheme(themeName) {
    const validThemeName = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME;
    document.body.classList.remove(...KNOWN_THEMES); document.body.classList.add(validThemeName);
    try { localStorage.setItem(THEME_STORAGE_KEY, validThemeName); } catch (e) { console.warn("LocalStorage indisponible:", e); }
    updateThemeButtonStates(validThemeName);
}
function loadSavedTheme() {
    let savedTheme = DEFAULT_THEME; try { savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME; } catch (e) { /* Ignorer */ }
    if (!KNOWN_THEMES.includes(savedTheme)) savedTheme = DEFAULT_THEME; applyTheme(savedTheme);
}
function updateThemeButtonStates(activeTheme) {
    const themeButtons = document.querySelectorAll('.theme-switcher-container button.theme-button[data-theme]');
    themeButtons.forEach(button => { button.classList.toggle('active-theme', button.dataset.theme === activeTheme); });
}

// --- GESTION DU MENU SIDEBAR ---

function closeMenu() { const s = document.getElementById('sidebar'), h = document.querySelector('.hamburger'); if (s) s.classList.remove('active'); if (h) h.classList.remove('active'); }
function toggleMenu() { const s = document.getElementById('sidebar'), h = document.querySelector('.hamburger'); if (s && h) { s.classList.toggle('active'); h.classList.toggle('active'); } else { console.error("Menu introuvable."); } }

// --- CHARGEMENT DU CONTENU DES PAGES ---

function loadPage(pageId, fromMenuClick = false) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) { console.error("CRITICAL: #main-content introuvable."); return; }
    if (fromMenuClick) closeMenu();
    isFormSubmitting = false; mainContent.innerHTML = '<p class="loading-message">Chargement...</p>';
    let pageHTML = '', deferredAction = null;

    switch (pageId) {
        case 'actualites':
            pageHTML = `<section id="actualites"><h2>Dernières Actualités</h2><div id="news-container"></div></section>`;
            deferredAction = loadNews; break;
        case 'calendrier': // <<<=== AJOUT DU CASE CALENDRIER
             pageHTML = `<section id="calendrier"><h2>Calendrier des Événements</h2><div id="events-container"></div></section>`;
             deferredAction = loadEvents; break;
        case 'formulaire-cafe':
             pageHTML = `<section id="formulaire-cafe"><div class="form-container"><h2>Signalement Machine à Café</h2><form id="reportForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw2H0lzEAvt7niVxRhpkPQTLOaOfXz3SoI3IC9NfNxnY33Ag/formResponse" method="POST" target="hidden_iframe"><!-- ... champs café ... --><button type="submit">Envoyer</button></form><div class="form-status-sending" style="display: none;">Envoi...</div><div id="confirmation" class="confirmation" style="display: none;">Merci !</div><iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe></div></section>`;
             deferredAction = () => attachFormEvents('reportForm'); break;
        case 'formulaire-contact':
             // !! REMPLACER PLACEHOLDERS !!
             pageHTML = `<section id="formulaire-contact"><div class="form-container"><h2>Contacter le CSE</h2><form id="contactForm" action="VOTRE_URL_GOOGLE_FORM_CONTACT/formResponse" method="POST" target="hidden_iframe"><!-- ... champs contact ... --><button type="submit">Envoyer</button></form><div class="form-status-sending" style="display: none;">Envoi...</div><div id="confirmation" class="confirmation" style="display: none;">Merci !</div><iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe></div></section>`;
             deferredAction = () => attachFormEvents('contactForm'); break;
        case 'partenaires':
            pageHTML = `<section id="partenaires"><h2>Nos Partenaires</h2><div id="partners-container"></div></section>`;
            deferredAction = loadPartners; break;
        default:
            pageHTML = '<p class="error-message">Page non trouvée.</p>'; console.warn(`Page inconnue: '${pageId}'.`);
    }
    mainContent.innerHTML = pageHTML;
    if (deferredAction) deferExecution(deferredAction);
}

/** Exécute une fonction après un délai de 0ms. */
function deferExecution(callback) { if (typeof callback === 'function') setTimeout(callback, 0); }

// --- GESTION DES FORMULAIRES (IFRAME UNIQUEMENT) ---

function attachFormEvents(formId) {
    const form = document.getElementById(formId); if (!form) { console.error(`Form iframe introuvable: #${formId}`); return; }
    const sb = form.querySelector('button[type="submit"]'); const st = form.parentNode.querySelector('.form-status-sending'); const cf = form.parentNode.querySelector('#confirmation');
    form.addEventListener("submit", () => { isFormSubmitting = true; if(sb) sb.disabled = true; if(st) st.style.display = 'block'; if(cf) cf.style.display = 'none'; });
}
function onFormSubmit() { // Déclenché par iframe
    if (!isFormSubmitting) return; const form = document.querySelector('#main-content form[target="hidden_iframe"]'); if (!form) { isFormSubmitting = false; return; }
    const cf = form.parentNode.querySelector('#confirmation'); const st = form.parentNode.querySelector('.form-status-sending'); const sb = form.querySelector('button[type="submit"]');
    form.style.display = "none"; if(st) st.style.display = 'none'; if(cf) cf.style.display = "block"; // Laisser affiché
    setTimeout(() => { if(form) form.reset(); if(sb) sb.disabled = false; isFormSubmitting = false; }, 3000);
}

// --- CHARGEMENT ET AFFICHAGE DES ACTUALITÉS ---

function loadNews() {
    const container = document.getElementById('news-container'); if (!container) return; container.innerHTML = '<p class="loading-message">Chargement...</p>';
    fetch(newsCsvUrl).then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.text(); }).then(csv => Papa.parse(csv, { header: true, skipEmptyLines: 'greedy', complete: res => displayNews(res.data), error: e => console.error('PapaParse News:', e) })).catch(err => { console.error('Fetch News:', err); if(container) container.innerHTML = `<p class="error-message">Actu indisponible.</p>`; });
}
function displayNews(newsData) {
    const c = document.getElementById('news-container'); if (!c) return; c.innerHTML = '';
    const valid = (newsData || []).filter(i => i && Object.values(i).some(v => v && String(v).trim())).sort((a, b) => (parseDate(b.Date || b.date)?.getTime() || 0) - (parseDate(a.Date || a.date)?.getTime() || 0));
    if (valid.length === 0) { c.innerHTML = '<p>Aucune actualité.</p>'; return; }
    valid.forEach(i => { const t = i.Titre || i.titre || 'Actu'; const d = i.Date || i.date || ''; const ds = i.Description || i.description || ''; const img = i.Lien_image || i['Lien image'] || i.Image || i.image || ''; const el = document.createElement('div'); el.className = 'actu'; const im = img ? `<img src="${img}" alt="${t}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" loading="lazy"><p class="error-message image-error" style="display:none;">Img?</p>` : ''; el.innerHTML = `<h3>${t}</h3>${d ? `<p><strong>Date:</strong> ${d}</p>` : ''}<p>${ds}</p>${im}`; c.appendChild(el); });
}

// --- CHARGEMENT ET AFFICHAGE DES PARTENAIRES ---

function loadPartners() {
    const c = document.getElementById('partners-container'); if (!c) return; c.innerHTML = '<p class="loading-message">Chargement...</p>';
    fetch(partnersCsvUrl).then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.text(); }).then(csv => Papa.parse(csv, { header: true, skipEmptyLines: 'greedy', complete: res => { if(c) c.classList.remove('partners-loading'); const v = (res.data || []).filter(i => i && i.Nom && String(i.Nom).trim()); if(v.length > 0) displayPartners(groupPartnersByCategory(v)); else if(c) c.innerHTML = '<p>Aucun partenaire.</p>'; }, error: e => console.error('PapaParse Partenaires:', e) })).catch(err => { console.error('Fetch Partenaires:', err); if(c) { c.classList.remove('partners-loading'); c.innerHTML = `<p class="error-message">Partenaires indisponibles.</p>`; }});
}
function groupPartnersByCategory(partners) { const grp = {}; const def = "Autres"; partners.forEach(p => { const cat = (p.Categorie || p.categorie || '').trim() || def; if (!grp[cat]) grp[cat] = []; grp[cat].push(p); }); const keys = Object.keys(grp).sort((a, b) => (a === def) ? 1 : (b === def) ? -1 : a.localeCompare(b, 'fr', { sensitivity: 'base' })); const sorted = {}; keys.forEach(k => { sorted[k] = grp[k].sort((a, b) => (a.Nom || '').localeCompare(b.Nom || '', 'fr', { sensitivity: 'base' })); }); return sorted; }
function displayPartners(groupedPartners) {
    const c = document.getElementById('partners-container'); if (!c) return; c.innerHTML = ''; if (Object.keys(groupedPartners).length === 0) { c.innerHTML = '<p>Aucun partenaire.</p>'; return; }
    for (const cat in groupedPartners) { if (groupedPartners.hasOwnProperty(cat)) { const ps = groupedPartners[cat]; const t = document.createElement('h3'); t.className = 'partner-category-title'; t.textContent = cat; c.appendChild(t); const g = document.createElement('div'); g.className = 'partner-category-grid'; c.appendChild(g); ps.forEach(p => { const n = p.Nom || ''; const d = p.Description || ''; const l = p.Lien || p.lien || p.URL || p.url || ''; const o = p.Logo || p.logo || ''; const crd = document.createElement('div'); crd.className = 'partner-card'; const lo = o ? `<img src="${o}" alt="${n}" class="partner-logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><p class="error-message image-error" style="display:none;">Logo?</p>` : `<div class="partner-logo-placeholder"><i class="fas fa-building"></i></div>`; crd.innerHTML = `${lo}<h4>${n}</h4>${d ? `<p>${d}</p>` : ''}`; if (l) { const a = document.createElement('a'); a.href = l; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'partner-card-link'; a.appendChild(crd); g.appendChild(a); } else { g.appendChild(crd); } }); }}
}

// --- CHARGEMENT ET AFFICHAGE DU CALENDRIER ---

/** Charge et affiche les événements depuis le CSV. */
function loadEvents() {
    const container = document.getElementById('events-container');
    if (!container) { console.error("Conteneur #events-container introuvable."); return; }
    container.innerHTML = '<p class="loading-message">Chargement du calendrier...</p>';

    fetch(eventsCsvUrl)
        .then(response => { if (!response.ok) throw new Error(`Erreur réseau Calendrier ${response.status}`); return response.text(); })
        .then(csvText => Papa.parse(csvText, { header: true, skipEmptyLines: 'greedy', complete: results => processAndDisplayEvents(results.data), error: e => { console.error('PapaParse Calendrier:', e); if(container) container.innerHTML = '<p class="error-message">Erreur lecture calendrier.</p>';} }))
        .catch(error => { console.error('Fetch Calendrier:', error); if(container) container.innerHTML = `<p class="error-message">Chargement calendrier impossible. ${error.message}</p>`; });
}

/** Traite (parse, filtre, tri) et affiche les événements. */
function processAndDisplayEvents(rawEventsData) {
    const container = document.getElementById('events-container'); if (!container) return;
    const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const validAndUpcomingEvents = (rawEventsData || [])
        .map(event => {
            // !! Adapter les noms de colonnes si besoin !!
            const startDateStr = event.DateDebut || event.Date; // Prend DateDebut en priorité
            const endDateStr = event.DateFin;
            const title = event.Titre;

            const parsedStartDate = parseDate(startDateStr);
            let parsedEndDate = parseDate(endDateStr);

            if (parsedEndDate && parsedStartDate && parsedEndDate < parsedStartDate) parsedEndDate = null; // Corriger date fin invalide
            if (!parsedStartDate || !title) return null; // Date début et titre requis
            return { ...event, parsedStartDate, parsedEndDate };
        })
        .filter(event => event !== null)
        .filter(event => (event.parsedEndDate || event.parsedStartDate) >= today) // Garder si FIN >= aujourd'hui
        .sort((a, b) => a.parsedStartDate.getTime() - b.parsedStartDate.getTime()); // Trier par DEBUT

    displayEvents(validAndUpcomingEvents);
}

/** Affiche la liste des événements triés dans le DOM. */
function displayEvents(events) {
    const container = document.getElementById('events-container'); if (!container) return; container.innerHTML = '';
    if (events.length === 0) { container.innerHTML = '<p>Aucun événement à venir programmé.</p>'; return; }

    const dateOptionsShort = { year: 'numeric', month: 'numeric', day: 'numeric' };
    const dateOptionsLong = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    events.forEach(event => {
        const item = document.createElement('div'); item.className = 'event-item';
        let dateStr = '';
        const startFmt = event.parsedStartDate.toLocaleDateString('fr-FR', dateOptionsLong);
        if (event.parsedEndDate && event.parsedEndDate.getTime() !== event.parsedStartDate.getTime()) {
            const endFmt = event.parsedEndDate.toLocaleDateString('fr-FR', dateOptionsShort);
            const startShort = event.parsedStartDate.toLocaleDateString('fr-FR', dateOptionsShort);
            dateStr = `Du ${startShort} au ${endFmt}`; // Format plage
        } else { dateStr = startFmt; } // Format jour unique

        let timeStr = ''; const time = event.Heure || event.heure;
        if (time) { const tParts = String(time).match(/^(\d{1,2}):(\d{2})$/); timeStr = tParts ? ` à ${tParts[1]}h${tParts[2]}` : (String(time).includes(':') ? ` - ${time}`: ''); }

        const title = event.Titre || 'Événement'; const desc = event.Description || ''; const loc = event.Lieu || '';
        item.innerHTML = `<div class="event-date">${dateStr}${timeStr}</div><div class="event-details"><h4>${title}</h4>${loc ? `<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${loc}</p>` : ''}${desc ? `<p>${desc}</p>` : ''}</div>`;
        container.appendChild(item);
    });
}

// --- UTILITAIRE DATE ---

/** Tente de parser une chaîne en objet Date. */
function parseDate(dS) { if (!dS || typeof dS !== 'string') return null; dS = dS.trim(); let p, d, m, y, dt; p = dS.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/); if (p) { d = parseInt(p[1], 10); m = parseInt(p[2], 10) - 1; y = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } p = dS.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (p) { y = parseInt(p[1], 10); m = parseInt(p[2], 10) - 1; d = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } p = dS.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/); if (p) { m = parseInt(p[1], 10) - 1; d = parseInt(p[2], 10); y = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } try { const ts = Date.parse(dS); if (!isNaN(ts)) return new Date(ts); } catch(e) {} return null; }

// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---

document.addEventListener('DOMContentLoaded', () => {
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

    // PAS d'enregistrement de Service Worker ni de bouton Install dans cette version
});

// ==================================================
//              FIN DU SCRIPT
// ==================================================
