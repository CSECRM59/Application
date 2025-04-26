

// --- INITIALISATION DE FIREBASE ---
const firebaseConfig = {
  // Remplacez par votre configuration Firebase réelle
  apiKey: "AIzaSyCzlrRY437eu0tUCqK99OXtOeyOdYSUYsw",
  authDomain: "appli-cse-56b03.firebaseapp.com",
  projectId: "appli-cse-56b03",
  storageBucket: "appli-cse-56b03.firebasestorage.app",
  messagingSenderId: "892776841086",
  appId: "1:892776841086:web:2a1a7c60be011fda0afd2f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* === EmailJS (public key) === */
emailjs.init('ua6LDZ5bj0OHjyVr-'); 

// --- RÉFÉRENCE AU DOCUMENT ANALYTICS ---
const analyticsRef = db.collection('analytics').doc('globalCounts');

// --- FONCTION POUR INCRÉMENTER UN COMPTEUR ANALYTICS ---
//     (Pour éviter la duplication de code)
function incrementAnalyticsCounter(fieldName) {
    const updateData = {};
    // Utilise FieldValue.increment pour une mise à jour atomique (sécurisée en cas d'accès concurrents)
    updateData[fieldName] = firebase.firestore.FieldValue.increment(1);
    // Met aussi à jour le timestamp correspondant (le nom est construit dynamiquement)
    updateData[`last${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Timestamp`] = firebase.firestore.FieldValue.serverTimestamp();

    analyticsRef.update(updateData)
    .catch((error) => {
        // Gère le cas où le document n'existe pas encore (bien qu'on l'ait créé manuellement)
        if (error.code === 'not-found') {
            console.warn("Document analytics/globalCounts non trouvé. Tentative de création...");
            // Crée le document avec le compteur initialisé à 1 et les autres à 0
            const initialData = { totalViews: 0, totalInstalls: 0 };
            initialData[fieldName] = 1; // Met le compteur actuel à 1
            initialData[`last${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Timestamp`] = firebase.firestore.FieldValue.serverTimestamp();
            analyticsRef.set(initialData, { merge: true }) // Merge au cas où
                       .catch(err => console.error("Erreur lors de la création du document analytics:", err));
        } else {
            console.error(`Erreur lors de la mise à jour du compteur ${fieldName}:`, error);
        }
    });
}


// --- FONCTION UTILITAIRE POUR ROTATION ALÉATOIRE ---
function applyRandomRotation(selector) {
    // Applique une rotation aléatoire aux éléments correspondants
    document.querySelectorAll(selector).forEach(item => {
        const randomRotation = Math.random() * 6 - 3; // Entre -3 et +3 degrés
        item.style.transform = `rotate(${randomRotation}deg)`;
    });
}

// --- FONCTION DE CHARGEMENT DE PAGE ---
function loadPage(pageId) {
  // Note: La fermeture du menu n'est plus nécessaire ici
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = '<p class="loading-message"><i class="fas fa-spinner fa-spin"></i> Chargement du carnet...</p>'; // Message style atelier

  // Enlever la classe 'active' de l'ancien menu item si nécessaire (optionnel)
  document.querySelectorAll('.menu-item.active').forEach(item => item.classList.remove('active'));
  // Ajouter la classe 'active' au nouveau (optionnel, pour style si besoin)
  const menuItem = document.querySelector(`.menu-item[onclick="loadPage('${pageId}')"]`);
  if (menuItem) menuItem.classList.add('active');

  // Charger le contenu de la page
  switch(pageId) {
    case 'actualites': loadNewsPage(); break;
    case 'membres': loadMembersPage(); break;
    case 'partenaires': loadPartnersPage(); break;
    case 'formulaire-cafe': loadCoffeeFormPage(); break;
    case 'formulaire-contact': loadContactFormPage(); break;
    case 'accesce': loadAccescePage(); break;
    case 'action-logement': loadActionLogementPage(); break;
    // case 'calendrier': loadCalendarPage(); break; // Si réactivé
    default:
      mainContent.innerHTML = '<p class="error-message">Oups ! Page non trouvée dans l\'atelier.</p>';
  }

  // Remonter en haut de page après chargement
  window.scrollTo(0, 0);
}

// --- FONCTION UTILITAIRE POUR "LIRE LA SUITE" ---
function applyReadMore(selector, maxHeight) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
        // Vérifier si l'élément dépasse la hauteur max ET n'a pas déjà un bouton
        if (element.scrollHeight > maxHeight && !element.nextElementSibling?.classList.contains('btn-read-more')) {

            // Stocker le contenu original (au cas où, mais pas utilisé ici pour le moment)
            // const originalContent = element.innerHTML;

            // Appliquer les styles pour tronquer
            element.style.maxHeight = maxHeight + 'px';
            element.style.overflow = 'hidden';
            element.style.position = 'relative'; // Pour positionner le bouton si besoin plus tard
            element.style.transition = 'max-height 0.3s ease-out'; // Animation douce

            // Créer le bouton "Lire la suite"
            const readMoreBtn = document.createElement('button');
            readMoreBtn.textContent = 'Lire la suite...';
            readMoreBtn.classList.add('btn-read-more'); // Classe pour styler
            readMoreBtn.setAttribute('aria-expanded', 'false'); // Pour l'accessibilité

            // Ajouter un écouteur d'événement au bouton
            readMoreBtn.addEventListener('click', () => {
                const isExpanded = element.classList.toggle('expanded');
                readMoreBtn.setAttribute('aria-expanded', isExpanded.toString());

                if (isExpanded) {
                    // Étendre : enlever la limite de hauteur
                    element.style.maxHeight = element.scrollHeight + 'px';
                    readMoreBtn.textContent = 'Réduire';
                } else {
                    // Réduire : remettre la limite de hauteur
                    element.style.maxHeight = maxHeight + 'px';
                    readMoreBtn.textContent = 'Lire la suite...';
                    // Optionnel: remonter un peu pour voir le début
                    // element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            // Insérer le bouton APRES le paragraphe de contenu
            element.parentNode.insertBefore(readMoreBtn, element.nextSibling);
        }
         // Si l'élément est plus court que maxHeight mais avait un bouton (cas de resize fenêtre?), on l'enlève
         else if (element.scrollHeight <= maxHeight && element.nextElementSibling?.classList.contains('btn-read-more')) {
            element.nextElementSibling.remove();
            element.style.maxHeight = ''; // Enlever la contrainte
            element.style.overflow = '';
            element.classList.remove('expanded');
         }
    });
}


// --- SECTION ACTUALITÉS (Style Atelier) ---
function loadNewsPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="actualites">
      <h2>Les Dernières Notes</h2>
      <div id="news-container" class="grid"></div>
    </section>`;

  db.collection('news')
  .where('status', '==', 'Publié')   // ⇦ filtre
  .orderBy('date', 'desc')           // ⇦ tri
  .onSnapshot(snapshot => {
    const container = document.getElementById('news-container');
    if (!container) return; // Sécurité si la page a changé entre temps
    container.innerHTML = ''; // Vider avant de remplir

    if (snapshot.empty) {
      container.innerHTML = '<p>Aucune note d\'actualité pour le moment.</p>';
    } else {
      snapshot.forEach(doc => {
        const news = doc.data();
        news.id = doc.id; // Garder l'ID si besoin futur
        const newsItem = document.createElement('div');
        newsItem.classList.add('grid-item'); // Utilisation de la classe grid-item

          // --- NOUVEAU : Préparer le HTML du lien conditionnellement ---
        let linkHtml = ''; // Initialiser une chaîne vide
        if (news.link && typeof news.link === 'string' && news.link.trim() !== '') {
          // Si le champ 'link' existe, est une chaîne et n'est pas vide
          linkHtml = `
            <div class="news-link-container">
              <a href="${news.link}" target="_blank" rel="noopener noreferrer" class="news-link">
                Visiter le site <i class="fas fa-external-link-alt fa-xs"></i>
              </a>
            </div>
          `;
        }
        // --- FIN NOUVEAU ---
          
          newsItem.innerHTML = `
          ${news.image ? `<img src="${news.image}" alt="Illustration ${news.title}">` : ''}
          <h3>${news.title}</h3>
          <p class="news-content">${news.content}</p>
          ${linkHtml}
          <small>Noté le ${news.date} (${news.status || 'Publié'})</small>
        `;
        container.appendChild(newsItem);
      });
        
      // Paramètres: sélecteur du paragraphe, hauteur max en pixels
      applyReadMore('.news-content', 100); // Tronquer après 100px de hauteur
      // Appliquer la rotation APRES avoir ajouté les éléments
      applyRandomRotation('#actualites .grid-item');
    }
  }, error => {
    console.error("Erreur chargement notes d'actus:", error);
    if (document.getElementById('actualites')) { // Vérifier si on est toujours sur la page
        mainContent.innerHTML = '<p class="error-message">Impossible de récupérer les notes d\'actualités.</p>';
    }
  });
}

// --- SECTION MEMBRES (Style Atelier) ---
function loadMembersPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="membres">
      <h2>L'Équipe du CSE</h2>
      <div id="members-container" class="grid"></div>
    </section>`;

  db.collection('membres').orderBy('Nom', 'asc').onSnapshot(snapshot => {
    const container = document.getElementById('members-container');
     if (!container) return;
    container.innerHTML = ''; // Vider

    if (snapshot.empty) {
      container.innerHTML = '<p>L\'équipe n\'est pas encore affichée.</p>';
    } else {
      snapshot.forEach(doc => {
        const member = doc.data();
        member.id = doc.id;
        const memberCard = document.createElement('div');
        // Ajoute grid-item et la classe spécifique pour styles membres
        memberCard.classList.add('grid-item', 'member-card');

        const photoUrl = member.PhotoURL;
        const placeholderHtml = '<div class="member-placeholder"><i class="fas fa-user"></i></div>';

        memberCard.innerHTML = `
          ${photoUrl ? `<img src="${photoUrl}" alt="Portrait de ${member.Prenom}" class="member-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"> ${placeholderHtml.replace('style.display=\'flex\'', 'style.display=\'none\'')}` /* Affiche placeholder si erreur */
                     : placeholderHtml /* Affiche placeholder si pas d'URL */
          }
          <h4>${member.Prenom || ''} ${member.Nom || ''}</h4>
          <p class="member-role">${member.Role || 'Membre'}</p>
          <p class="member-operation">Op: ${member.Operation || '?'}</p>
        `;
        container.appendChild(memberCard);
      });
      // Appliquer la rotation APRES avoir ajouté les éléments
      applyRandomRotation('#membres .grid-item');
    }
  }, error => {
    console.error("Erreur chargement équipe:", error);
     if (document.getElementById('membres')) {
        mainContent.innerHTML = '<p class="error-message">Impossible d\'afficher l\'équipe.</p>';
     }
  });
}

