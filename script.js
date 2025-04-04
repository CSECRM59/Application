// ==================================================
//              SCRIPT COMPLET POUR AppliCSE
//        (Multi-Thèmes, News, Partenaires, Formulaires Café/Contact, Calendrier)
//         [Version Finale Révisée - Réintégration Fonctions Calendrier]
// ==================================================

/*
 * Prérequis pour ce script :
 * 1. Bibliothèque PapaParse incluse dans le HTML.
 * 2. Bibliothèque d'icônes (ex: Font Awesome) incluse si utilisée.
 * 3. REMPLACER LES PLACEHOLDERS ci-dessous :
 *    - `eventsCsvUrl` : URL CSV de votre Google Sheet Calendrier.
 *    - Dans `loadPage` -> `case 'formulaire-contact'`: URL et TOUS les `entry.XXXX` de votre Google Form Contact.
 *    - Vérifier `newsCsvUrl` et `partnersCsvUrl` si différentes.
 *    - Vérifier les noms de colonnes CSV (ex: 'DateDebut', 'DateFin', 'Titre', etc.).
*/

// --- CONSTANTES ET VARIABLES GLOBALES ---

const newsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=0&single=true&output=csv';
const partnersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1082465411&single=true&output=csv';
const eventsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=377066785&single=true&output=csv'; // URL Calendrier (Vérifiez si correcte)

let isFormSubmitting = false; // Drapeau pour formulaires iframe
const THEME_STORAGE_KEY = 'cse-app-selected-theme';
const DEFAULT_THEME = 'theme-default';
const KNOWN_THEMES = ['theme-default', 'theme-dark', 'theme-eau', 'theme-desert', 'theme-foret'];

// --- GESTION DES THÈMES ---

