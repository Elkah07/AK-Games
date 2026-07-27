(function () {
  "use strict";

  const RULES = {
    "Action ou Vérité": {
      intro: "À tour de rôle, une personne choisit entre une action à réaliser et une question à laquelle répondre.",
      steps: ["L’application désigne la personne qui joue.", "Elle choisit Action ou Vérité, puis découvre sa carte.", "Elle réalise l’action ou répond. Passer est toujours autorisé.", "Le téléphone passe ensuite à la personne suivante."],
      scoring: "Pas de score obligatoire : le but est de jouer et de faire vivre la soirée.",
      options: "Vous pouvez sélectionner les thèmes, le nombre de manches et ajouter le contenu adulte si l’option est activée.",
      comfort: "Aucune justification n’est demandée en cas de passage. Une action ne doit jamais mettre quelqu’un en danger ou mal à l’aise."
    },
    "Action ou Vérité +18": {
      intro: "La version adulte d’Action ou Vérité, avec des cartes plus intimes et plus osées.",
      steps: ["Une personne est désignée.", "Elle choisit Action ou Vérité.", "Elle découvre seule sa carte si l’écran est privé.", "Elle répond, réalise l’action ou passe sans pénalité."],
      scoring: "Aucun point n’est lié au niveau d’intimité ou au fait d’accepter une carte.",
      options: "Choisissez les thèmes et l’intensité avant de lancer la partie.",
      comfort: "Réservé aux adultes consentants. Le groupe respecte immédiatement un refus ou un passage."
    },
    "Qui de nous ?": {
      intro: "Tout le monde vote secrètement pour la personne qui correspond le mieux à la situation affichée.",
      steps: ["Une question est révélée.", "Chaque joueur vote sans montrer son choix.", "Les votes sont révélés ensemble.", "La question suivante démarre après les réactions du groupe."],
      scoring: "Le jeu peut se jouer sans gagnant. Les statistiques finales montrent surtout qui a été le plus souvent désigné.",
      options: "Choisissez un ou plusieurs thèmes, la longueur de la partie et vos questions personnalisées.",
      comfort: "Les questions servent à rire, pas à humilier. Passez une carte si elle vise un sujet sensible."
    },
    "Qui de nous ? +18": {
      intro: "Le même vote secret, avec des situations de séduction, de relations et de dossiers plus adultes.",
      steps: ["Une question adulte est affichée.", "Tout le monde désigne secrètement une personne.", "Les résultats sont révélés.", "Le groupe peut commenter sans forcer qui que ce soit à se justifier."],
      scoring: "Les statistiques de fin restent légères et ne récompensent pas les comportements intimes.",
      options: "Les thèmes adultes peuvent être mélangés avec les thèmes classiques.",
      comfort: "Réservé aux adultes. Passer reste possible à tout moment."
    },
    "Je n’ai jamais": {
      intro: "Parmi 600 phrases réparties en 12 thèmes, chaque carte décrit une expérience. Tout le monde indique secrètement si cela lui est déjà arrivé.",
      steps: ["Lisez la phrase.", "Chaque personne choisit Oui ou Non sur son écran.", "Les réponses sont révélées ensemble.", "Discutez seulement si les personnes concernées en ont envie."],
      scoring: "Le mode standard ne classe pas les joueurs. L’intérêt vient des découvertes et des points communs.",
      options: "Choisissez un ou plusieurs des 12 thèmes, une partie de 10 à 100 phrases, ajoutez vos propres cartes et mélangez éventuellement le contenu adulte.",
      comfort: "Personne n’a à raconter les détails d’une expérience."
    },
    "Je n’ai jamais +18": {
      intro: "Une base de 400 phrases adultes réparties en 10 thèmes et trois intensités, du flirt léger aux cartes sans filtre.",
      steps: ["Choisissez les thèmes et les intensités.", "Une affirmation est affichée.", "Chacun répond secrètement Jamais ou Déjà.", "Les réponses sont révélées, sans obligation de raconter les détails."],
      scoring: "Aucun point n’est attribué pour une expérience intime.",
      options: "Parties de 10 à 100 cartes, thèmes et intensités combinables, plus des phrases personnalisées enregistrées sur l’appareil de l’hôte.",
      comfort: "Réservé aux adultes consentants. Passer, garder le silence ou refuser de développer ne demande aucune justification."
    },
    "Tu préfères": {
      intro: "Tout le monde choisit secrètement entre deux options, puis découvre la répartition du groupe.",
      steps: ["Lisez les deux propositions.", "Chaque joueur choisit A ou B.", "Les camps sont révélés en même temps.", "Le groupe peut défendre son choix avant la manche suivante."],
      scoring: "Le jeu est principalement conversationnel. Aucun choix n’est considéré comme objectivement meilleur.",
      options: "Sélectionnez les thèmes et le nombre de dilemmes.",
      comfort: "Une carte peut être passée si elle touche un sujet que le groupe ne souhaite pas aborder."
    },
    "Tu préfères +18": {
      intro: "Des dilemmes adultes équilibrés, conçus pour créer de vraies hésitations.",
      steps: ["Deux options sont affichées.", "Tout le monde vote secrètement.", "La répartition est révélée.", "Les joueurs expliquent leur choix uniquement s’ils le souhaitent."],
      scoring: "Pas de récompense liée à une préférence intime.",
      options: "Choisissez la longueur de partie et mélangez les intensités disponibles.",
      comfort: "Réservé aux adultes. Aucun choix ne doit être utilisé pour juger une personne."
    },
    "Roulette de défis": {
      intro: "La roulette tire des défis solo, en duo, en trio ou pour tout le groupe selon le nombre de joueurs.",
      steps: ["Choisissez les thèmes et les formats de défis.", "La roulette désigne les participants.", "Le défi est réalisé ou passé.", "Les personnes concernées gagnent le point si le défi est validé."],
      scoring: "Un défi réussi rapporte généralement 1 point aux participants sélectionnés.",
      options: "Vous pouvez ajouter vos propres défis et jouer uniquement avec eux ou les mélanger à la base.",
      comfort: "Passer reste sans pénalité. Adaptez toujours un défi à l’espace et aux capacités du groupe."
    },
    "Même cerveau": {
      intro: "Tout le monde écrit une réponse courte à la même question. Les réponses identiques ou équivalentes créent une connexion.",
      steps: ["Une question d’association est affichée.", "Chacun écrit sa réponse sans se concerter.", "Les réponses sont révélées.", "L’hôte peut fusionner les formulations équivalentes avant le calcul final."],
      scoring: "2 personnes connectées : 1 point chacune. 3 personnes : 2 points. 4 personnes ou plus : 3 points.",
      options: "Choisissez les thèmes, le pack adulte et vos questions personnalisées.",
      comfort: "Les réponses uniques ne sont pas de mauvaises réponses : elles alimentent les statistiques amusantes."
    },
    "Minorité": {
      intro: "Tout le monde choisit secrètement parmi trois options. Le plus petit camp marque.",
      steps: ["Une question et trois choix sont affichés.", "Chaque personne vote secrètement.", "Les groupes sont révélés.", "Les points sont attribués au camp minoritaire."],
      scoring: "Une personne seule sur son choix gagne 2 points. Plusieurs personnes dans le plus petit camp gagnent 1 point chacune. Égalité parfaite : 0 point.",
      options: "Choisissez les thèmes classiques ou adultes, les intensités et vos cartes personnalisées.",
      comfort: "Les trois choix sont volontairement défendables. Personne n’a à expliquer une préférence personnelle."
    },
    "Tu me connais ou pas ?": {
      intro: "Une personne répond à une question sur elle-même, puis les autres tentent de prévoir sa réponse.",
      steps: ["La personne ciblée choisit sa vraie réponse en secret.", "Les autres font leur pronostic.", "Ils peuvent miser sur leur niveau de certitude.", "La réponse réelle et les gains sont révélés."],
      scoring: "Je tente : +1 si juste. Je pense te connaître : +2 si juste, −1 sinon. J’en suis certain : +3 si juste, −2 sinon.",
      options: "Choisissez les packs thématiques, le nombre de questions et activez ou non les mises.",
      comfort: "La personne ciblée choisit librement sa réponse : les autres ne doivent pas la contester."
    },
    "Le Classement secret": {
      intro: "Une personne classe plusieurs propositions en secret. Les autres essaient de deviner son choix numéro un.",
      steps: ["La personne ciblée crée son classement.", "Les autres choisissent l’option qu’ils pensent placée en tête.", "Le classement réel est révélé.", "Les bonnes prédictions rapportent des points."],
      scoring: "Une bonne prédiction rapporte le nombre de points affiché dans la partie.",
      options: "Choisissez la longueur de partie et les packs disponibles.",
      comfort: "Le classement représente le choix du moment, pas une vérité définitive sur la personne."
    },
    "Mime": {
      intro: "Une ou deux personnes doivent faire deviner une scène sans parler.",
      steps: ["Les mimeurs découvrent le sujet en privé.", "Le sujet disparaît et le chronomètre démarre.", "Le groupe propose des réponses.", "En cas de réussite, indiquez qui a trouvé en premier."],
      scoring: "Le ou les mimeurs gagnent 1, 2 ou 3 points selon la difficulté. Le premier à trouver gagne 1 point.",
      options: "Choisissez thèmes, difficultés, mimes solo ou duo, durée et cartes personnalisées.",
      comfort: "Pas de parole ni de bruit servant directement d’indice, sauf adaptation décidée par le groupe."
    },
    "Imitation": {
      intro: "Une ou deux personnes font reconnaître une voix, une attitude ou une situation avant la fin du chronomètre.",
      steps: ["Les imitateurs découvrent le sujet et les éventuels mots interdits en privé.", "Le chrono démarre sur tous les téléphones.", "Le groupe propose des réponses.", "En cas de réussite, indiquez qui a trouvé en premier."],
      scoring: "Les imitateurs gagnent 1 à 4 points selon la difficulté. La première bonne réponse rapporte 1 point.",
      options: "Choisissez thèmes, difficultés, mode sonore ou silencieux, durée, cartes solo ou duo et imitations personnalisées.",
      comfort: "Évitez les imitations humiliantes d’une personne présente, d’un handicap, d’un accent réel ou d’un groupe protégé. Une carte peut être passée immédiatement."
    },
    "Le premier qui rit a perdu": {
      intro: "Deux adversaires essaient de se faire rire à tour de rôle tout en gardant leur sérieux.",
      steps: ["Choisissez les deux adversaires.", "La première personne raconte une blague de l’application ou la sienne.", "Si l’autre rit, le duel est tranché ou une vie est retirée selon le mode.", "Les rôles alternent jusqu’à la victoire."],
      scoring: "En mort subite, le premier rire décide du duel. En mode vies, la première personne à zéro perd.",
      options: "Choisissez mort subite ou trois vies, les catégories de blagues et le pack adulte éventuel.",
      comfort: "Une blague peut être passée immédiatement si elle ne convient pas au groupe."
    },
    "Plaide ta cause": {
      intro: "Une opinion est imposée à l’orateur, qui doit la défendre même s’il n’est pas d’accord.",
      steps: ["Une cause et un niveau sont tirés.", "L’orateur dispose du temps choisi pour argumenter.", "Les autres votent secrètement.", "La répartition du jury et les points sont révélés."],
      scoring: "Rejetée : 0 point. Presque convaincu : 1 point. Plaidoirie brillante : 2 points par juré.",
      options: "Choisissez thèmes, niveaux, durée, nombre de causes et causes personnalisées.",
      comfort: "Les causes sont jouées comme un exercice d’improvisation, pas comme les opinions réelles des joueurs."
    },
    "Le Faux Expert": {
      intro: "Un orateur présente un sujet. Il peut être véritable expert ou devoir improviser complètement.",
      steps: ["L’orateur découvre son rôle en privé.", "Il parle pendant le temps prévu.", "Le groupe écoute sans connaître son rôle.", "Tout le monde vote Vrai expert ou Faux expert."],
      scoring: "Les enquêteurs marquent en trouvant le rôle. L’orateur peut marquer s’il trompe le groupe.",
      options: "Le nombre de conférences et le temps de parole sont configurables.",
      comfort: "Le jeu récompense l’improvisation, pas la diffusion volontaire d’informations dangereuses."
    },
    "La Bombe": {
      intro: "Le téléphone passe rapidement de main en main. Chaque personne doit donner une réponse différente avant l’explosion.",
      steps: ["Une catégorie est affichée.", "La personne répond puis passe le téléphone.", "Une réponse déjà donnée est interdite.", "La personne qui tient le téléphone lorsque la bombe explose perd la manche."],
      scoring: "Les points ou pénalités dépendent du mode affiché.",
      options: "Choisissez la durée de la bombe et le nombre de manches.",
      comfort: "Passez le téléphone avec précaution : il ne doit jamais être lancé."
    },
    "Culture générale": { intro: "Un quiz général couvrant plusieurs domaines.", steps: ["Choisissez Facile, Moyen, Difficile ou une combinaison.", "Chaque joueur répond en secret.", "La bonne réponse est révélée.", "Les scores sont mis à jour avant la question suivante."], scoring: "Facile : 1 point. Moyen : 2 points. Difficile : 3 points.", options: "Parties jusqu’à 150 questions avec répartition équilibrée des difficultés.", comfort: "Une erreur ne retire aucun point." },
    "Cinéma": { intro: "Un quiz sur les films, les personnages, les réalisateurs et l’histoire du cinéma.", steps: ["Sélectionnez les difficultés.", "Tout le monde répond.", "La solution et l’explication apparaissent.", "La question suivante démarre."], scoring: "Facile : 1 point. Moyen : 2 points. Difficile : 3 points.", options: "Vous pouvez combiner les trois niveaux et choisir une partie courte ou marathon.", comfort: "Les questions ne nécessitent pas d’avoir vu tous les films cités." },
    "Musique": { intro: "Un quiz de culture musicale, sans extrait audio.", steps: ["Choisissez les niveaux.", "Répondez chacun de votre côté.", "Découvrez la solution.", "Cumulez les points jusqu’au classement."], scoring: "Facile : 1 point. Moyen : 2 points. Difficile : 3 points.", options: "Les difficultés choisies sont réparties équitablement.", comfort: "Aucun malus pour une mauvaise réponse." },
    "Jeux vidéo": { intro: "Un quiz sur les consoles, licences, personnages et mécaniques de jeux vidéo.", steps: ["Sélectionnez les niveaux.", "Chaque joueur vote secrètement.", "La bonne réponse est révélée.", "Le score est ajouté automatiquement."], scoring: "Facile : 1 point. Moyen : 2 points. Difficile : 3 points.", options: "Jusqu’à 150 questions dans une même partie.", comfort: "Les réponses fausses ne coûtent aucun point." },
    "Devine le logo": { intro: "Identifiez une marque à partir de la description de son logo et de ses éléments visuels.", steps: ["Lisez la description.", "Choisissez la marque.", "La réponse correcte est révélée.", "Le classement est actualisé."], scoring: "Facile : 1 point. Moyen : 2 points. Difficile : 3 points.", options: "Choisissez un ou plusieurs niveaux.", comfort: "Aucune connaissance commerciale particulière n’est requise pour les questions faciles." },
    "Qui suis-je ?": {
      intro: "Une personne doit retrouver une identité en posant des questions auxquelles le groupe répond uniquement par oui ou non.",
      steps: ["Le groupe mémorise l’identité sans la montrer à la personne qui devine.", "La personne pose ses questions pendant le chrono.", "Elle peut débloquer jusqu’à trois indices, visibles uniquement sur son écran.", "Le groupe valide si l’identité est trouvée."],
      scoring: "Sans indice : 3 points. Avec 1 indice : 2 points. Avec 2 ou 3 indices : 1 point. Chaque personne ayant aidé gagne 1 point.",
      options: "Choisissez la durée, le nombre de tours et le contenu adulte éventuel.",
      comfort: "Les réponses du groupe doivent rester Oui, Non ou Ça dépend, sans donner directement le nom."
    },
    "Devinettes": { intro: "Résolvez des énigmes courtes et des jeux de logique.", steps: ["Une devinette est affichée.", "Les joueurs cherchent la réponse.", "La solution est révélée lorsque le groupe le décide.", "Le premier à trouver marque."], scoring: "La première bonne réponse rapporte généralement 1 point.", options: "Choisissez la longueur et les thèmes disponibles.", comfort: "Le groupe peut demander la réponse et passer sans pénalité." },
    "Qui ment le mieux ?": {
      intro: "Tout le monde invente un mensonge crédible en réponse à la même situation, puis le groupe vote pour le meilleur.",
      steps: ["Une situation est affichée.", "Chaque joueur écrit son mensonge en secret.", "Toutes les réponses sont mélangées et lues anonymement.", "Le groupe vote : Mensonge incroyable, Moui ou Grave nul selon le mode."],
      scoring: "Les points récompensent les votes obtenus par chaque mensonge.",
      options: "Choisissez les thèmes, la longueur et le pack adulte.",
      comfort: "La réponse doit rester inventée : aucune obligation de révéler une anecdote réelle."
    },
    "L’Imposteur sait presque tout": {
      intro: "Les joueurs informés voient uniquement le mot. Un ou deux imposteurs reçoivent seulement un indice, sans connaître l’identité de l’autre.",
      steps: ["Choisissez les thèmes, la difficulté et le nombre d’imposteurs.", "Chaque joueur découvre son information en privé.", "Donnez un indice chacun dans l’ordre affiché, sans prononcer le mot.", "Votez secrètement pour un ou deux suspects.", "Chaque imposteur démasqué peut encore tenter de retrouver le mot parmi quatre propositions."],
      scoring: "+1 par imposteur correctement désigné. +2 pour chaque imposteur qui échappe au vote. +1 si un imposteur démasqué retrouve le mot.",
      options: "Choisissez le nombre de manches et les packs disponibles.",
      comfort: "Les indices doivent aider le groupe sans rendre le mot immédiatement évident."
    },
    "Qui a répondu ça ?": {
      intro: "Tout le monde répond à une question, puis plusieurs réponses anonymes peuvent être utilisées comme enquêtes.",
      steps: ["Chaque personne écrit sa réponse.", "Une réponse anonyme est affichée.", "Les joueurs devinent son auteur.", "Le jeu peut enquêter sur une, deux ou toutes les réponses avant de changer de question."],
      scoring: "L’enquêteur gagne 1 point s’il trouve l’auteur. L’auteur gagne 1 point par personne trompée.",
      options: "Choisissez les thèmes, le nombre de réponses enquêtées et les questions personnalisées.",
      comfort: "Les réponses peuvent être passées ou formulées sans détail personnel."
    },
    "Fake ou Réel ?": { intro: "Décidez si chaque affirmation est vraie ou inventée.", steps: ["Une affirmation est présentée.", "Chaque joueur vote Fake ou Réel.", "La solution et son explication sont révélées.", "Les bonnes réponses marquent."], scoring: "Une bonne réponse rapporte le point indiqué.", options: "Choisissez les thèmes et la longueur de partie.", comfort: "Les explications de l’application servent de référence pour la manche." },
    "Alerte Rouge": { intro: "Le groupe traverse une histoire à embranchements et vote pour la décision à prendre.", steps: ["Un scénario et plusieurs options apparaissent.", "Tout le monde vote secrètement.", "L’option majoritaire est appliquée.", "La conséquence est révélée avant la suite de l’histoire."], scoring: "Les joueurs ayant choisi l’option retenue gagnent généralement 1 point.", options: "Choisissez le nombre de scénarios.", comfort: "Les situations sont fictives : le vote ne représente pas forcément les valeurs réelles des joueurs." },
    "Questions osées": {
      intro: "Des questions adultes à discuter sans score, en tour par tour ou avec tout le groupe.",
      steps: ["Choisissez thèmes et intensités.", "Une question est attribuée à une personne ou ouverte au groupe.", "Les personnes répondent uniquement si elles le souhaitent.", "L’hôte passe à la question suivante."],
      scoring: "Aucun point et aucun classement.",
      options: "Piment doux, Très osé et Sans filtre peuvent être combinés. Les questions personnelles sont acceptées.",
      comfort: "Le bouton Passer est toujours disponible et n’exige aucune justification."
    },
    "Jeux à boire": {
      intro: "Un jeu de soirée sans score, utilisable avec n’importe quelle boisson, y compris de l’eau ou une boisson sans alcool.",
      steps: ["Choisissez thèmes et ambiance.", "Suivez la carte solo, duo, groupe ou règle temporaire.", "Une petite gorgée peut toujours être remplacée par de l’eau ou par Passer.", "Les rappels d’hydratation apparaissent régulièrement."],
      scoring: "Aucun score n’est lié à la consommation.",
      options: "Tranquille, Soirée et Sans filtre peuvent être combinés. L’hôte peut ajouter ses cartes.",
      comfort: "Aucun shot, cul-sec ou cumul imposé. Ne conduisez pas après avoir bu et respectez les limites de chacun."
    }
  };

  const fallbackSteps = [
    "Lisez la consigne affichée.",
    "Chaque personne joue ou répond lorsque l’application l’indique.",
    "Validez le résultat de la manche.",
    "Continuez jusqu’à l’écran final ou utilisez Mettre fin à la partie."
  ];

  function ruleFor(gameName) {
    const base = String(gameName || "").replace(/ \+18$/, "");
    const direct = RULES[gameName] || RULES[base];
    if (direct) return direct;
    const meta = typeof akAudit8GameMeta === "function" ? akAudit8GameMeta(gameName) : { goal: "Suivez les consignes affichées.", minPlayers: 2, time: "10 min" };
    return {
      intro: meta.goal,
      steps: fallbackSteps,
      scoring: "Le barème exact apparaît pendant la partie lorsqu’un score est utilisé.",
      options: "Les réglages disponibles sont proposés avant le lancement.",
      comfort: "Le groupe peut passer une carte ou arrêter la partie à tout moment."
    };
  }

  function closeRuleModal() {
    document.querySelector(".game-rules-overlay")?.remove();
    document.body.classList.remove("game-rules-open");
  }

  function openRuleModal(gameName) {
    closeRuleModal();
    const rule = ruleFor(gameName);
    const meta = typeof akAudit8GameMeta === "function" ? akAudit8GameMeta(gameName) : { minPlayers: 2, time: "10 min" };
    const icon = typeof V014_GAME_ICONS !== "undefined" ? (V014_GAME_ICONS[gameName] || "🎮") : "🎮";
    const overlay = document.createElement("div");
    overlay.className = "game-rules-overlay";
    overlay.innerHTML = `
      <section class="game-rules-modal" role="dialog" aria-modal="true" aria-labelledby="gameRulesTitle">
        <header>
          <span class="game-rules-icon" aria-hidden="true">${icon}</span>
          <div><small>RÈGLES COMPLÈTES</small><h2 id="gameRulesTitle">${escapeHtml(gameName)}</h2></div>
          <button type="button" class="game-rules-close" aria-label="Fermer">×</button>
        </header>
        <div class="game-rules-badges"><span>👥 ${Number(meta.minPlayers || 2)}+ joueurs</span><span>⏱ ${escapeHtml(meta.time || "10 min")}</span></div>
        <p class="game-rules-intro">${escapeHtml(rule.intro)}</p>
        <section><h3>Comment jouer</h3><ol>${rule.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>
        <section><h3>Points et victoire</h3><p>${escapeHtml(rule.scoring)}</p></section>
        <section><h3>Réglages disponibles</h3><p>${escapeHtml(rule.options)}</p></section>
        <section class="game-rules-comfort"><h3>Confort du groupe</h3><p>${escapeHtml(rule.comfort)}</p></section>
        <button type="button" class="primary-btn full game-rules-understood">J’ai compris</button>
      </section>`;
    document.body.appendChild(overlay);
    document.body.classList.add("game-rules-open");
    overlay.querySelector(".game-rules-close")?.focus();
    overlay.addEventListener("click", event => {
      if (event.target === overlay || event.target.closest(".game-rules-close, .game-rules-understood")) closeRuleModal();
    });
    document.addEventListener("keydown", function onKey(event) {
      if (event.key !== "Escape") return;
      closeRuleModal();
      document.removeEventListener("keydown", onKey);
    });
  }

  function enhanceGameCards() {
    document.querySelectorAll(".game-list [data-game]").forEach(card => {
      if (card.closest(".game-card-with-help")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "game-card-with-help";
      card.parentNode.insertBefore(wrapper, card);
      wrapper.appendChild(card);
      const help = document.createElement("button");
      help.type = "button";
      help.className = "game-rules-button";
      help.dataset.gameRules = card.dataset.game;
      help.setAttribute("aria-label", `Voir les règles complètes de ${card.dataset.game}`);
      help.innerHTML = `<span aria-hidden="true">?</span>`;
      wrapper.appendChild(help);
      help.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openRuleModal(help.dataset.gameRules);
      });
    });
  }

  if (typeof renderGames === "function") {
    const originalRenderGames = renderGames;
    renderGames = function (...args) {
      const result = originalRenderGames.apply(this, args);
      window.requestAnimationFrame(enhanceGameCards);
      return result;
    };
  }

  const observer = new MutationObserver(() => {
    if (screen?.querySelector(".game-list [data-game]:not(.game-help-ready)")) {
      window.requestAnimationFrame(enhanceGameCards);
    }
  });
  if (screen) observer.observe(screen, { childList: true, subtree: true });

  window.AKGameHelp = { open: openRuleModal, rules: RULES };
})();