// --- SECTION PARTENAIRES (Style Atelier) ---
function loadPartnersPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="partenaires">
      <h2>Nos Partenaires & Bons Plans</h2>
      <div id="partners-container"></div>
    </section>`;

  db.collection('partenaires') // <-- Vérifie que le nom 'partenaires' est EXACTEMENT celui dans Firestore
    .orderBy('Categorie', 'asc')
    .orderBy('Nom', 'asc')
    .onSnapshot(snapshot => {
      const container = document.getElementById('partners-container');
      if (!container) {
          console.error("ERREUR: Conteneur #partners-container introuvable !");
          return; // Arrêter si le conteneur n'existe plus
      }
      console.log('[Partners] Snapshot reçu. Empty?', snapshot.empty, 'Size:', snapshot.size); // Debug log

      container.innerHTML = ''; // Vider avant de remplir

      if (snapshot.empty) {
        console.log('[Partners] Aucun partenaire trouvé dans la collection.'); // Debug log
        container.innerHTML = '<p>Aucun partenaire à afficher pour le moment.</p>';
      } else {
        const partnersByCategory = {};
        snapshot.forEach(doc => {
          const partner = doc.data();
          partner.id = doc.id;
          console.log('[Partners] Traitement partenaire:', partner.Nom, partner); // Debug log - Voir les données
          const category = partner.Categorie || 'Divers'; // Catégorie par défaut si manquante
          if (!partnersByCategory[category]) {
            partnersByCategory[category] = [];
          }
          partnersByCategory[category].push(partner);
        });
        console.log('[Partners] Partenaires groupés:', partnersByCategory); // Debug log

        // Afficher par catégorie
        let hasItems = false; // Pour vérifier si on ajoute au moins un item
        for (const category in partnersByCategory) {
          // Création titre catégorie
          const categoryTitle = document.createElement('h3');
          categoryTitle.textContent = category;
          container.appendChild(categoryTitle);

          // Création grille pour cette catégorie
          const gridContainer = document.createElement('div');
          gridContainer.classList.add('grid');
          container.appendChild(gridContainer);

          partnersByCategory[category].forEach(partner => {
            hasItems = true; // On a trouvé au moins un partenaire
            const partnerCard = document.createElement('div');
            partnerCard.classList.add('grid-item', 'partner-card');

            // --- LOGIQUE LOGO/PLACEHOLDER CORRIGÉE ---
            let logoElementHtml = '';
            const logoUrl = partner.Logo; // Récupère la valeur (peut être undefined, null, ou une URL)
            const placeholderHtml = `<div class="partner-logo-placeholder"><i class="fas fa-store"></i></div>`; // Placeholder par défaut

            if (logoUrl) {
              // Si une URL de logo est fournie, on crée la balise img
              // On ajoute aussi un placeholder caché qui s'affichera si l'image ne charge pas (onerror)
              logoElementHtml = `
                <img src="${logoUrl}"
                     alt="Logo ${partner.Nom || 'Partenaire'}"
                     class="partner-logo"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="partner-logo-placeholder partner-logo-placeholder-fallback" style="display: none;">
                    <i class="fas fa-image-slash"></i>
                </div>`;
            } else {
              // Si pas d'URL de logo, on affiche directement le placeholder par défaut
              logoElementHtml = placeholderHtml;
            }
            // --- FIN LOGIQUE LOGO/PLACEHOLDER ---

            partnerCard.innerHTML = `
              ${logoElementHtml}
              <h4>${partner.Nom || '?'}</h4>
              <p class="partner-description">${partner.Description || 'Avantage ou réduction.'}</p>
              ${partner.Lien ? `<div class="partner-link"><a href="${partner.Lien}" target="_blank" rel="noopener noreferrer">Visiter <i class="fas fa-external-link-alt fa-xs"></i></a></div>` : ''}
            `;
            gridContainer.appendChild(partnerCard);
          }); // Fin forEach partner
        } // Fin for category

        // Appliquer la rotation SEULEMENT si des éléments ont été ajoutés
        if (hasItems) {
          console.log('[Partners] Application de la rotation aux grid-items.'); // Debug log
          applyRandomRotation('#partenaires .grid-item');
        } else {
            console.log('[Partners] Aucun grid-item partenaire ajouté, pas de rotation appliquée.');
        }

      } // Fin else snapshot not empty
    }, error => {
      // Erreur Firebase
      console.error("[Partners] Erreur Firestore:", error);
      if (document.getElementById('partenaires')) { // Vérifier si on est toujours sur la bonne page
          mainContent.innerHTML = '<p class="error-message">Oups ! Impossible de charger les partenaires pour le moment. Détails dans la console.</p>';
      }
    }); // Fin onSnapshot
}

// --- SECTION FORMULAIRE CAFÉ ---
function loadCoffeeFormPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="formulaire-cafe">
      <h2><i class="fas fa-mug-hot"></i> Signaler un souci Café</h2>
      <div class="form-container">
        <form id="coffeeForm">
          <p class="note">Un problème avec une machine ? Décrivez-le ici.</p>

          <div class="form-group">
            <label for="coffee-email" class="required">Votre Email</label>
            <input type="email" id="coffee-email" required placeholder="nom.prenom@example.com">
          </div>

          <div class="form-group">
            <label for="coffee-name" class="required">Votre Nom & Prénom</label>
            <input type="text" id="coffee-name" required placeholder="Jean Dupont">
          </div>

          <div class="form-group">
            <label for="coffee-phone">Téléphone</label>
            <input type="tel" id="coffee-phone" placeholder="+33 6 12 34 56 78">
          </div>

          <div class="form-group">
            <label for="coffee-operation" class="required">Votre Opération</label>
            <select id="coffee-operation" required>
              <option value="" disabled selected>Choisir…</option>
          <option value="Support">Fonction support</option>
          <option value="AG2R">AG2R</option>
          <option value="CNAV">CNAV</option>
          <option value="UCPA">UCPA</option>
          <option value="IRP Auto">IRP Auto</option>
          <option value="Abeille">Abeille</option>
          <option value="EHS">EHS</option>
          <option value="DCP">Engie DCP</option>
          <option value="Enedis">Enedis</option>
            </select>
          </div>

          <div class="form-group">
            <label for="coffee-machine" class="required">Machine concernée</label>
            <select id="coffee-machine" required>
              <option value="" disabled selected>Identifier la machine…</option>
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
            <label for="coffee-problem" class="required">Nature du problème</label>
            <select id="coffee-problem" required>
              <option value="" disabled selected>Décrire le souci…</option>
          <option value="Pas de gobelet">Pas de gobelet</option>
          <option value="Gobelet vide/Boisson non servie">Gobelet vide / Boisson non servie</option>
          <option value="Produit non conforme">Produit non conforme</option>
          <option value="Problème de paiement/rechargement">Problème de paiement / rechargement</option>
          <option value="Machine bloquée/Hors service">Machine bloquée / Hors service</option>
          <option value="Fuite/Propreté">Fuite / Propreté</option>
          <option value="Autre">Autre</option>
            </select>
          </div>

          <div class="form-group">
            <label for="coffee-date">Date</label>
            <input type="date" id="coffee-date">
          </div>

          <div class="form-group">
            <label for="coffee-time">Heure approx.</label>
            <input type="time" id="coffee-time">
          </div>

          <div class="form-group">
            <label for="coffee-payment">Moyen de paiement</label>
            <select id="coffee-payment">
              <option value="" disabled selected>Choisir…</option>
          <option value="Pluxee">Carte Pluxee</option>
          <option value="Espece">Espèces</option>
          <option value="Badge">Badge interne</option>
          <option value="CB">Carte Bancaire</option>
            </select>
          </div>

          <div class="form-group">
            <label for="coffee-comment">Commentaire (optionnel)</label>
            <textarea id="coffee-comment" placeholder="Ajoutez des détails si nécessaire…"></textarea>
          </div>

          <button type="submit" id="coffee-submit-btn" class="btn btn-primary">Envoyer le signalement</button>
        </form>

        <div id="coffee-status" class="form-status-sending"><i class="fas fa-paper-plane"></i> Envoi en cours…</div>
        
        
        
        <div id="coffee-confirmation" class="confirmation"><i class="fas fa-check-circle"></i> Merci ! Signalement transmis.</div>
        <div id="coffee-error" class="error-message"></div>
      <!-- Procédure de remboursement -->
        <aside id="refund-procedure" class="refund-box">
          <h3><i class="fas fa-euro-sign"></i> Procédure de remboursement</h3>
        
          <ol>
            <li>Télécharge l’application&nbsp;
                <a href="https://lydia-app.com/pro" target="_blank" rel="noopener">Lydia Pro</a>.</li>
            <li>Remplis le formulaire en ligne</li>
<li>Une fois par semaine, on envoie toutes les demandes au SAV de MaxiCoffee.</li>
<li>Le SAV te contacte directement pour faire le remboursement uniquement via Lydia Pro.</li>
           
          </ol>
        
          <img src="img/InfogCoffee.png"
               alt="Remboursement – CSE CRM59"
               class="refund-qr">
        
          
        </aside>
      </div>
    </section>`;

  /* === Soumission === */
  const coffeeForm = document.getElementById('coffeeForm');
  const submitBtn  = document.getElementById('coffee-submit-btn');
  const statusDiv  = document.getElementById('coffee-status');
  const confirmDiv = document.getElementById('coffee-confirmation');
  const errorDiv   = document.getElementById('coffee-error');

  coffeeForm.addEventListener('submit', e => {
    e.preventDefault();
    statusDiv.style.display = 'block';
    confirmDiv.style.display = 'none';
    errorDiv.style.display   = 'none';
    submitBtn.disabled = true;

    const data = {
      email  : document.getElementById('coffee-email').value.trim(),
      nom    : document.getElementById('coffee-name').value.trim(),
      telephone: document.getElementById('coffee-phone').value.trim(),
      operation: document.getElementById('coffee-operation').value,
      machine  : document.getElementById('coffee-machine').value,
      probleme : document.getElementById('coffee-problem').value,
      dateEvenementRaw : document.getElementById('coffee-date').value || null,
      heureEvenementRaw: document.getElementById('coffee-time').value || null,
      paiement : document.getElementById('coffee-payment').value || null,
      commentaire: document.getElementById('coffee-comment').value.trim(),
      importTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'en cours'
    };

    /* 1️⃣ Enregistrer dans Firestore */
    db.collection('coffee').add(data)
      /* 2️⃣ Envoyer l’e-mail */
      .then(() => {
        return emailjs.send('Coffee_Id', 'template_Coffee', {
          reply_to          : data.email,
          nom               : data.nom,
          telephone         : data.telephone || '—',
          machine           : data.machine,
          probleme          : data.probleme,
          operation         : data.operation,
          dateEvenementRaw  : data.dateEvenementRaw || '—',
          heureEvenementRaw : data.heureEvenementRaw || '—',
          paiement          : data.paiement || '—',
          commentaire       : data.commentaire || '—'
        });
      })
      /* 3️⃣ Success */
      .then(() => {
        statusDiv.style.display = 'none';
        confirmDiv.style.display = 'block';
        coffeeForm.reset();
        submitBtn.disabled = false;
      })
      /* 🔴 Erreurs */
      .catch(err => {
        console.error('Erreur:', err.status || '', err.text || err);
        statusDiv.style.display = 'none';
        errorDiv.textContent = 'Erreur : ' + (err.text || 'envoi impossible, réessayez.');
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
      });
  });
}