function applyTheme(themeName) { const validThemeName = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME; document.body.classList.remove(...KNOWN_THEMES); document.body.classList.add(validThemeName); try { localStorage.setItem(THEME_STORAGE_KEY, validThemeName); } catch (e) { console.warn("LocalStorage indisponible:", e); } updateThemeButtonStates(validThemeName); }
function loadSavedTheme() { let savedTheme = DEFAULT_THEME; try { savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME; } catch (e) { /* Ignorer */ } if (!KNOWN_THEMES.includes(savedTheme)) savedTheme = DEFAULT_THEME; applyTheme(savedTheme); }
function updateThemeButtonStates(activeTheme) { const themeButtons = document.querySelectorAll('.theme-switcher-container button.theme-button[data-theme]'); themeButtons.forEach(button => { button.classList.toggle('active-theme', button.dataset.theme === activeTheme); }); }

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
        case 'calendrier': // Le case était bien là, mais l'action pointait dans le vide
             pageHTML = `<section id="calendrier"><h2>Calendrier des Événements</h2><div id="events-container"></div></section>`;
             deferredAction = loadEvents; break; // <<<=== 'loadEvents' existe maintenant
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
            pageHTML = `
         <section id="formulaire-contact"><div class="form-container"><h2>Contacter le CSE</h2>
         <form id="contactForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSd9cPzMspmgCVEx3vLSVDiYIrX3fwFTrO3zjntnU1ZmX01w4g/formResponse" method="POST" target="hidden_iframe">

             <div class="form-group">
                 <label for="contact_nomPrenom" class="required">Nom & Prénom</label>
                 <input type="text" id="contact_nomPrenom" name="entry.55828962" required placeholder="Ex: Jean Dupont">
             </div>

             <div class="form-group">
                 <label for="contact_email" class="required">Mail</label>
                 <input type="email" id="contact_email" name="entry.1334830157" required placeholder="Ex: jean.dupont@entreprise.com">
             </div>
             
             <div class="form-group">
                 <label for="contact_operation" class="required">Opération</label>
                 <select id="contact_operation" name="entry.506750242" required>
                     <option value="" disabled selected>-- Sélectionnez une opération --</option>
                     <option value="Direction / Service généraux / IT">Direction / Service généraux / IT</option>
                     <option value="AG2R">AG2R</option>
                     <option value="UCPA">UCPA</option>
                     <option value="CNAV">CNAV</option>
                     <option value="IRP Auto">IRP Auto</option>
                     <option value="Abeille">Abeille</option>
                     <option value="EHS">EHS</option>
                     <option value="DCP">DCP</option>
                     <option value="Enedis">Enedis</option>

                 </select>
             </div>
             
             <div class="form-group">
                 <label class="required">Nature de la Demande (cochez ce qui s'applique)</label>
                 <div class="checkbox-group">
                         
                     <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Clé café"> Clé café</label>
                     <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte AccèsCE"> Carte AccèsCE</label>
                     <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte cadeau naissance"> Carte cadeau naissance</label>
                     <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte cadeau mariage"> Carte cadeau mariage / pacs</label>
                     <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Carte cadeau retraite"> Carte cadeau retraite</label>
                     <label class="checkbox-label"><input type="checkbox" name="entry.296933228" value="Autre"> Autre...</label>
                     
                 </div>
             </div>
             
             <div class="form-group">
                 <label for="contact_message">Votre Message (optionnel)</label>
                 <textarea id="contact_message" name="entry.2046101959" rows="5" placeholder="Décrivez votre demande ici..."></textarea>
             </div>
             
             <button type="submit">Envoyer le Message</button>
         </form>
         <div class="form-status-sending" style="display: none;">Envoi en cours...</div>
         <div id="confirmation" class="confirmation" style="display: none;">Merci, message envoyé ! Nous vous répondrons bientôt.</div>
         <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
         </div></section>`;

             deferredAction = () => attachFormEvents('contactForm');
             break;
        case 'partenaires':
            pageHTML = `<section id="partenaires"><h2>Nos Partenaires</h2><div id="partners-container"></div></section>`;
            deferredAction = loadPartners; break;
        default:
            pageHTML = '<p class="error-message">Page non trouvée.</p>'; console.warn(`Page inconnue: '${pageId}'.`);
    }
    mainContent.innerHTML = pageHTML;
    if (deferredAction) deferExecution(deferredAction);
}

// --- Exécution différée ---
function deferExecution(callback) { if (typeof callback === 'function') setTimeout(callback, 0); }

// --- GESTION DES FORMULAIRES (IFRAME UNIQUEMENT) ---
function attachFormEvents(formId) { const form = document.getElementById(formId); if (!form) { console.error(`Form iframe introuvable: #${formId}`); return; } const sb = form.querySelector('button[type="submit"]'); const st = form.parentNode.querySelector('.form-status-sending'); const cf = form.parentNode.querySelector('#confirmation'); form.addEventListener("submit", () => { isFormSubmitting = true; if(sb) sb.disabled = true; if(st) st.style.display = 'block'; if(cf) cf.style.display = 'none'; }); }
function onFormSubmit() { if (!isFormSubmitting) return; const form = document.querySelector('#main-content form[target="hidden_iframe"]'); if (!form) { isFormSubmitting = false; return; } const cf = form.parentNode.querySelector('#confirmation'); const st = form.parentNode.querySelector('.form-status-sending'); const sb = form.querySelector('button[type="submit"]'); form.style.display = "none"; if(st) st.style.display = 'none'; if(cf) cf.style.display = "block"; setTimeout(() => { if(form) form.reset(); if(sb) sb.disabled = false; isFormSubmitting = false; }, 3000); }

