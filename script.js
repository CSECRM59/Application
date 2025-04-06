// --- CONSTANTES ET VARIABLES GLOBALES ---
const THEME_STORAGE_KEY = 'cse-app-theme';
const ANIMATION_STORAGE_KEY = 'cse-app-animations-enabled';
const DATA_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
let cachedData = null;
let lastFetchTime = 0;
let isMenuOpen = false;
let isFormSubmitting = false;
let currentPage = '';
let animationsEnabled = true;

// --- FONCTIONS UTILITAIRES ---
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showLoading() {
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
}

function hideLoading() {
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

// --- GESTION DES THÈMES ---
function loadSavedTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
            applyTheme(savedTheme);
        }
    } catch (e) {
        console.warn("LocalStorage indisponible pour le thème:", e);
    }
}

function applyTheme(theme) {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
        console.warn("LocalStorage indisponible pour sauvegarder le thème:", e);
    }
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(btn => {
        btn.classList.toggle('active-theme', btn.dataset.theme === theme);
    });
}

// --- GESTION DES ANIMATIONS ---
function loadAnimationPreference() {
    try {
        const saved = localStorage.getItem(ANIMATION_STORAGE_KEY);
        animationsEnabled = saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
        console.warn("LocalStorage indisponible pour les animations:", e);
        animationsEnabled = true;
    }
    updateAnimationState();
}

function updateAnimationState() {
    const toggleButton = document.getElementById('animation-toggle');
    if (toggleButton) {
        toggleButton.classList.toggle('active', animationsEnabled);
    }
    if (!animationsEnabled) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }
    try {
        localStorage.setItem(ANIMATION_STORAGE_KEY, JSON.stringify(animationsEnabled));
    } catch (e) {
        console.warn("LocalStorage indisponible pour sauvegarder les animations:", e);
    }
}

// --- GESTION DU MENU ---
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (!sidebar || !hamburger) return;
    isMenuOpen = !isMenuOpen;
    sidebar.classList.toggle('active', isMenuOpen);
    hamburger.classList.toggle('active', isMenuOpen);
}

function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (!sidebar || !hamburger) return;
    isMenuOpen = false;
    sidebar.classList.remove('active');
    hamburger.classList.remove('active');
}

// --- FETCH DES DONNÉES ---
async function fetchData(force = false) {
    const now = Date.now();
    if (cachedData && (now - lastFetchTime < DATA_REFRESH_INTERVAL) && !force) {
        return cachedData;
    }
    try {
        showLoading();
        const response = await fetch('https://api.github.com/gists/2f8e4c8f2f9f2f9f2f9f2f9f2f9f2f9f'); // Remplacez par l'URL réelle du Gist
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const content = data.files['data.json'].content;
        cachedData = JSON.parse(content);
        lastFetchTime = now;
        return cachedData;
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Erreur lors du chargement des données. Veuillez réessayer plus tard.';
        document.querySelector('main').prepend(errorMessage);
        return null;
    } finally {
        hideLoading();
    }
}