// --- SECTION FORMULAIRE CONTACT (Adapté Style Atelier) ---
// --- SECTION FORMULAIRE CONTACT (mise à jour) ---
function loadContactFormPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <section id="formulaire-contact">
      <h2><i class="fas fa-pencil-alt"></i> Écrire au CSE</h2>
      <div class="form-container">
        <form id="contactForm">
          <p class="note">Besoin d'une clé café, d'une carte cadeau ou autre ? Laissez-nous un mot.</p>

          <div class="form-group">
            <label for="contact-name" class="required">Votre Nom & Prénom</label>
            <input type="text" id="contact-name" required placeholder="Marie Durand" />
          </div>

          <div class="form-group">
            <label for="contact-email" class="required">Votre Email</label>
            <input type="email" id="contact-email" required placeholder="marie.durand@example.com" />
          </div>

          <div class="form-group">
            <label for="contact-operation" class="required">Votre Opération</label>
            <select id="contact-operation" required>
              <option value="" disabled selected>Choisir…</option>
              <option value="Support">Fonction support</option><option value="AG2R">AG2R</option>
              <option value="CNAV">CNAV</option><option value="UCPA">UCPA</option>
              <option value="IRP Auto">IRP Auto</option><option value="Abeille">Abeille</option>
              <option value="EHS">EHS</option><option value="DCP">Engie DCP</option>
              <option value="Enedis">Enedis</option>
            </select>
          </div>

          <div class="form-group">
            <label>Objet de la demande (cochez)</label>
            <div class="checkbox-group">
              <label class="checkbox-label"><input type="checkbox" name="demande" value="Clé café" /> Clé café (caution 7 €)</label>
              <label class="checkbox-label"><input type="checkbox" name="demande" value="Carte AccèsCE" /> Carte AccèsCE</label>
              <label class="checkbox-label"><input type="checkbox" name="demande" value="Carte cadeau naissance" /> Carte cadeau naissance</label>
              <label class="checkbox-label"><input type="checkbox" name="demande" value="Carte cadeau mariage/pacs" /> Carte cadeau mariage / pacs</label>
              <label class="checkbox-label"><input type="checkbox" name="demande" value="Carte cadeau retraite" /> Carte cadeau retraite</label>
              <label class="checkbox-label"><input type="checkbox" name="demande" value="Autre" /> Autre (préciser ci-dessous)</label>
            </div>
          </div>

          <div class="form-group">
            <label for="contact-message">Votre Message / Précisions</label>
            <textarea id="contact-message" rows="4" placeholder="Si « Autre » ou pour donner plus de détails…"></textarea>
          </div>

          <button type="submit" id="contact-submit-btn" class="btn btn-primary">Envoyer la note</button>
        </form>

        <div id="contact-status" class="form-status-sending"><i class="fas fa-paper-plane"></i> Transmission en cours…</div>
        <div id="contact-confirmation" class="confirmation"><i class="fas fa-check-circle"></i> C'est noté ! Votre message a été envoyé.</div>
        <div id="contact-error" class="error-message"></div>
      </div>
    </section>`;

  /* === Soumission === */
  const contactForm = document.getElementById('contactForm');
  const submitBtn   = document.getElementById('contact-submit-btn');
  const statusDiv   = document.getElementById('contact-status');
  const confirmDiv  = document.getElementById('contact-confirmation');
  const errorDiv    = document.getElementById('contact-error');

    contactForm.querySelectorAll('input[type="checkbox"]').forEach(cb => {
  // état initial (utile si tu coches/décoches via auto-remplissage)
  cb.parentNode.classList.toggle('is-checked', cb.checked);

  cb.addEventListener('change', e => {
    e.target.parentNode.classList.toggle('is-checked', e.target.checked);
  });
});
    
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    // Récupère les demandes cochées
    const demandesCochees = [...contactForm.querySelectorAll('input[name=\"demande\"]:checked')]
                            .map(el => el.value);

    if (demandesCochees.length === 0) {
      errorDiv.textContent = 'Veuillez cocher au moins un objet de demande.';
      errorDiv.classList.add('show');
      return;
    }

    statusDiv.style.display  = 'block';
    confirmDiv.style.display = 'none';
    errorDiv.classList.remove('show');
    submitBtn.disabled = true;

    const data = {
      name      : document.getElementById('contact-name').value.trim(),
      email     : document.getElementById('contact-email').value.trim(),
      operation : document.getElementById('contact-operation').value,
      demande   : demandesCochees,
      message   : document.getElementById('contact-message').value.trim(),
      timestamp : firebase.firestore.FieldValue.serverTimestamp(),
      status    : 'en cours'
    };

    /* 1️⃣ Firestore */
    db.collection('contact').add(data)
      /* 2️⃣ EmailJS */
      .then(() => {
        return emailjs.send('Coffee_Id', 'template_contact', {
          name      : data.name,
          email     : data.email,
          operation : data.operation,
          demande   : data.demande.join(', '),
          message   : data.message || '—'
        });
      })
      /* 3️⃣ Succès */
      .then(() => {
        statusDiv.style.display = 'none';
        confirmDiv.style.display = 'block';
        contactForm.reset();
        submitBtn.disabled = false;
      })
      /* 🔴 Erreurs */
      .catch(err => {
        console.error('Erreur:', err.status || '', err.text || err);
        statusDiv.style.display = 'none';
        errorDiv.textContent = 'Erreur : ' + (err.text || 'Envoi impossible.');
        errorDiv.classList.add('show');
        submitBtn.disabled = false;
      });
  });
}


// --- SECTION ACCÈSCE (Dynamique depuis Firestore) ---
function loadAccescePage() {
  const mainContent = document.getElementById('main-content');
  // Structure de base de la page avec titre et conteneur
  mainContent.innerHTML = `
    <section id="accesce">
      <h2><i class="fas fa-ticket-alt"></i> AccèsCE - Vos Avantages</h2>
     
      <div id="accesce-container" class="content-page">
        <p class="loading-message"><i class="fas fa-spinner fa-spin"></i> Chargement des avantages...</p>
      </div>
    </section>`;

  const container = document.getElementById('accesce-container');

  // Récupération des données depuis Firestore
  db.collection('accesce')
    // Optionnel: Ajouter un .orderBy() si vous avez un champ pour l'ordre (ex: .orderBy('order', 'asc'))
    .onSnapshot(snapshot => {
      // Vérifier si le conteneur existe toujours (au cas où l'utilisateur navigue ailleurs rapidement)
      if (!container) return;

      container.innerHTML = ''; // Vider le message de chargement ou l'ancien contenu

      if (snapshot.empty) {
        console.log('[AccesCE] Aucun document trouvé dans la collection.');
        container.innerHTML = '<p>Aucune information AccèsCE disponible pour le moment.</p>';
      } else {
        console.log(`[AccesCE] ${snapshot.size} document(s) trouvé(s).`);
        // Parcourir chaque document trouvé
        snapshot.forEach(doc => {
          const data = doc.data();
          const descriptionHtml = data.description; // Récupérer le champ 'description'

          if (descriptionHtml && typeof descriptionHtml === 'string') {
            // Ajouter directement le contenu HTML du champ 'description' au conteneur
            // IMPORTANT: Assurez-vous que le HTML stocké dans Firestore est sûr !
            container.innerHTML += descriptionHtml;
          } else {
            console.warn(`[AccesCE] Document ${doc.id} n'a pas de champ 'description' valide.`);
            // Optionnel : afficher un message d'erreur ou ignorer ce document
          }
        });

        // IMPORTANT: Si votre HTML contient des éléments interactifs (boutons avec onclick généré par JS),
        // il faut ré-attacher les écouteurs d'événements ici.
        rebindDynamicButtonsIfNeeded('#accesce-container');

      }
    }, error => {
      // Gérer les erreurs Firestore
      console.error("[AccesCE] Erreur Firestore:", error);
      if (document.getElementById('accesce')) { // Vérifier si on est toujours sur la bonne page
          container.innerHTML = '<p class="error-message">Oups ! Impossible de charger les informations AccèsCE. Réessayez plus tard.</p>';
      }
    });
}

