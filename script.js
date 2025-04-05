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
const membersCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?gid=1265664324&single=true&output=csv';

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
        case 'accesce':
            pageHTML = `
                <section id="accesce">
                    <h2>AccèsCE : Vos Avantages CSE Centralisés</h2>

                    <p><strong>AccèsCE</strong> est la plateforme choisie par votre CSE pour vous donner accès facilement à une multitude d'offres et de réductions négociées pour vous ! C'est votre portail unique pour profiter pleinement des avantages proposés par le CSE.</p>

                    <h3>Vos Avantages Spécifiques via le CSE :</h3>
                    <div class="highlight-box">
                        <ul>
                            <li>🎟️ <strong>Cinéma à Prix Réduit + Bonus CSE :</strong> Profitez des tarifs négociés sur la billetterie cinéma directement sur AccèsCE. <br>Votre CSE ajoute <strong>2€ de participation supplémentaire</strong> sur une place chaque mois !</li>
                            <li>💳 <strong>Frais Bancaires Offerts :</strong> Utilisez la plateforme et commandez en toute sérénité, <strong>votre CSE prend intégralement en charge</strong> les éventuels frais bancaires liés à votre compte ou vos transactions AccèsCE.</li>
                        </ul>
                    </div>

                    <h3>Que trouverez-vous sur AccèsCE ?</h3>
                    <p>Au-delà de ces avantages spécifiques, la plateforme AccèsCE regroupe un large éventail d'offres :</p>
                    <ul>
                        <li><strong>Billetterie :</strong> Cinémas, parcs d'attractions, zoos, piscines, concerts, spectacles, musées, expositions...</li>
                        <li><strong>Cartes Cadeaux & Bons d'Achat :</strong> Des remises sur des cartes valables dans de nombreuses enseignes (mode, high-tech, sport, maison, alimentation...).</li>
                        <li><strong>Shopping :</strong> Des réductions exclusives sur des plateformes de shopping en ligne partenaires.</li>
                        <li><strong>Vacances & Loisirs :</strong> Des offres pour vos séjours, locations, activités sportives ou de détente.</li>
                        <li>Et bien plus encore selon les partenariats négociés !</li>
                    </ul>

                    <h3>Comment en profiter ?</h3>
                    <p>Connectez-vous à votre espace personnel sur le site AccèsCE avec les identifiants qui vous ont été communiqués :</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="https://acces-ce.fr/" target="_blank" rel="noopener noreferrer" class="action-button">
                            Accéder à la plateforme AccèsCE <i class="fas fa-external-link-alt"></i>
                        </a>
                    </p>
                    <p><small>Si vous n'avez pas eu votre code d'activation, veuillez contacter directement le CSE via le formulaire de contact.</small></p>

                     <div class="contact-commission">
                         <p><strong>Une question sur AccèsCE ou vos avantages ?</strong><br>
                         Vos élus sont là pour vous aider via le <button class="inline-link-button" onclick="loadPage('formulaire-contact', false)">formulaire de contact</button>.</p>
                     </div>
                </section>
            `;
            // Pas de deferredAction car contenu statique
            break;
        // --- FIN NOUVEAU CASE ---

               // --- NOUVEAU CASE POUR ACTION LOGEMENT ---
        case 'action-logement':
            pageHTML = `
                <section id="action-logement">
                    <h2>Action Logement</h2>

                    <p>Vous êtes salarié et vous cherchez un logement social à loyer modéré ?</p>
                    <p><strong>Action Logement</strong> vous accompagne à chaque étape pour faciliter votre accès à un logement adapté à votre situation !</p>

                    <h3>Nos Solutions Principales :</h3>

                    <p><strong>🏡 Accédez à un logement social ou intermédiaire</strong><br>
                    Grâce à la plateforme AL’in, postulez en toute simplicité aux logements disponibles selon vos revenus et votre situation familiale.
                    Rendez-vous sur : <a href="https://www.al-in.fr" target="_blank" rel="noopener noreferrer">al-in.fr</a></p>

                    <p><strong>🔑 Besoin d’un garant ?</strong><br>
                    Avec la <strong>Garantie Visale</strong>, Action Logement se porte garant gratuitement auprès de votre propriétaire (sous conditions).</p>

                    <p><strong>💰 Aide au dépôt de garantie</strong><br>
                    Avec l’<strong>Avance LOCA-PASS®</strong>, bénéficiez d’un prêt sans frais ni intérêt pour financer votre dépôt de garantie, jusqu'à 1 200 €, remboursable sur 25 mois (sous conditions).</p>

                    <p><strong>📦 Aide à la mobilité</strong><br>
                    Jusqu’à 1 000 € pour vous aider à déménager en cas de mutation ou de nouvel emploi (sous conditions).</p>

                    <h3>Comment ça marche pour un logement social ?</h3>
                    <ol>
                        <li>Demandez un Numéro Unique Départemental (NUD) ou Régional (NUR) sur le site officiel : <a href="https://www.demande-logement-social.gouv.fr" target="_blank" rel="noopener noreferrer">demande-logement-social.gouv.fr</a>.</li>
                        <li>Créez votre compte sur la plateforme AL’in (<a href="https://www.al-in.fr" target="_blank" rel="noopener noreferrer">al-in.fr</a>) et renseignez votre demande en utilisant votre Numéro Unique.</li>
                        <li>Postulez aux logements disponibles directement sur AL'in et suivez l’évolution de votre candidature !</li>
                    </ol>

                    <p>💡 Un logement plus accessible, un accompagnement personnalisé !<br>
                    Ne laissez plus le logement être un frein à votre quotidien. Découvrez toutes les solutions d'Action Logement et trouvez votre futur chez-vous dès aujourd’hui !</p>

                    <div class="contact-commission">
                         <p><strong>Pour toutes demandes ou besoin d'aide, votre commission logement est là pour vous :</strong></p>
                         <p>Sabrina Gheraf (CNAV), David Verdin (ENEDIS), Julien Nunne (AG2R)</p>
                         <p>N'hésitez pas à utiliser le <button class="inline-link-button" onclick="loadPage('formulaire-contact', false)">formulaire de contact</button> pour les joindre.</p>
                    </div>
                </section>
            `;
            // Pas besoin de deferredAction ici car le contenu est statique
            break;
        // --- FIN NOUVEAU CASE ---

        // --- NOUVEAU CASE POUR LES MEMBRES ---
        case 'membres':
            pageHTML = `
                <section id="membres">
                    <h2>Les membres du CSE</h2>
                    <div id="members-container">
                       {/* Grille injectée par displayMembers */}
                    </div>
                </section>
            `;
            deferredAction = loadMembers; // Appel nouvelle fonction
            break;
        // --- FIN NOUVEAU CASE ---
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
function displayNews(d) {
    const c = document.getElementById('news-container');
    if (!c) return;
    c.innerHTML = '';
    c.classList.add('news-grid');

    const v = (d || [])
        .filter(i => i && Object.values(i).some(v => v && String(v).trim()))
        .sort((a, b) => (parseDate(b.Date || b.date)?.getTime() || 0) - (parseDate(a.Date || b.date)?.getTime() || 0));

    if (v.length === 0) {
        c.innerHTML = '<p>Aucune actualité pour le moment.</p>';
        return;
    }

    v.forEach((i, index) => {
        const t = i.Titre || i.titre || 'Actualité sans titre';
        const dt = i.Date || i.date || '';
        const ds = i.Description || i.description || 'Aucune description disponible.';
        const img = i.Lien_image || i['Lien image'] || i.Image || i.image || '';

        const el = document.createElement('div');
        el.className = 'news-card';
        el.style.setProperty('--order', index + 1); // Ajout dynamique de l'ordre

        const imgHtml = img 
            ? `<div class="news-image"><img src="${img}" alt="${t}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" loading="lazy"><p class="error-message image-error" style="display:none;">Image indisponible</p></div>` 
            : `<div class="news-image-placeholder"><i class="fas fa-newspaper"></i></div>`;

        el.innerHTML = `
            ${imgHtml}
            <div class="news-content">
                <h3>${t}</h3>
                ${dt ? `<p class="news-date"><i class="fas fa-calendar-alt"></i> ${dt}</p>` : ''}
                <p class="news-desc">${ds}</p>
            </div>
        `;
        c.appendChild(el);
    });
}
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
// ==========================================================
// --- DEBUT : FONCTIONS MEMBRES CSE ---
// ==========================================================