// --- AFFICHAGE DES DONNÉES ---
function displayNews(newsData) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';

    const validNews = (newsData || []).filter(n => n && (n.Titre || n.titre) && String(n.Titre || n.titre).trim() !== '');
    if (validNews.length === 0) {
        container.innerHTML = '<p>Aucune actualité pour le moment.</p>';
        return;
    }

    validNews.sort((a, b) => {
        const dateA = new Date(a.Date || a.date);
        const dateB = new Date(b.Date || b.date);
        return dateB - dateA;
    });

    const grid = document.createElement('div');
    grid.className = 'news-grid';
    container.appendChild(grid);

    validNews.forEach((news, index) => {
        const title = sanitizeHTML(news.Titre || news.titre);
        const dateRaw = news.Date || news.date;
        let dateStr = '';
        if (dateRaw) {
            const date = new Date(dateRaw);
            if (!isNaN(date.getTime())) {
                dateStr = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
            }
        }
        const desc = sanitizeHTML(news.Description || news.description || '');
        const imageUrl = news.ImageURL || news.imageURL || news.ImageUrl || news.imageUrl || '';
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.setProperty('--order', index + 1);
        let imageHtml = imageUrl
            ? `<div class="news-image"><img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.style.display='none';this.parentNode.innerHTML='<div class=\\'news-image-placeholder\\'><i class=\\'fas fa-image\\'></i></div>';"></div>`
            : `<div class="news-image"><div class="news-image-placeholder"><i class="fas fa-image"></i></div></div>`;
        card.innerHTML = `
            ${imageHtml}
            <div class="news-content">
                ${dateStr ? `<p class="news-date"><i class="fas fa-calendar-alt"></i> ${dateStr}</p>` : ''}
                <h3>${title}</h3>
                ${desc ? `<p class="news-desc">${desc}</p>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

function displayEvents(events) {
    const container = document.getElementById('events-container');
    if (!container) return;
    container.innerHTML = '';
    if (events.length === 0) {
        container.innerHTML = '<p>Aucun événement à venir programmé.</p>';
        return;
    }
    const dateOptionsShort = { year: 'numeric', month: 'numeric', day: 'numeric' };
    const dateOptionsLong = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    events.forEach((event, index) => {
        const item = document.createElement('div');
        item.className = 'event-item';
        item.style.setProperty('--order', index + 1);
        let dateStr = '';
        const startFmt = event.parsedStartDate.toLocaleDateString('fr-FR', dateOptionsLong);
        if (event.parsedEndDate && event.parsedEndDate.getTime() !== event.parsedStartDate.getTime()) {
            const endFmt = event.parsedEndDate.toLocaleDateString('fr-FR', dateOptionsShort);
            const startShort = event.parsedStartDate.toLocaleDateString('fr-FR', dateOptionsShort);
            dateStr = `Du ${startShort} au ${endFmt}`;
        } else {
            dateStr = startFmt;
        }
        let timeStr = '';
        const time = event.Heure || event.heure;
        if (time) {
            const tParts = String(time).match(/^(\d{1,2}):(\d{2})$/);
            timeStr = tParts ? ` à ${tParts[1]}h${tParts[2]}` : (String(time).includes(':') ? ` - ${time}` : '');
        }
        const title = event.Titre || 'Événement';
        const desc = event.Description || '';
        const loc = event.Lieu || '';
        item.innerHTML = `
            <div class="event-date">${dateStr}${timeStr}</div>
            <div class="event-details">
                <h4>${title}</h4>
                ${loc ? `<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${loc}</p>` : ''}
                ${desc ? `<p>${desc}</p>` : ''}
            </div>
        `;
        container.appendChild(item);
    });
}

function displayPartners(g) {
    const c = document.getElementById('partners-container');
    if (!c) return;
    c.innerHTML = '';
    if (Object.keys(g).length === 0) {
        c.innerHTML = '<p>Aucun.</p>';
        return;
    }
    let globalIndex = 1;
    for (const cat in g) {
        if (g.hasOwnProperty(cat)) {
            const p = g[cat];
            const t = document.createElement('h3');
            t.className = 'partner-category-title';
            t.textContent = cat;
            c.appendChild(t);
            const grd = document.createElement('div');
            grd.className = 'partner-category-grid';
            c.appendChild(grd);
            p.forEach(i => {
                const n = i.Nom || '';
                const d = i.Description || '';
                const l = i.Lien || i.lien || i.URL || i.url || '';
                const o = i.Logo || i.logo || '';
                const crd = document.createElement('div');
                crd.className = 'partner-card';
                crd.style.setProperty('--order', globalIndex++);
                const lo = o ? `<img src="${o}" alt="${n}" class="partner-logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><p class="error-message image-error" style="display:none;">Logo?</p>` : `<div class="partner-logo-placeholder"><i class="fas fa-building"></i></div>`;
                crd.innerHTML = `${lo}<h4>${n}</h4>${d ? `<p>${d}</p>` : ''}`;
                if (l) {
                    const a = document.createElement('a');
                    a.href = l;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.className = 'partner-card-link';
                    a.appendChild(crd);
                    grd.appendChild(a);
                } else {
                    grd.appendChild(crd);
                }
            });
        }
    }
}

function displayMembers(membersData) {
    const container = document.getElementById('members-container');
    if (!container) {
        console.error("Conteneur #members-container introuvable pour l'affichage.");
        return;
    }
    container.innerHTML = '';

    const validMembers = (membersData || []).filter(m =>
        m && (m.Nom || m.nom) && String(m.Nom || m.nom).trim() !== '' &&
        (m.Prenom || m.prenom) && String(m.Prenom || m.prenom).trim() !== ''
    );

    if (validMembers.length === 0) {
        container.innerHTML = '<p>Aucun membre à afficher pour le moment.</p>';
        return;
    }

    validMembers.sort((a, b) => {
        const nomA = String(a.Nom || a.nom || '').toLowerCase();
        const nomB = String(b.Nom || b.nom || '').toLowerCase();
        const prenomA = String(a.Prenom || a.prenom || '').toLowerCase();
        const prenomB = String(b.Prenom || b.prenom || '').toLowerCase();
        if (nomA < nomB) return -1;
        if (nomA > nomB) return 1;
        if (prenomA < prenomB) return -1;
        if (prenomA > prenomB) return 1;
        return 0;
    });

    const grid = document.createElement('div');
    grid.className = 'members-grid';
    container.appendChild(grid);

    validMembers.forEach((member, index) => {
        const nom = member.Nom || member.nom;
        const prenom = member.Prenom || member.prenom;
        const operation = member.Operation || member.operation || '';
        const roleString = member.Role || member.role || 'Membre';
        const photoUrl = member.PhotoURL || member.PhotoUrl || member.photoURL || member.photourl || '';
        const rolesHtml = roleString.split(',').map(role => role.trim()).filter(role => role !== '').join('<br>');
        const card = document.createElement('div');
        card.className = 'member-card';
        card.style.setProperty('--order', index + 1);
        let photoHtml = photoUrl
            ? `<img src="${photoUrl}" alt="Photo de ${prenom} ${nom}" class="member-photo" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="member-placeholder placeholder-error" style="display: none;"><i class="fas fa-user-alt-slash"></i></div>`
            : `<div class="member-placeholder placeholder-default"><i class="fas fa-user"></i></div>`;
        card.innerHTML = `${photoHtml}<h4>${prenom} ${nom}</h4><p class="member-role">${rolesHtml}</p>${operation ? `<p class="member-operation">${operation}</p>` : ''}`;
        grid.appendChild(card);
    });
}

function processEvents(eventsData) {
    const events = (eventsData || []).map(event => {
        const startDate = new Date(event['Date de début'] || event['date de début'] || event['Date'] || event['date']);
        const endDateRaw = event['Date de fin'] || event['date de fin'];
        const endDate = endDateRaw ? new Date(endDateRaw) : null;
        return {
            ...event,
            parsedStartDate: isNaN(startDate.getTime()) ? null : startDate,
            parsedEndDate: endDate && !isNaN(endDate.getTime()) ? endDate : null,
        };
    }).filter(event => event.parsedStartDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(event => {
        const startDate = event.parsedStartDate;
        const endDate = event.parsedEndDate || startDate;
        return endDate >= today;
    });

    upcomingEvents.sort((a, b) => a.parsedStartDate - b.parsedStartDate);
    return upcomingEvents;
}

// --- GESTION DES FORMULAIRES ---
function attachFormEvents(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Form iframe introuvable: #${formId}`);
        return;
    }
    const sb = form.querySelector('button[type="submit"]');
    const st = form.parentNode.querySelector('.form-status-sending');
    const cf = form.parentNode.querySelector('#confirmation');

    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.setProperty('--order', index + 1);
    });

    form.addEventListener("submit", () => {
        isFormSubmitting = true;
        if (sb) sb.disabled = true;
        if (st) st.style.display = 'block';
        if (cf) cf.style.display = 'none';
    });
}