// --- FONCTION UTILITAIRE POUR RÉ-ATTACHER LES ÉCOUTEURS (Exemple) ---
// À appeler après avoir injecté du HTML dynamique qui contient des éléments cliquables
function rebindDynamicButtonsIfNeeded(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Exemple: si vous avez des boutons générés avec la classe 'inline-link-button' pour contacter
    container.querySelectorAll('button.inline-link-button').forEach(button => {
        // Vérifier si l'écouteur n'est pas déjà attaché pour éviter les doublons
        if (!button.dataset.listenerAttached) {
             // Vérifier quel onclick est prévu (peut être stocké dans data-action ou analysé)
             if (button.getAttribute('onclick') && button.getAttribute('onclick').includes("loadPage('formulaire-contact')")) {
                 button.addEventListener('click', (e) => {
                     e.preventDefault(); // Bonne pratique
                     loadPage('formulaire-contact');
                 });
                 button.dataset.listenerAttached = 'true'; // Marquer comme attaché
                 console.log('[Rebind] Écouteur ajouté au bouton contact inline.');
             }
             // Ajouter d'autres conditions pour d'autres types de boutons dynamiques si nécessaire
        }
    });

     // Exemple pour les liens d'action (si générés dynamiquement)
     container.querySelectorAll('a.action-button').forEach(link => {
        if (!link.dataset.listenerAttached && link.href) { // Vérifie qu'il a un href
            // Pas forcément besoin d'ajouter un listener JS si c'est un lien externe standard
            // Mais on pourrait vouloir tracker le clic ou autre
             link.dataset.listenerAttached = 'true';
        }
     });
}