/** Charge et affiche les membres depuis le CSV. */
function loadMembers() {
    const container = document.getElementById('members-container');
    if (!container) { console.error("Conteneur #members-container introuvable."); return; }
    container.innerHTML = '<p class="loading-message">Chargement des membres...</p>';

    fetch(membersCsvUrl)
        .then(response => { if (!response.ok) throw new Error(`Erreur réseau Membres ${response.status}`); return response.text(); })
        .then(csvText => Papa.parse(csvText, { header: true, skipEmptyLines: 'greedy', complete: results => displayMembers(results.data), error: e => { console.error('PapaParse Membres:', e); if(container) container.innerHTML = '<p class="error-message">Erreur lecture membres.</p>';} }))
        .catch(error => { console.error('Fetch Membres:', error); if(container) container.innerHTML = `<p class="error-message">Chargement membres impossible. ${error.message}</p>`; });
}

/**
 * Affiche la grille des membres triés dans le DOM.
 * Gère les rôles multiples séparés par virgule et affiche une photo ou un placeholder.
 * @param {Array<Object>} membersData - Données brutes des membres parsées depuis le CSV.
 */
function displayMembers(membersData) {
    const container = document.getElementById('members-container');
    if (!container) {
        console.error("Conteneur #members-container introuvable pour l'affichage.");
        return; // Arrêter si le conteneur n'existe pas
    }
    container.innerHTML = ''; // Vider le conteneur avant de le remplir

    // 1. Filtrer les entrées pour ne garder que celles avec au moins Nom et Prénom
    const validMembers = (membersData || []).filter(m =>
        m &&                                    // L'objet membre existe
        (m.Nom || m.nom) &&                     // La propriété Nom (ou nom) existe et n'est pas vide
        String(m.Nom || m.nom).trim() !== '' && // Le Nom n'est pas juste des espaces
        (m.Prenom || m.prenom) &&               // La propriété Prenom (ou prenom) existe et n'est pas vide
        String(m.Prenom || m.prenom).trim() !== '' // Le Prenom n'est pas juste des espaces
    );

    if (validMembers.length === 0) {
        container.innerHTML = '<p>Aucun membre à afficher pour le moment.</p>';
        return;
    }

    // 2. Trier les membres valides par Nom, puis par Prénom (insensible à la casse)
    validMembers.sort((a, b) => {
        // Normaliser les noms et prénoms en minuscule pour le tri
        const nomA = String(a.Nom || a.nom || '').toLowerCase();
        const nomB = String(b.Nom || b.nom || '').toLowerCase();
        const prenomA = String(a.Prenom || a.prenom || '').toLowerCase();
        const prenomB = String(b.Prenom || b.prenom || '').toLowerCase();

        // Comparer les noms
        if (nomA < nomB) return -1;
        if (nomA > nomB) return 1;

        // Si les noms sont identiques, comparer les prénoms
        if (prenomA < prenomB) return -1;
        if (prenomA > prenomB) return 1;

        return 0; // Noms et prénoms identiques
    });

    // 3. Créer la grille conteneur pour les cartes
    const grid = document.createElement('div');
    grid.className = 'members-grid';
    container.appendChild(grid);

    // 4. Créer et ajouter une carte pour chaque membre trié
    validMembers.forEach(member => {
        // Récupérer les données du membre, en gérant les variations de nom de colonne et les valeurs par défaut
        const nom = member.Nom || member.nom;
        const prenom = member.Prenom || member.prenom;
        const operation = member.Operation || member.operation || ''; // Laisser vide si non défini
        const roleString = member.Role || member.role || 'Membre'; // Rôle par défaut si non défini
        const photoUrl = member.PhotoURL || member.PhotoUrl || member.photoURL || member.photourl || ''; // URL de la photo ou chaîne vide

        // Traiter les rôles multiples séparés par une virgule
        const rolesHtml = roleString
            .split(',')             // Sépare en tableau: [" Role1 ", "Role2 "]
            .map(role => role.trim()) // Enlève les espaces: ["Role1", "Role2"]
            .filter(role => role !== '') // Enlève les rôles vides si ex: "Role1,,Role2"
            .join('<br>');            // Joint avec saut de ligne: "Role1<br>Role2"

        // Créer l'élément de carte
        const card = document.createElement('div');
        card.className = 'member-card';

        // Générer le HTML pour la photo ou le placeholder
        let photoHtml = '';
        if (photoUrl) {
            // Si une URL de photo est fournie
            photoHtml = `
                <img src="${photoUrl}" alt="Photo de ${prenom} ${nom}" class="member-photo" loading="lazy"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="member-placeholder placeholder-error" style="display: none;">
                    <i class="fas fa-user-alt-slash"></i>
                </div>`;
        } else {
            // Si pas d'URL de photo, afficher le placeholder par défaut
            photoHtml = `
                <div class="member-placeholder placeholder-default">
                    <i class="fas fa-user"></i>
                </div>`;
        }

        // Construire l'innerHTML complet de la carte
        card.innerHTML = `
            ${photoHtml}
            <h4>${prenom} ${nom}</h4>
            <p class="member-role">${rolesHtml}</p>
            ${operation ? `<p class="member-operation">${operation}</p>` : ''}
        `;

        // Ajouter la carte finalisée à la grille
        grid.appendChild(card);
    });
}
// ==========================================================
// --- FIN : FONCTIONS MEMBRES CSE ---
// ==========================================================


