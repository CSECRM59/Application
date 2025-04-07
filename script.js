// --- INITIALISATION DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCzlrRY437eu0tUCqK99OXtOeyOdYSUYsw",
  authDomain: "appli-cse-56b03.firebaseapp.com",
  projectId: "appli-cse-56b03",
  storageBucket: "appli-cse-56b03.firebasestorage.app",
  messagingSenderId: "892776841086",
  appId: "1:892776841086:web:2a1a7c60be011fda0afd2f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- FONCTION DE CHARGEMENT DE PAGE ---
function loadPage(pageId, fromMenuClick = false) {
  if (fromMenuClick) closeMenu();
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = '<p class="loading-message">Chargement...</p>';
  switch(pageId) {
    case 'actualites': loadNewsPage(); break;
    case 'membres': loadMembersPage(); break;
    case 'calendrier': loadCalendarPage(); break;
    case 'formulaire-cafe': loadCoffeeFormPage(); break;
    case 'formulaire-contact': loadContactFormPage(); break;
    case 'partenaires': loadPartnersPage(); break;
    case 'accesce': loadAccescePage(); break;
    case 'action-logement': loadActionLogementPage(); break;
    default: mainContent.innerHTML = '<p>Page non trouvée.</p>';
  }
}

// --- FONCTIONS POUR FERMER LE MENU SIDEBAR ---
function closeMenu() {
  document.getElementById('sidebar').classList.remove('active');
  document.querySelector('.hamburger').classList.remove('active');
}

// --- SECTION ACTUALITÉS ---
function loadNewsPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="actualites">
      <h2>Dernières Actualités</h2>
      <div id="news-container"></div>
    </section>`;
  db.collection('news').orderBy('date', 'desc').onSnapshot(snapshot => {
    const container = document.getElementById('news-container');
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p>Aucune actualité pour le moment.</p>';
    } else {
      snapshot.forEach(doc => {
        const news = doc.data();
        news.id = doc.id;
        const newsCard = document.createElement('div');
        newsCard.classList.add('actu');
        newsCard.innerHTML = `
          <h3>${news.title}</h3>
          <p>${news.content}</p>
          <small>${news.date} - ${news.status}</small>
          ${news.image ? `<img src="${news.image}" alt="Image associée">` : ''}
        `;
        container.appendChild(newsCard);
      });
    }
  }, error => {
    console.error("Erreur de chargement des actualités:", error);
    mainContent.innerHTML = '<p class="error-message">Erreur de chargement des actualités.</p>';
  });
}

// --- SECTION MEMBRES ---
function loadMembersPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="membres">
      <h2>Les Membres du CSE</h2>
      <div id="members-container"></div>
    </section>`;
  db.collection('membres').orderBy('Nom', 'asc').onSnapshot(snapshot => {
    const container = document.getElementById('members-container');
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p>Aucun membre pour le moment.</p>';
    } else {
      snapshot.forEach(doc => {
        const member = doc.data();
        member.id = doc.id;
        const memberCard = document.createElement('div');
        memberCard.classList.add('member-card');
        memberCard.innerHTML = `
          <img src="${member.PhotoURL || 'img/default-user.png'}" alt="Photo de ${member.Prenom}" class="member-photo">
          <h4>${member.Nom} ${member.Prenom}</h4>
          <p>Email : ${member.Mail}</p>
          <p>Opération : ${member.Operation}</p>
          <p class="member-role">Rôle : ${member.Role}</p>
        `;
        container.appendChild(memberCard);
      });
    }
  }, error => {
    console.error("Erreur de chargement des membres:", error);
    mainContent.innerHTML = '<p class="error-message">Erreur de chargement des membres.</p>';
  });
}