// --- SECTION ACTION LOGEMENT (Dynamique depuis Firestore) ---
function loadActionLogementPage() {
  const mainContent = document.getElementById('main-content');
  // Structure de base de la page avec titre et conteneur
  mainContent.innerHTML = `
    <section id="action-logement">
      <h2><i class="fas fa-house-user"></i> Action Logement</h2>
      
      <div id="action-logement-container" class="content-page">
        <p class="loading-message"><i class="fas fa-spinner fa-spin"></i> Chargement des informations...</p>
      </div>
    </section>`;

  const container = document.getElementById('action-logement-container');

  // Récupération des données depuis Firestore
  db.collection('actionLogement') // <-- Nom de la collection
    // Optionnel: Ajouter un .orderBy() si besoin (ex: .orderBy('order', 'asc'))
    .onSnapshot(snapshot => {
      // Vérifier si le conteneur existe toujours
      if (!container) return;

      container.innerHTML = ''; // Vider le message de chargement ou l'ancien contenu

      if (snapshot.empty) {
        console.log('[ActionLogement] Aucun document trouvé.');
        container.innerHTML = '<p>Aucune information Action Logement disponible pour le moment.</p>';
      } else {
        console.log(`[ActionLogement] ${snapshot.size} document(s) trouvé(s).`);
        // Parcourir chaque document trouvé
        snapshot.forEach(doc => {
          const data = doc.data();
          const contentHtml = data.content; // <-- Récupérer le champ 'content'

          if (contentHtml && typeof contentHtml === 'string') {
            // Ajouter directement le contenu HTML du champ 'content' au conteneur
            // IMPORTANT: Assurez-vous que le HTML stocké dans Firestore est sûr !
            container.innerHTML += contentHtml;
          } else {
            console.warn(`[ActionLogement] Document ${doc.id} n'a pas de champ 'content' valide.`);
          }
        });

        // Ré-attacher les écouteurs si le contenu dynamique contient des boutons, etc.
        rebindDynamicButtonsIfNeeded('#action-logement-container');

      }
    }, error => {
      // Gérer les erreurs Firestore
      console.error("[ActionLogement] Erreur Firestore:", error);
      if (document.getElementById('action-logement')) { // Vérifier si on est toujours sur la bonne page
          container.innerHTML = '<p class="error-message">Oups ! Impossible de charger les informations Action Logement. Réessayez plus tard.</p>';
      }
    });
}