// --- UTILITAIRE DATE ---
function parseDate(dS) { if (!dS || typeof dS !== 'string') return null; dS = dS.trim(); let p, d, m, y, dt; p = dS.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/); if (p) { d = parseInt(p[1], 10); m = parseInt(p[2], 10) - 1; y = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } p = dS.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (p) { y = parseInt(p[1], 10); m = parseInt(p[2], 10) - 1; d = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } p = dS.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/); if (p) { m = parseInt(p[1], 10) - 1; d = parseInt(p[2], 10); y = parseInt(p[3], 10); if (y > 1900 && y < 2100 && m >= 0 && m < 12 && d > 0 && d <= 31) { dt = new Date(Date.UTC(y, m, d)); if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d) return dt; } } try { const ts = Date.parse(dS); if (!isNaN(ts)) return new Date(ts); } catch(e) {} return null; }

// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme(); closeMenu(); loadPage('actualites', false);
    const hamburger = document.querySelector('.hamburger'); if (hamburger) hamburger.addEventListener('click', toggleMenu); else console.error("CRITICAL: Hamburger not found.");
    const sidebar = document.getElementById('sidebar'); if (sidebar) { sidebar.addEventListener('click', (e) => { const themeBtn = e.target.closest('.theme-switcher-container button.theme-button[data-theme]'); if (themeBtn) { e.preventDefault(); applyTheme(themeBtn.dataset.theme); return; } }); } else { console.error("CRITICAL: Sidebar not found for theme listener."); }
});
// --- Gestion du bouton d'installation PWA ---
let deferredPrompt = null;