// --- SECTION CALENDRIER ---
function loadCalendarPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="calendrier">
      <h2>Calendrier des Événements</h2>
      <div id="events-container"></div>
    </section>`;
  db.collection('events').orderBy('date', 'asc').onSnapshot(snapshot => {
    const container = document.getElementById('events-container');
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p>Aucun événement prévu.</p>';
    } else {
      snapshot.forEach(doc => {
        const event = doc.data();
        event.id = doc.id;
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');
        eventItem.innerHTML = `
          <div class="event-date">${event.date}</div>
          <div class="event-details">
            <h4>${event.title}</h4>
            <p>${event.description}</p>
            <p class="event-location">${event.location}</p>
          </div>
        `;
        container.appendChild(eventItem);
      });
    }
  }, error => {
    console.error("Erreur de chargement des événements:", error);
    mainContent.innerHTML = '<p class="error-message">Erreur de chargement des événements.</p>';
  });
}

// --- SECTION FORMULAIRE CAFÉ ---
function loadCoffeeFormPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="formulaire-cafe">
      <div class="form-container">
        <h2>Signalement Machine à Café</h2>
        <form id="coffeeForm">
          <div class="form-group"><label for="coffee-email" class="required">Email</label><input type="email" id="coffee-email" required></div>
          <div class="form-group"><label for="coffee-name" class="required">Nom & Prénom</label><input type="text" id="coffee-name" required></div>
          <div class="form-group"><label for="coffee-operation" class="required">Opération</label><input type="text" id="coffee-operation" required></div>
          <div class="form-group"><label for="coffee-machine" class="required">Machine</label><input type="text" id="coffee-machine" required></div>
          <div class="form-group"><label for="coffee-problem" class="required">Problème</label><input type="text" id="coffee-problem" required></div>
          <div class="form-group"><label for="coffee-comment">Commentaire</label><textarea id="coffee-comment"></textarea></div>
          <button type="submit">Envoyer</button>
        </form>
        <div id="coffee-status" class="form-status-sending" style="display: none;">Envoi...</div>
        <div id="coffee-confirmation" class="confirmation" style="display: none;">Merci ! Votre signalement a été envoyé.</div>
      </div>
    </section>`;
  document.getElementById('coffeeForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      email: document.getElementById('coffee-email').value,
      name: document.getElementById('coffee-name').value,
      operation: document.getElementById('coffee-operation').value,
      machine: document.getElementById('coffee-machine').value,
      problem: document.getElementById('coffee-problem').value,
      comment: document.getElementById('coffee-comment').value,
      timestamp: new Date().toISOString()
    };
    document.getElementById('coffee-status').style.display = 'block';
    db.collection('coffee').add(data)
      .then(() => {
        document.getElementById('coffee-status').style.display = 'none';
        document.getElementById('coffee-confirmation').style.display = 'block';
        document.getElementById('coffeeForm').reset();
      })
      .catch(error => {
        console.error("Erreur lors de l'envoi du formulaire café:", error);
        document.getElementById('coffee-status').style.display = 'none';
      });
  });
}

