// URL du CSV
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQcKo9WOqdnefe5z7QpaM5XtdkGs7pBeWNFrcy1crwW18Jn_KkR1IxV_KMhatedR5lmaASfeIlEsUF9/pub?output=csv';

// S'assurer que le menu est fermé au démarrage
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    sidebar.classList.remove('active');
    hamburger.classList.remove('active');
    loadPage('actualites'); // Charger les actualités par défaut
});

// Fonction pour ouvrir/fermer le menu hamburger
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    sidebar.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Fonction pour charger une page dynamiquement
function loadPage(page) {
    const mainContent = document.getElementById('main-content');
    toggleMenu(); // Ferme le menu après un clic

    if (page === 'actualites') {
        mainContent.innerHTML = `
            <section id="actualites">
                <h2>Dernières Actualités</h2>
                <div id="news-container"></div>
            </section>
        `;
        loadNews();
    } else if (page === 'formulaire-cafe') {
        mainContent.innerHTML = `
            <section id="formulaire-cafe">
                <div class="form-container">
                    <h2>Signalement Problème Machine à Café</h2>
                    <form id="reportForm" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfw2H0lzEAvt7niVxRhpkPQTLOaOfXz3SoI3IC9NfNxnY33Ag/formResponse" method="POST" target="hidden_iframe">
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
                    <div id="confirmation" class="confirmation">
                        Merci pour votre signalement ! Il a bien été enregistré.
                    </div>
                </div>
                <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
            </section>
        `;
        attachFormEvents('reportForm');
    } else if (page === 'formulaire-contact') {
        mainContent.innerHTML = `
            <section id="formulaire-contact">
                <div class="form-container">
                    <h2>Formulaire de Contact</h2>
                    <form id="contactForm" action="URL_GOOGLE_FORM" method="POST" target="hidden_iframe">
                        <div class="form-group">
                            <label for="name" class="required">Nom</label>
                            <input type="text" id="name" name="entry.XXXXXXXXXX1" required>
                        </div>
                        <div class="form-group">
                            <label for="email" class="required">Email</label>
                            <input type="email" id="email" name="entry.XXXXXXXXXX2" required>
                        </div>
                        <div class="form-group">
                            <label for="subject" class="required">Sujet</label>
                            <input type="text" id="subject" name="entry.XXXXXXXXXX3" required>
                        </div>
                        <div class="form-group">
                            <label for="message" class="required">Message</label>
                            <textarea id="message" name="entry.XXXXXXXXXX4" required></textarea>
                        </div>
                        <button type="submit">Envoyer le message</button>
                    </form>
                    <div id="confirmation" class="confirmation">
                        Merci pour votre message ! Il a bien été envoyé.
                    </div>
                </div>
                <iframe name="hidden_iframe" style="display: none;" onload="onFormSubmit()"></iframe>
            </section>
        `;
        attachFormEvents('contactForm');
    } else if (page === 'partenaires') {
        mainContent.innerHTML = `
            <section id="partenaires">
                <h2>Nos Partenaires</h2>
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
            </section>
        `;
    }
}

// Fonction pour attacher les événements aux formulaires
function attachFormEvents(formId) {
    const form = document.getElementById(formId);
    form.addEventListener("submit", function(event) {
        const commentField = form.querySelector('textarea');
        if (commentField && !commentField.value) {
            commentField.value = "";
        }
    });
}

// Fonction pour gérer l'événement onload de l'iframe
function onFormSubmit() {
    const form = document.querySelector('form');
    const confirmation = document.getElementById("confirmation");
    form.style.display = "none";
    confirmation.style.display = "block";
    
    setTimeout(() => {
        form.reset();
        form.style.display = "block";
        confirmation.style.display = "none";
    }, 3000);
}

// Fonction pour charger les actualités
function loadNews() {
    fetch(csvUrl)
        .then(response => {
            console.log('Statut de la réponse:', response.status);
            if (!response.ok) {
                throw new Error('Erreur réseau : ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            console.log('Contenu brut du CSV:', data);
            const parsedData = Papa.parse(data, { header: true }).data;
            console.log('Données parsées:', parsedData);
            if (parsedData.length === 0) {
                throw new Error('Aucune donnée trouvée dans le CSV');
            }
            displayNews(parsedData);
        })
        .catch(error => {
            console.error('Erreur:', error);
            document.getElementById('news-container').innerHTML = '<p class="error-message">Erreur lors du chargement des actualités : ' + error.message + '</p>';
        });
}

// Afficher les actualités
function displayNews(news) {
    const container = document.getElementById('news-container');
    container.innerHTML = '';
    news.forEach(item => {
        const imageUrl = item['Lien_image'] || '';
        console.log(`Tentative de chargement de l'image: ${imageUrl}`);
        const newsItem = document.createElement('div');
        newsItem.className = 'actu';
        newsItem.innerHTML = `
            <h3>${item.Titre || 'Sans titre'}</h3>
            <p><strong>Date :</strong> ${item.Date || 'Non spécifiée'}</p>
            <p>${item.Description || 'Aucune description'}</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="${item.Titre || 'Image actualité'}" onerror="this.style.display='none'; this.nextSibling.style.display='block';">
                          <p class="error-message" style="display: none;">Impossible de charger l'image.</p>` : ''}
        `;
        container.appendChild(newsItem);
    });
}