// --- N'OUBLIEZ PAS LA FONCTION rebindDynamicButtonsIfNeeded SI NÉCESSAIRE ---
// (Elle est identique à celle fournie précédemment pour AccesCE)
function rebindDynamicButtonsIfNeeded(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.querySelectorAll('button.inline-link-button').forEach(button => {
        if (!button.dataset.listenerAttached) {
             if (button.getAttribute('onclick') && button.getAttribute('onclick').includes("loadPage('formulaire-contact')")) {
                 button.addEventListener('click', (e) => {
                     e.preventDefault();
                     loadPage('formulaire-contact');
                 });
                 button.dataset.listenerAttached = 'true';
                 console.log('[Rebind] Écouteur ajouté au bouton contact inline.');
             }
             // ... autres boutons dynamiques ...
        }
    });

     container.querySelectorAll('a.action-button').forEach(link => {
        if (!link.dataset.listenerAttached && link.href) {
             link.dataset.listenerAttached = 'true';
        }
     });
}

// --- GESTION PWA INSTALL PROMPT ---
let deferredPrompt;
const installButton = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt déclenché');
  // Empêcher Chrome 67 et versions antérieures d'afficher automatiquement la demande
  e.preventDefault();
  // Mémoriser l'événement pour pouvoir le déclencher plus tard.
  deferredPrompt = e;
  // Afficher notre bouton d'installation personnalisé
  if(installButton) installButton.style.display = 'inline-block'; // Afficher le bouton
});