// --- SECTION FORMULAIRE CONTACT ---
function loadContactFormPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="formulaire-contact">
      <div class="form-container">
        <h2>Contacter le CSE</h2>
        <form id="contactForm">
          <div class="form-group">
            <label for="contact-name" class="required">Nom & Prénom</label>
            <input type="text" id="contact-name" required>
          </div>
          <div class="form-group">
            <label for="contact-email" class="required">Email</label>
            <input type="email" id="contact-email" required>
          </div>
          <div class="form-group">
            <label for="contact-operation" class="required">Opération</label>
            <input type="text" id="contact-operation" required>
          </div>
          <div class="form-group">
            <label>Nature de la Demande</label>
            <div class="checkbox-group">
              <label class="checkbox-label"><input type="checkbox" value="Clé café"> Clé café</label>
              <label class="checkbox-label"><input type="checkbox" value="Carte AccèsCE"> Carte AccèsCE</label>
              <label class="checkbox-label"><input type="checkbox" value="Carte cadeau naissance"> Carte cadeau naissance</label>
              <label class="checkbox-label"><input type="checkbox" value="Carte cadeau mariage"> Carte cadeau mariage / pacs</label>
              <label class="checkbox-label"><input type="checkbox" value="Carte cadeau retraite"> Carte cadeau retraite</label>
              <label class="checkbox-label"><input type="checkbox" value="Autre"> Autre...</label>
            </div>
          </div>
          <div class="form-group">
            <label for="contact-message">Votre Message (optionnel)</label>
            <textarea id="contact-message" rows="5"></textarea>
          </div>
          <button type="submit">Envoyer</button>
        </form>
        <div id="contact-status" class="form-status-sending" style="display: none;">Envoi en cours...</div>
        <div id="contact-confirmation" class="confirmation" style="display: none;">Merci, message envoyé !</div>
      </div>
    </section>`;
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      name: document.getElementById('contact-name').value,
      email: document.getElementById('contact-email').value,
      operation: document.getElementById('contact-operation').value,
      demande: Array.from(document.querySelectorAll('#formulaire-contact .checkbox-label input:checked')).map(el => el.value),
      message: document.getElementById('contact-message').value,
      timestamp: new Date().toISOString()
    };
    document.getElementById('contact-status').style.display = 'block';
    db.collection('contact').add(data)
      .then(() => {
        document.getElementById('contact-status').style.display = 'none';
        document.getElementById('contact-confirmation').style.display = 'block';
        document.getElementById('contactForm').reset();
      })
      .catch(error => {
        console.error("Erreur lors de l'envoi du formulaire contact:", error);
        document.getElementById('contact-status').style.display = 'none';
      });
  });
}

// --- SECTION PARTENAIRES ---
function loadPartnersPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `<section id="partenaires"><h2>Nos Partenaires</h2><div id="partners-container"></div></section>`;
  db.collection('partners').orderBy('name', 'asc').onSnapshot(snapshot => {
    const container = document.getElementById('partners-container');
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p>Aucun partenaire pour le moment.</p>';
    } else {
      snapshot.forEach(doc => {
        const partner = doc.data();
        partner.id = doc.id;
        const partnerCard = document.createElement('div');
        partnerCard.classList.add('partner-card');
        partnerCard.innerHTML = `
          ${partner.logo ? `<img src="${partner.logo}" alt="${partner.name}" class="partner-logo">`
                         : `<div class="partner-logo-placeholder"><i class="fas fa-image"></i></div>`}
          <h4>${partner.name}</h4>
          <p>${partner.description || ''}</p>
        `;
        container.appendChild(partnerCard);
      });
    }
  }, error => {
    console.error("Erreur de chargement des partenaires:", error);
    mainContent.innerHTML = '<p class="error-message">Erreur de chargement des partenaires.</p>';
  });
}

// --- SECTION ACCÈSCE ---
function loadAccescePage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `<section id="accesce"><h2>AccèsCE - Vos Avantages</h2><div id="accesce-container"></div></section>`;
  db.collection('accesce').orderBy('title', 'asc').onSnapshot(snapshot => {
    const container = document.getElementById('accesce-container');
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p>Aucun avantage disponible pour le moment.</p>';
    } else {
      snapshot.forEach(doc => {
        const item = doc.data();
        item.id = doc.id;
        const advantageCard = document.createElement('div');
        advantageCard.classList.add('actu');
        advantageCard.innerHTML = `
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        `;
        container.appendChild(advantageCard);
      });
    }
  }, error => {
    console.error("Erreur de chargement d'AccèsCE:", error);
    mainContent.innerHTML = '<p class="error-message">Erreur de chargement d\'AccèsCE.</p>';
  });
}

// --- SECTION ACTION LOGEMENT ---
function loadActionLogementPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `<section id="action-logement"><h2>Action Logement</h2><div id="action-logement-container"></div></section>`;
  db.collection('actionLogement').orderBy('date', 'asc').onSnapshot(snapshot => {
    const container = document.getElementById('action-logement-container');
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p>Aucune information pour Action Logement.</p>';
    } else {
      snapshot.forEach(doc => {
        const info = doc.data();
        info.id = doc.id;
        const infoCard = document.createElement('div');
        infoCard.classList.add('actu');
        infoCard.innerHTML = `
          <h3>${info.title}</h3>
          <p>${info.content}</p>
          <small>${info.date}</small>
        `;
        container.appendChild(infoCard);
      });
    }
  }, error => {
    console.error("Erreur de chargement d'Action Logement:", error);
    mainContent.innerHTML = '<p class="error-message">Erreur de chargement d\'Action Logement.</p>';
  });
}

// --- GESTION DES THÈMES ---
const KNOWN_THEMES = ['theme-default', 'theme-dark', 'theme-eau', 'theme-desert', 'theme-foret'];
const THEME_STORAGE_KEY = 'cse-app-selected-theme';
const DEFAULT_THEME = 'theme-default';
function applyTheme(themeName) {
  const validTheme = KNOWN_THEMES.includes(themeName) ? themeName : DEFAULT_THEME;
  document.body.classList.remove(...KNOWN_THEMES);
  document.body.classList.add(validTheme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, validTheme);
  } catch(e) { console.warn("LocalStorage indisponible:", e); }
  updateThemeButtonStates(validTheme);
}
function loadSavedTheme() {
  let saved = DEFAULT_THEME;
  try { saved = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME; } catch(e) { }
  if (!KNOWN_THEMES.includes(saved)) saved = DEFAULT_THEME;
  applyTheme(saved);
}
function updateThemeButtonStates(activeTheme) {
  document.querySelectorAll('.theme-switcher-container button.theme-button[data-theme]').forEach(btn => {
    btn.classList.toggle('active-theme', btn.dataset.theme === activeTheme);
  });
}
document.querySelectorAll('.theme-switcher-container button.theme-button').forEach(btn => {
  btn.addEventListener('click', () => { applyTheme(btn.dataset.theme); });
});
loadSavedTheme();

// --- GESTION DU MENU SIDEBAR ---
document.querySelector('.hamburger').addEventListener('click', toggleMenu);
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.querySelector('.hamburger');
  sidebar.classList.toggle('active');
  hamburger.classList.toggle('active');
}

// Bouton de mise à jour (rechargement de la page)
document.getElementById('update-button').addEventListener('click', () => { location.reload(); });

// --- CHARGEMENT INITIAL DE LA PAGE ---
window.addEventListener('DOMContentLoaded', () => { loadPage('actualites', false); });
