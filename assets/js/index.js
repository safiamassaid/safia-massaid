document.addEventListener("DOMContentLoaded", () => {
    const radios = document.querySelectorAll('input[name="tab-control"]');
    const contents = document.querySelectorAll(".tab-content");

    // Valeurs par tab (Active / Index)
    const activeStats = {
        tab1: 40, // Dev Web
        tab2: 16, // UI/UX

    };

    const totalCountEl = document.getElementById("total-count");
    const filteredCountEl = document.getElementById("filtered-count");

    function switchTab(tabId) {
        // 1. Cacher tous les contenus
        contents.forEach((content) => {
            content.classList.remove("show");
            content.style.display = "none";
        });

        // 2. Afficher le contenu correspondant
        const targetClass = `.tab-content-${tabId.replace("tab", "")}`;
        const activeContent = document.querySelector(targetClass);
        if (activeContent) {
            activeContent.style.display = "block";
            setTimeout(() => activeContent.classList.add("show"), 10);
        }

        // 3. Mettre à jour le compteur Active / Index selon la tab
        const value = activeStats[tabId] || 0;
        if (filteredCountEl) filteredCountEl.textContent = value;

        // 4. Recalculer le total (somme de toutes les valeurs)
        const total = Object.values(activeStats).reduce((a, b) => a + b, 0);
        if (totalCountEl) totalCountEl.textContent = total;
    }

    // Écouter le clic sur chaque radio
    radios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
            switchTab(e.target.id);
        });
    });

    // Initialisation au chargement
    const checkedRadio = document.querySelector('input[name="tab-control"]:checked');
    if (checkedRadio) switchTab(checkedRadio.id);


});


document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('dynamic-portfolio-modal');
    const modalImg = document.getElementById('modal-image-target');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !modalImg || !modalContent) return;

    // 1. On écoute TOUS les clics sur les boutons de zoom
    document.addEventListener('click', (e) => {
        // On cherche si l'élément cliqué ou son parent est un bouton de preview
        const trigger = e.target.closest('.preview-link');

        if (trigger) {
            e.preventDefault();
            const imgSrc = trigger.getAttribute('href'); // Récupère le lien de l'image

            // On injecte l'image et on affiche la modale
            modalImg.src = imgSrc;
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Bloque le scroll

            // Petite animation d'entrée
            setTimeout(() => {
                modalContent.classList.replace('scale-95', 'scale-100');
            }, 10);
        }
    });
});

// Fonction pour fermer
function closePortfolioModal() {
    const modal = document.getElementById('dynamic-portfolio-modal');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !modalContent) return;

    modalContent.classList.replace('scale-100', 'scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Réactive le scroll
    }, 200);
}
// ===== DOC TABS =====
function switchDocTab(tab) {
    const pm = document.getElementById('docs-pm');
    const qa = document.getElementById('docs-qa');
    const tabPm = document.getElementById('tab-pm');
    const tabQa = document.getElementById('tab-qa');

    if (tab === 'pm') {
        pm.style.display = 'grid';
        qa.style.display = 'none';

        tabPm.className = 'doc-tab px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider border transition-all bg-white text-primary border-primary';
        tabQa.className = 'doc-tab px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider border transition-all bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary';

    } else {
        pm.style.display = 'none';
        qa.style.display = 'grid';

        tabQa.className = 'doc-tab px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider border transition-all bg-white text-primary border-primary';
        tabPm.className = 'doc-tab px-5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider border transition-all bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary';
    }
}