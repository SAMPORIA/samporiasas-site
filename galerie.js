/* Agrandissement des captures d'écran.
   Aucune bibliothèque, aucun suivi, aucune donnée envoyée. Sans ce script, chaque capture reste un simple lien vers l'image agrandie. */
(function () {
  'use strict';
  var liens = Array.prototype.slice.call(document.querySelectorAll('a.zoom'));
  if (!liens.length || typeof HTMLDialogElement === 'undefined') return;

  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.setAttribute('aria-label', 'Capture agrandie');
  dlg.innerHTML =
    '<div class="lb-barre">' +
      '<span class="lb-compteur" aria-live="polite"></span>' +
      '<div class="lb-boutons">' +
        '<button type="button" class="lb-taille">Taille réelle</button>' +
        '<button type="button" class="lb-ferme" aria-label="Fermer">Fermer ✕</button>' +
      '</div>' +
    '</div>' +
    '<div class="lb-scene">' +
      '<button type="button" class="lb-prec" aria-label="Capture précédente">‹</button>' +
      '<div class="lb-zone"><img class="lb-img" alt=""></div>' +
      '<button type="button" class="lb-suiv" aria-label="Capture suivante">›</button>' +
    '</div>' +
    '<div class="lb-pied"><p class="lb-legende"></p><p class="lb-aide">Touchez « Taille réelle » ou pincez l’image pour lire les détails.</p></div>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('.lb-img');
  var zone = dlg.querySelector('.lb-zone');
  var legende = dlg.querySelector('.lb-legende');
  var compteur = dlg.querySelector('.lb-compteur');
  var btnTaille = dlg.querySelector('.lb-taille');
  var btnPrec = dlg.querySelector('.lb-prec');
  var btnSuiv = dlg.querySelector('.lb-suiv');
  var groupe = [];
  var index = 0;
  var origine = null;

  function groupeDe(lien) {
    var parent = lien.closest('article.projet, section.product, .hero') || document.body;
    return Array.prototype.slice.call(parent.querySelectorAll('a.zoom'));
  }

  function precharger(i) {
    if (groupe[i]) { var p = new Image(); p.src = groupe[i].href; }
  }

  function afficher(i) {
    index = (i + groupe.length) % groupe.length;
    var lien = groupe[index];
    var vignette = lien.querySelector('img');
    var texte = vignette ? vignette.alt : '';
    dlg.classList.remove('plein');
    btnTaille.textContent = 'Taille réelle';
    img.alt = texte;
    img.src = lien.href;
    legende.textContent = texte;
    compteur.textContent = groupe.length > 1 ? (index + 1) + ' / ' + groupe.length : '';
    zone.scrollTop = 0;
    zone.scrollLeft = 0;
    var plusieurs = groupe.length > 1;
    btnPrec.hidden = !plusieurs;
    btnSuiv.hidden = !plusieurs;
    if (plusieurs) { precharger(index + 1); precharger(index - 1); }
  }

  function ouvrir(lien) {
    origine = lien;
    groupe = groupeDe(lien);
    afficher(groupe.indexOf(lien));
    document.documentElement.classList.add('lb-ouvert');
    dlg.showModal();
  }

  function basculerTaille() {
    var plein = dlg.classList.toggle('plein');
    btnTaille.textContent = plein ? 'Ajuster à l’écran' : 'Taille réelle';
    zone.scrollTop = 0;
    zone.scrollLeft = 0;
  }

  liens.forEach(function (lien) {
    lien.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; /* ouverture dans un nouvel onglet : on laisse faire */
      e.preventDefault();
      ouvrir(lien);
    });
  });

  dlg.querySelector('.lb-ferme').addEventListener('click', function () { dlg.close(); });
  btnPrec.addEventListener('click', function () { afficher(index - 1); });
  btnSuiv.addEventListener('click', function () { afficher(index + 1); });
  btnTaille.addEventListener('click', basculerTaille);
  img.addEventListener('click', basculerTaille);

  /* un clic à côté de l'image ferme la fenêtre */
  dlg.addEventListener('click', function (e) {
    var cible = e.target;
    if (cible === dlg || cible.classList.contains('lb-scene') || (cible === zone && !dlg.classList.contains('plein'))) dlg.close();
  });

  dlg.addEventListener('keydown', function (e) {
    if (groupe.length < 2) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); afficher(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); afficher(index + 1); }
  });

  /* balayage au doigt (hors mode « taille réelle », où l'on fait défiler l'image) */
  var x0 = null;
  zone.addEventListener('touchstart', function (e) { x0 = dlg.classList.contains('plein') ? null : e.touches[0].clientX; }, { passive: true });
  zone.addEventListener('touchend', function (e) {
    if (x0 === null || groupe.length < 2) return;
    var dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 60) afficher(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  dlg.addEventListener('close', function () {
    document.documentElement.classList.remove('lb-ouvert');
    img.removeAttribute('src');
    if (origine) origine.focus();
  });
})();