// --- CHARGEMENT ET AFFICHAGE DES ACTUALITÉS ---
function loadNews() { const c=document.getElementById('news-container'); if(!c)return; c.innerHTML='<p class="loading-message">Chargement...</p>'; fetch(newsCsvUrl).then(r=>{if(!r.ok)throw new Error(`E ${r.status}`);return r.text()}).then(csv=>Papa.parse(csv,{header:true,skipEmptyLines:'greedy',complete:res=>displayNews(res.data),error:e=>{console.error('PapaParse N:',e);if(c)c.innerHTML='<p class="error-message">Err actu.</p>';}})).catch(err=>{console.error('Fetch N:',err);if(c)c.innerHTML=`<p class="error-message">Actu HS.</p>`;}); }
function displayNews(d) { const c=document.getElementById('news-container'); if(!c)return; c.innerHTML=''; const v=(d||[]).filter(i=>i&&Object.values(i).some(v=>v&&String(v).trim())).sort((a,b)=>(parseDate(b.Date||b.date)?.getTime()||0)-(parseDate(a.Date||a.date)?.getTime()||0)); if(v.length===0){c.innerHTML='<p>Rien.</p>';return;} v.forEach(i=>{const t=i.Titre||i.titre||'Actu'; const dt=i.Date||i.date||''; const ds=i.Description||i.description||''; const img=i.Lien_image||i['Lien image']||i.Image||i.image||''; const el=document.createElement('div'); el.className='actu'; const im=img?`<img src="${img}" alt="${t}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" loading="lazy"><p class="error-message image-error" style="display:none;">Img?</p>`:''; el.innerHTML=`<h3>${t}</h3>${dt?`<p><strong>Date:</strong> ${dt}</p>`:''}<p>${ds}</p>${im}`; c.appendChild(el);}); }

// --- CHARGEMENT ET AFFICHAGE DES PARTENAIRES ---
function loadPartners() { const c=document.getElementById('partners-container'); if(!c)return; c.innerHTML='<p class="loading-message">Chargement...</p>'; fetch(partnersCsvUrl).then(r=>{if(!r.ok)throw new Error(`E ${r.status}`);return r.text()}).then(csv=>Papa.parse(csv,{header:true,skipEmptyLines:'greedy',complete:res=>{if(c)c.classList.remove('partners-loading'); const v=(res.data||[]).filter(i=>i&&i.Nom&&String(i.Nom).trim()); if(v.length>0)displayPartners(groupPartnersByCategory(v)); else if(c)c.innerHTML='<p>Aucun.</p>';},error:e=>console.error('PapaParse P:',e)})).catch(err=>{console.error('Fetch P:',err);if(c){c.classList.remove('partners-loading'); c.innerHTML=`<p class="error-message">Partenaires HS.</p>`;}}); }
function groupPartnersByCategory(p) { const g={}; const d="Autres"; p.forEach(i=>{const c=(i.Categorie||i.categorie||'').trim()||d; if(!g[c])g[c]=[]; g[c].push(i);}); const k=Object.keys(g).sort((a,b)=>(a===d)?1:(b===d)?-1:a.localeCompare(b,'fr',{sensitivity:'base'})); const s={}; k.forEach(c=>{s[c]=g[c].sort((a,b)=>(a.Nom||'').localeCompare(b.Nom||'','fr',{sensitivity:'base'}));}); return s; }
function displayPartners(g) { const c=document.getElementById('partners-container'); if(!c)return; c.innerHTML=''; if(Object.keys(g).length===0){c.innerHTML='<p>Aucun.</p>';return;} for(const cat in g){if(g.hasOwnProperty(cat)){const p=g[cat]; const t=document.createElement('h3'); t.className='partner-category-title'; t.textContent=cat; c.appendChild(t); const grd=document.createElement('div'); grd.className='partner-category-grid'; c.appendChild(grd); p.forEach(i=>{const n=i.Nom||''; const d=i.Description||''; const l=i.Lien||i.lien||i.URL||i.url||''; const o=i.Logo||i.logo||''; const crd=document.createElement('div'); crd.className='partner-card'; const lo=o?`<img src="${o}" alt="${n}" class="partner-logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><p class="error-message image-error" style="display:none;">Logo?</p>`:`<div class="partner-logo-placeholder"><i class="fas fa-building"></i></div>`; crd.innerHTML=`${lo}<h4>${n}</h4>${d?`<p>${d}</p>`:''}`; if(l){const a=document.createElement('a'); a.href=l; a.target='_blank'; a.rel='noopener noreferrer'; a.className='partner-card-link'; a.appendChild(crd); grd.appendChild(a);}else{grd.appendChild(crd);}});}}}