// Écouter l'événement 'beforeinstallprompt' pour savoir si l'installation est possible
window.addEventListener('beforeinstallprompt', (e) => {
    // Empêche l'invite automatique (pour contrôler via le bouton)
    e.preventDefault();
    // Stocker l'événement pour l'utiliser plus tard
    deferredPrompt = e;
    // Afficher le bouton d'installation
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'block';
    }
});

// Gérer le clic sur le bouton d'installation
document.addEventListener('DOMContentLoaded', () => {
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            // Afficher l'invite d'installation
            deferredPrompt.prompt();
            // Attendre la réponse de l'utilisateur
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('Utilisateur a accepté l’installation');
            } else {
                console.log('Utilisateur a refusé l’installation');
            }
            // Réinitialiser l'événement
            deferredPrompt = null;
            // Cacher le bouton après l'installation
            installButton.style.display = 'none';
        });
    }
});
// Gestion du bouton de mise à jour
document.addEventListener('DOMContentLoaded', () => {
    const updateButton = document.getElementById('update-button');
    if (updateButton) {
        updateButton.addEventListener('click', () => {
            if ('serviceWorker' in navigator) {
                // Envoyer un message au Service Worker pour vérifier les mises à jour
                navigator.serviceWorker.getRegistration().then((registration) => {
                    if (registration && registration.waiting) {
                        // Une mise à jour est en attente
                        registration.waiting.postMessage({ type: 'CHECK_UPDATE' });
                    }

                    // Forcer la vérification des nouveaux fichiers
                    registration.update().then(() => {
                        // Recharger la page pour appliquer les changements
                        caches.keys().then((cacheNames) => {
                            return Promise.all(
                                cacheNames.map((name) => caches.delete(name))
                            );
                        }).then(() => {
                            window.location.reload(true); // Rechargement forcé
                        });
                    }).catch((err) => {
                        console.error('Erreur lors de la vérification de mise à jour:', err);
                        alert('Impossible de vérifier les mises à jour. Essayez de vider le cache manuellement.');
                    });
                });
            } else {
                alert('Les mises à jour ne sont pas disponibles sur cet appareil.');
            }
        });
    }

    // Écouter les mises à jour du Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Quand le Service Worker change, recharger la page
            window.location.reload();
        });
    }
});
// Cacher le bouton si l'application est déjà installée
window.addEventListener('appinstalled', () => {
    console.log('PWA a été installée');
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'none';
    }
});
// ==================================================
//              FIN DU SCRIPT
// ==================================================