if(installButton) {
    installButton.addEventListener('click', async () => {
      // Cacher notre bouton, l'utilisateur ne peut pas l'utiliser deux fois.
      installButton.style.display = 'none';
      if (deferredPrompt) {
        // Afficher la demande d'installation
        deferredPrompt.prompt();
        // Attendre la réponse de l'utilisateur
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Résultat installation PWA: ${outcome}`);
        // Réinitialiser deferredPrompt, car prompt() ne peut être appelé qu'une fois.
        deferredPrompt = null;
      } else {
         console.log("deferredPrompt est null, impossible d'afficher la demande.");
      }
    });
}

window.addEventListener('appinstalled', () => {
  console.log('PWA installée');
     incrementAnalyticsCounter('totalInstalls');
  // Cacher le bouton d'installation si l'application est installée
  if(installButton) installButton.style.display = 'none';
  deferredPrompt = null;
});

// --- GESTION BOUTON MISE À JOUR (via SW) ---
const updateButton = document.getElementById('update-button');
if (updateButton) {
    updateButton.addEventListener('click', () => {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (!reg) return location.reload();

    reg.update().then(() => {
      if (reg.waiting) {
        reg.waiting.postMessage({type:'SKIP_WAITING'});
      } else if (reg.installing) {
        reg.installing.addEventListener('statechange', e => {
          if (e.target.state === 'installed' && reg.waiting) {
            reg.waiting.postMessage({type:'SKIP_WAITING'});
          }
        });
      }
    });
  });
});
}


// --- CHARGEMENT INITIAL & ROTATION MENU ---
window.addEventListener('DOMContentLoaded', () => {
  console.log("DOM Atelier prêt.");
  incrementAnalyticsCounter('totalViews');
    loadPage('actualites'); // Charger la page d'accueil par défaut
  applyRandomRotation('.menu-item'); // Appliquer la rotation initiale au menu
});