// ==========================================================
// --- DEBUT : FONCTIONS CALENDRIER (RÉINSÉRÉES ICI) ---
// ==========================================================

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
            const startDateStr = event.DateDebut || event.Date; const endDateStr = event.DateFin; const title = event.Titre;
            const parsedStartDate = parseDate(startDateStr); let parsedEndDate = parseDate(endDateStr);
            if (parsedEndDate && parsedStartDate && parsedEndDate < parsedStartDate) parsedEndDate = null;
            if (!parsedStartDate || !title) return null;
            return { ...event, parsedStartDate, parsedEndDate };
        })
        .filter(event => event !== null)
        .filter(event => (event.parsedEndDate || event.parsedStartDate) >= today)
        .sort((a, b) => a.parsedStartDate.getTime() - b.parsedStartDate.getTime());

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
        let dateStr = ''; const startFmt = event.parsedStartDate.toLocaleDateString('fr-FR', dateOptionsLong);
        if (event.parsedEndDate && event.parsedEndDate.getTime() !== event.parsedStartDate.getTime()) { const endFmt = event.parsedEndDate.toLocaleDateString('fr-FR', dateOptionsShort); const startShort = event.parsedStartDate.toLocaleDateString('fr-FR', dateOptionsShort); dateStr = `Du ${startShort} au ${endFmt}`; } else { dateStr = startFmt; }
        let timeStr = ''; const time = event.Heure || event.heure; if (time) { const tParts = String(time).match(/^(\d{1,2}):(\d{2})$/); timeStr = tParts ? ` à ${tParts[1]}h${tParts[2]}` : (String(time).includes(':') ? ` - ${time}`: ''); }
        const title = event.Titre || 'Événement'; const desc = event.Description || ''; const loc = event.Lieu || '';
        item.innerHTML = `<div class="event-date">${dateStr}${timeStr}</div><div class="event-details"><h4>${title}</h4>${loc ? `<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${loc}</p>` : ''}${desc ? `<p>${desc}</p>` : ''}</div>`;
        container.appendChild(item);
    });
}
// ==========================================================
// --- FIN : FONCTIONS CALENDRIER ---
// ==========================================================


// --- UTILITAIRE DATE ---
function parseDate(dS) { if (!dS || typeof dS !== 'string') return null; dS = dS.trim(); let p, d, m, y, dt; p = dS.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/); if (p) { d = parseInt(p[1], 10); m = parseInt(p[2], 10) - 1; y = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } p = dS.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (p) { y = parseInt(p[1], 10); m = parseInt(p[2], 10) - 1; d = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } p = dS.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/); if (p) { m = parseInt(p[1], 10) - 1; d = parseInt(p[2], 10); y = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } try { const ts = Date.parse(dS); if (!isNaN(ts)) return new Date(ts); } catch(e) {} return null; }

// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme(); closeMenu(); loadPage('actualites', false);
    const hamburger = document.querySelector('.hamburger'); if (hamburger) hamburger.addEventListener('click', toggleMenu); else console.error("CRITICAL: Hamburger not found.");
    const sidebar = document.getElementById('sidebar'); if (sidebar) { sidebar.addEventListener('click', (e) => { const themeBtn = e.target.closest('.theme-switcher-container button.theme-button[data-theme]'); if (themeBtn) { e.preventDefault(); applyTheme(themeBtn.dataset.theme); return; } }); } else { console.error("CRITICAL: Sidebar not found for theme listener."); }
});

// ==================================================
//              FIN DU SCRIPT
// ==================================================