// --- CHARGEMENT DES PAGES ---
async function loadPage(page, updateHistory = true) {
    if (currentPage === page) return;
    currentPage = page;
    closeMenu();

    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="loading-message">Chargement...</div>
        <section id="${page}"></section>
    `;

    const data = await fetchData();
    if (!data) return;

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });

    switch (page) {
        case 'actualites':
            document.getElementById('actualites').innerHTML = `
                <h2>Actualités</h2>
                <div id="news-container">
                    <div class="loading-message">Chargement des actualités...</div>
                </div>
            `;
            displayNews(data.Actualites);
            break;

        case 'calendrier':
            const events = processEvents(data.Calendrier);
            document.getElementById('calendrier').innerHTML = `
                <h2>Calendrier</h2>
                <div id="events-container">
                    <div class="loading-message">Chargement du calendrier...</div>
                </div>
            `;
            displayEvents(events);
            break;

        case 'partenaires':
            document.getElementById('partenaires').innerHTML = `
                <h2>Partenaires</h2>
                <div id="partners-container">
                    <div class="loading-message">Chargement des partenaires...</div>
                </div>
            `;
            displayPartners(data.Partenaires);
            break;

        case 'membres':
            document.getElementById('membres').innerHTML = `
                <h2>Membres du CSE</h2>
                <div id="members-container">
                    <div class="loading-message">Chargement des membres...</div>
                </div>
            `;
            displayMembers(data.Membres);
            break;

        case 'accesce':
            document.getElementById('accesce').innerHTML = `
                <h2>Accès CE</h2>
                <div class="loading-message">Chargement des informations...</div>
            `;
            setTimeout(() => {
                document.getElementById('accesce').innerHTML = `
                    <h2>Accès CE</h2>
                    <p>Le Comité Social et Économique (CSE) propose un accès privilégié à une plateforme en ligne pour bénéficier de nombreux avantages et services.</p>
                    <h3>Comment accéder à votre espace ?</h3>
                    <p>Pour accéder à votre espace personnel, suivez les étapes ci-dessous :</p>
                    <div class="highlight-box">
                        <ul>
                            <li><strong>Étape 1 :</strong> Rendez-vous sur le site officiel du CE via le bouton ci-dessous.</li>
                            <li><strong>Étape 2 :</strong> Connectez-vous avec vos identifiants personnels (fournis par le CSE).</li>
                            <li><strong>Étape 3 :</strong> Explorez les offres, réductions et services disponibles !</li>
                        </ul>
                    </div>
                    <a href="https://exemple.com/acces-ce" target="_blank" rel="noopener noreferrer" class="action-button">Accéder au site du CE <i class="fas fa-arrow-right"></i></a>
                    <small>Si vous n'avez pas encore vos identifiants, contactez un membre du CSE.</small>
                    <h3>Une question ? Contactez-nous</h3>
                    <div class="contact-commission">
                        <p><strong>Email :</strong> <a href="mailto:cse.contact@exemple.com">cse.contact@exemple.com</a></p>
                        <p><strong>Téléphone :</strong> 01 23 45 67 89</p>
                        <p>Vous pouvez aussi utiliser le formulaire de contact ci-dessous :</p>
                    </div>
                    <p><button class="inline-link-button" data-page="contact">Nous contacter directement</button></p>
                `;
                document.querySelectorAll('.inline-link-button').forEach(btn => {
                    btn.addEventListener('click', () => loadPage(btn.dataset.page));
                });
            }, 0);
            break;

        case 'action-logement':
            document.getElementById('action-logement').innerHTML = `
                <h2>Action Logement</h2>
                <div class="loading-message">Chargement des informations...</div>
            `;
            setTimeout(() => {
                document.getElementById('action-logement').innerHTML = `
                    <h2>Action Logement</h2>
                    <p>Le CSE vous accompagne dans vos démarches liées au logement grâce aux services d'<strong>Action Logement</strong>. Que ce soit pour une location, un achat ou des travaux, des aides sont disponibles.</p>
                    <h3>Les services proposés</h3>
                    <p>Action Logement propose plusieurs dispositifs pour les salariés :</p>
                    <ol>
                        <li><strong>Avance Loca-Pass :</strong> Une avance gratuite pour financer votre dépôt de garantie.</li>
                        <li><strong>Aide MOBILI-JEUNE :</strong> Une subvention pour les jeunes de moins de 30 ans en formation.</li>
                        <li><strong>Prêt travaux :</strong> Pour financer des travaux de rénovation ou d'amélioration.</li>
                        <li><strong>Accompagnement à l'achat :</strong> Conseils et prêts avantageux pour devenir propriétaire.</li>
                    </ol>
                    <p>Pour plus d'informations, consultez le site officiel d'Action Logement :</p>
                    <p><a href="https://www.actionlogement.fr" target="_blank" rel="noopener noreferrer">Visiter le site Action Logement</a></p>
                    <h3>Nous contacter</h3>
                    <div class="contact-commission">
                        <p>Pour toute question ou pour être accompagné dans vos démarches, contactez la commission logement du CSE :</p>
                        <p><strong>Responsable :</strong> Marie Dupont</p>
                        <p><strong>Email :</strong> <a href="mailto:logement.cse@exemple.com">logement.cse@exemple.com</a></p>
                        <p>Ou utilisez le formulaire de contact ci-dessous :</p>
                    </div>
                    <p><button class="inline-link-button" data-page="contact">Nous contacter directement</button></p>
                `;
                document.querySelectorAll('.inline-link-button').forEach(btn => {
                    btn.addEventListener('click', () => loadPage(btn.dataset.page));
                });
            }, 0);
            break;

        case 'contact':
            document.getElementById('contact').innerHTML = `
                <h2>Contactez-nous</h2>
                <div class="form-container">
                    <form id="contact-form">
                        <div class="form-group">
                            <label for="contact-name" class="required">Nom</label>
                            <input type="text" id="contact-name" name="name" placeholder="Votre nom" required>
                        </div>
                        <div class="form-group">
                            <label for="contact-email" class="required">Email</label>
                            <input type="email" id="contact-email" name="email" placeholder="votre.email@exemple.com" required>
                        </div>
                        <div class="form-group">
                            <label for="contact-subject" class="required">Sujet</label>
                            <input type="text" id="contact-subject" name="subject" placeholder="Sujet de votre message" required>
                        </div>
                        <div class="form-group">
                            <label for="contact-message" class="required">Message</label>
                            <textarea id="contact-message" name="message" placeholder="Votre message..." required></textarea>
                        </div>
                        <button type="submit">Envoyer</button>
                    </form>
                    <div class="form-status-sending">Envoi en cours...</div>
                    <div id="confirmation" class="confirmation">Message envoyé avec succès ! Nous vous répondrons bientôt.</div>
                </div>
            `;
            attachFormEvents('contact-form');
            break;

        default:
            document.getElementById(page).innerHTML = '<h2>Page non trouvée</h2><p>La page demandée n\'existe pas.</p>';
            break;
    }

    if (updateHistory) {
        history.pushState({ page }, '', `#${page}`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- GESTION DE L'INSTALLATION PWA ---
function handleInstallPrompt() {
    let deferredPrompt;
    const installButton = document.getElementById('install-button');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installButton) {
            installButton.style.display = 'block';
            installButton.addEventListener('click', () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('Utilisateur a accepté l\'installation');
                        } else {
                            console.log('Utilisateur a refusé l\'installation');
                        }
                        deferredPrompt = null;
                        installButton.style.display = 'none';
                    });
                }
            });
        }
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA a été installée');
        if (installButton) installButton.style.display = 'none';
    });
}

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    closeMenu();
    loadPage('actualites', false);
    loadAnimationPreference();
    handleInstallPrompt();

    const hamburger = document.querySelector('.hamburger');
    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    else console.error("CRITICAL: Hamburger not found.");

    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            const navBtn = e.target.closest('.nav-btn');
            if (navBtn) {
                e.preventDefault();
                const page = navBtn.dataset.page;
                loadPage(page);
                return;
            }
            const themeBtn = e.target.closest('.theme-switcher-container button.theme-button[data-theme]');
            if (themeBtn) {
                e.preventDefault();
                applyTheme(themeBtn.dataset.theme);
                return;
            }
            const animationToggle = e.target.closest('#animation-toggle');
            if (animationToggle) {
                animationsEnabled = !animationsEnabled;
                updateAnimationState();
            }
        });
    } else {
        console.error("CRITICAL: Sidebar not found for nav/theme listeners.");
    }

    const contactShortcut = document.querySelector('.contact-shortcut');
    if (contactShortcut) {
        contactShortcut.addEventListener('click', () => loadPage('contact'));
    }

    const updateButton = document.getElementById('update-button');
    if (updateButton) {
        updateButton.addEventListener('click', async () => {
            updateButton.disabled = true;
            await fetchData(true);
            await loadPage(currentPage, false);
            updateButton.disabled = false;
        });
    }

    window.addEventListener('popstate', (e) => {
        const page = e.state ? e.state.page : 'actualites';
        loadPage(page, false);
    });

    window.addEventListener('online', () => {
        console.log("Connexion rétablie. Synchronisation des données...");
        fetchData(true).then(() => loadPage(currentPage, false));
    });

    window.addEventListener('offline', () => {
        console.warn("Connexion perdue. Utilisation des données en cache.");
    });
});
