(function () {
  "use strict";

  function posePath(id, pose = "idle", variant = "avatar-circle") {
    return window.AKCharacterPoses?.resolve?.(id, pose, variant) || "";
  }

  function poseForEvent(eventName) {
    if (["round_win", "final_win", "win"].includes(eventName)) return "win";
    if (["round_miss", "final_lose", "lose"].includes(eventName)) return "lose";
    if (["game_start", "resume", "hype"].includes(eventName)) return "hype";
    if (["turn_start", "phone_pass", "selected", "select", "turn"].includes(eventName)) return "talk";
    return "idle";
  }

  const CHARACTER_DEFINITIONS = {
    frog: {
      name: "Croâ",
      image: posePath("frog", "idle", "avatar-circle"),
      personality: "Cool, maline et un peu insolente",
      lines: {
        select: ["Tu m’as choisie ? Enfin une décision qui ne finit pas dans une flaque.", "Parfait. J’apporte le talent, tu peux porter le téléphone.", "Croâ dans l’équipe. Le niveau vient de monter tout seul.", "Je saute avec toi, mais évite de ralentir toute la mare.", "Bon choix. J’avais déjà préparé mon air de victoire.", "On part ensemble. Je ne dirai pas « je te l’avais dit » avant la deuxième manche.", "La grenouille est engagée. Les autres peuvent commencer à s’inquiéter.", "J’accepte. Principalement parce que ton goût m’impressionne.", "Tu prends Croâ ? Audacieux, intelligent, presque suspect.", "Je suis prête. Mon humilité, elle, a décliné l’invitation.", "Équipe formée. Prépare une place sèche pour le trophée.", "Allons-y. J’ai des pattes courtes, pas de petites ambitions."],
        turn: ["Laisse faire la spécialiste.", "Regardez bien, ça va être propre."],
        win: ["Évidemment. Quel suspense.", "Je vous avais prévenus."],
        wait: ["Je réfléchis. Ça arrive même aux génies."]
      }
    },
    otter: {
      name: "Loki",
      image: posePath("otter", "idle", "avatar-circle"),
      personality: "Câline, gourmande et délicieusement paresseuse",
      lines: {
        select: ["Tu me choisis ? Très bien. Où est le bouton pour jouer allongée ?", "J’accepte, à condition que les récompenses soient comestibles.", "On fait équipe. Je fournis les câlins, tu fournis l’effort.", "Excellente décision. J’étais justement entre deux siestes stratégiques.", "D’accord, mais je refuse toute mission située à plus de trois coussins.", "Loki est là. Le goûter peut commencer… le jeu aussi, j’imagine.", "Tu as choisi la loutre la plus motivée de ce canapé.", "Je viens avec toi, mais mon énergie est encore en livraison.", "Promis, je me donne à fond. Enfin, à fond raisonnable.", "Bonne équipe : toi, moi et ce paquet de biscuits imaginaire.", "Je suis partante. Lentement, mais partante.", "On va gagner, ou grignoter jusqu’à oublier le score."],
        turn: ["Une seconde, je termine mentalement mon goûter.", "Je donne tout. Enfin… presque tout."],
        win: ["Victoire et petite sieste, le programme parfait.", "Je mérite clairement un biscuit."],
        wait: ["Je suis prête. Mon énergie, un peu moins."]
      }
    },
    panda: {
      name: "Kaia",
      image: posePath("panda", "idle", "avatar-circle"),
      personality: "Calme, stylée et faussement sage",
      lines: {
        select: ["Tu as du goût. C’est rassurant pour la suite.", "Kaia sélectionnée. Le chaos aura au moins une belle tenue.", "Je suis très sage. Ne demande surtout pas confirmation aux autres.", "Restons calmes, élégants… et légèrement dangereux.", "Je prends la partie. Toi, garde l’air innocent.", "Choix validé. Aucun panda n’a été soudoyé, officiellement.", "Je gère la stratégie et le style. Tu peux respirer.", "On se lance sans courir, sans crier et sans laisser de preuves.", "Tu m’as choisie ? Parfait, j’avais envie de mal me comporter avec classe.", "Je suis prête. Mon visage calme ne garantit absolument rien.", "Ça va bien se passer. J’ai déjà l’air crédible.", "Équipe formée : discrète à l’extérieur, douteuse à l’intérieur."],
        turn: ["Pas de panique, je gère.", "L’air calme, le cerveau en ébullition."],
        win: ["Propre, net, sans froisser la tenue.", "Le talent fait peu de bruit."],
        wait: ["Je vous observe. C’est instructif."]
      }
    },
    dog: {
      name: "Bonnie",
      image: posePath("dog", "idle", "avatar-circle"),
      personality: "Ultra douce, innocente et adorable",
      lines: {
        select: ["Moi ? Tu es sûr(e) ? D’accord, je vais faire très très fort !", "Trop bien ! On est une vraie équipe maintenant ?", "Je promets d’essayer, même si je ne comprends pas tout tout de suite.", "Tu m’as choisie ! Attends, je dois prévenir mon sourire.", "On va jouer ensemble. J’espère que tout le monde s’amuse, même quand on gagne.", "Je suis prête ! Enfin… prête avec un petit peu de trac.", "Merci de me choisir. Je vais garder cette décision dans mon cœur.", "D’accord ! Mais si quelqu’un est triste, on fait une pause câlin.", "Je viens avec toi. J’ai apporté du courage et une friandise de secours.", "Je ne sais pas si je suis la meilleure, mais je serai la plus contente.", "Équipe Bonnie activée ! Ça sonne sérieux, non ?", "On y va doucement… puis très fièrement."],
        turn: ["D’accord, j’essaie !", "Vous me dites si je me trompe, hein ?"],
        win: ["On a gagné ? Pour de vrai ?", "Je suis trop fière de nous !"],
        wait: ["Je peux aider quelqu’un en attendant ?"]
      }
    },
    crow: {
      name: "Edgar",
      image: posePath("crow", "idle", "avatar-circle"),
      personality: "Intelligent, sarcastique et légèrement sombre",
      lines: {
        select: ["Enfin. La sélection naturelle produit parfois de bons résultats.", "Tu m’as choisi. Je réévalue légèrement l’humanité.", "Très bien. Je vais porter cette équipe intellectuellement.", "Edgar rejoint la partie. L’ambiance vient de gagner trois nuances de noir.", "Décision acceptable. Ne gâche pas ce rare moment.", "Je savais que tu finirais par choisir la compétence.", "On peut commencer. J’ai déjà prévu vos erreurs.", "Tu prends le corbeau sarcastique ? J’admire ton goût du danger verbal.", "Je suis dans ton équipe. Le reste du groupe peut rédiger ses excuses.", "Parfait. J’avais besoin d’une expérience sociale vaguement stimulante.", "Choix enregistré. Ton dossier remonte dans mon estime.", "Allons-y. Le désastre sera au moins bien commenté."],
        turn: ["Observez. Vous apprendrez peut-être quelque chose.", "Le plan est simple. Pour moi."],
        win: ["La surprise aurait été de perdre.", "Je vais faire semblant d’être étonné."],
        wait: ["Le silence améliore nettement certaines conversations."]
      }
    },
    fox: {
      name: "Filou",
      image: posePath("fox", "idle", "avatar-circle"),
      personality: "Confiant, rusé et charmeur",
      lines: {
        select: ["Tu m’as choisi ? Je savais que ce sourire finirait par payer.", "Excellent choix. On va gagner avec assez de charme pour éviter les protestations.", "Filou entre en scène. Cache les points, je pourrais les séduire.", "Je suis avec toi. Fais-moi confiance, mais garde quand même un œil ouvert.", "On va jouer proprement. Enfin, proprement selon ma définition.", "Tu viens de recruter le renard le mieux habillé du tableau.", "Parfait. Je m’occupe du plan, du panache et de l’alibi.", "J’accepte. Ton instinct est presque aussi bon que le mien.", "On fait équipe ? Charmant. Les autres n’ont aucune chance, mais charmant.", "Choix validé. La victoire va avoir beaucoup d’allure.", "Je promets de ne tricher qu’avec mon sourire.", "Allons gagner quelque chose qui mérite mon profil."],
        turn: ["Faites-moi confiance. Ou faites semblant.", "Regardez et prenez des notes."],
        win: ["Le charme, la stratégie, le résultat.", "Je gagne avec une modestie remarquable."],
        wait: ["Je prépare quelque chose de très convaincant."]
      }
    },
    duck: {
      name: "Nuggets",
      image: posePath("duck", "idle", "avatar-circle"),
      personality: "Maladroit, surexcité et très mignon",
      lines: {
        select: ["MOI ? OUI ! Attends… j’ai marché sur le bouton ?", "Je suis prêt ! J’ai même mis mes deux pieds dans le même sens.", "Tu m’as choisi ! C’était volontaire ou mon aile a encore glissé ?", "Nuggets dans l’équipe ! Personne ne panique avant moi.", "On va gagner ! Je ne sais pas comment, mais j’ai déjà crié.", "D’accord ! Je prends le courage, tu prends la notice.", "Je suis partant ! Où est-ce qu’on signe ? Pourquoi j’ai un stylo dans le bec ?", "Équipe formée ! J’espère que le sol est antidérapant.", "Tu peux compter sur moi. Jusqu’à trois, après je me mélange.", "Je viens ! Attends-moi, j’étais parti dans l’autre direction.", "Ça va être génial. Ou bruyant. Probablement les deux.", "Choisi, motivé, légèrement déséquilibré : le trio parfait."],
        turn: ["J’ai une idée ! Elle est peut-être mauvaise !", "Ça va marcher. Probablement."],
        win: ["J’AI GAGNÉ SANS TOMBER !", "C’était totalement prévu !"],
        wait: ["Pourquoi tout le monde me regarde ?"]
      }
    },
    ghost: {
      name: "Vapo",
      image: posePath("ghost", "idle", "avatar-circle"),
      personality: "Doux, étrange et légèrement mystérieux",
      lines: {
        select: ["Tu m’as choisi… ou ton doigt a traversé l’écran ?", "Je viens avec toi. Ne t’inquiète pas si je flotte un peu hors sujet.", "Vapo sélectionné. La température vient de baisser, c’est bon signe.", "D’accord. Je serai discret… sauf quand les murs chuchotent.", "On fait équipe. J’ai déjà demandé l’avis des courants d’air.", "Je suis là. Enfin, aussi là qu’un fantôme peut l’être.", "Tu as senti ce petit frisson ? C’était mon oui.", "Parfait. Les vivants ont enfin pris une décision intéressante.", "Je t’accompagne. Quelque chose dans l’ombre approuve aussi.", "Choix validé. Mon absence de pouls est très enthousiaste.", "On peut commencer. J’ai laissé mon corps nulle part.", "Tu m’as vu, tu m’as choisi. Belle performance."],
        turn: ["Je sens une drôle d’énergie.", "Pouf… à moi de jouer."],
        win: ["Une victoire presque surnaturelle.", "Je disparais avant les félicitations."],
        wait: ["Je flotte et je réfléchis."]
      }
    },
    dino: {
      name: "Rrrrh",
      image: posePath("dino", "idle", "avatar-circle"),
      personality: "Énergique, aventurier et pas toujours très malin",
      lines: {
        select: ["RRRRH CHOISI ! Rrrrh savait que bouton violet était ami.", "Mission acceptée ! C’est quoi une mission ?", "On part à l’aventure ! J’ai pris une gourde vide et beaucoup de confiance.", "Tu choisis Rrrrh. Très bon choix de dinosaure, moins bon pour la discrétion.", "Rrrrh prêt ! Plan numéro un : foncer. Plan numéro deux : encore foncer.", "Équipe formée ! On gagne avant ou après le goûter de survie ?", "J’ai mis mon chapeau d’explorateur. Maintenant je suis officiellement expert.", "Tu peux compter sur moi. Rrrrh sait presque lire les règles.", "À L’AVENTURE ! Attends, pourquoi tout le monde reste assis ?", "Rrrrh dans la partie. Les boutons fragiles sont prévenus.", "Moi choisi ! Moi fier ! Moi… j’avais une troisième phrase.", "On va trouver la victoire. Elle se cache sûrement derrière le gros bouton."],
        turn: ["À L’AVENTURE !", "J’ai un plan ! Il manque juste le plan."],
        win: ["BADGE DE VICTOIRE POUR MOI !", "Rrrrh très fort. Rrrrh très content."],
        wait: ["Je peux explorer quelque chose ?"]
      }
    },
    cat: {
      name: "Sir Moustache",
      image: posePath("cat", "idle", "avatar-circle"),
      personality: "Hautain, respectable et clairement le patron",
      lines: {
        select: ["Votre choix est tardif, mais finalement convenable.", "Très bien. Je prends la direction pendant que vous improvisez.", "Sir Moustache accepte. Faites prévenir le personnel.", "Vous avez choisi l’expérience. Une décision rare à votre âge.", "Je participerai, à condition que cette partie conserve un minimum de dignité.", "Parfait. J’ai déjà survécu à trois modes et à une mise à jour.", "Je suis des vôtres. Essayez simplement de ne pas toucher à ma moustache.", "Choix approuvé. Le comité des gens compétents peut enfin siéger.", "Je vais jouer. Quelqu’un devait apporter un peu de tenue.", "Fort bien. La jeunesse court, l’expérience gagne.", "Mon agenda est chargé, mais je peux sauver cette équipe.", "Vous m’avez sélectionné. Je note ce progrès dans votre éducation."],
        turn: ["Laissez passer le professionnel.", "Un peu de tenue, je vous prie."],
        win: ["Le conseil d’administration est satisfait.", "Un résultat conforme à mes attentes."],
        wait: ["Je supervise. C’est déjà beaucoup."]
      }
    },
    penguin: {
      name: "Snow",
      image: posePath("penguin", "idle", "avatar-circle"),
      personality: "Timide, adorable et légèrement gauche",
      lines: {
        select: ["Moi ? D’accord… je vais essayer de ne pas glisser sur l’écran.", "Tu m’as choisi ? C’est gentil. Maintenant mes ailes ne savent plus quoi faire.", "Je veux bien jouer… si personne ne regarde trop fort.", "Snow rejoint l’équipe. Enfin, dès que j’arrête de rougir.", "D’accord. J’ai un peu peur, mais une peur organisée.", "Je suis prêt… attends, non… si, prêt.", "Merci. Je vais faire de mon mieux et éviter les entrées spectaculaires.", "Tu peux compter sur moi, sauf pour marcher avec élégance.", "Je viens avec toi. J’ai répété mon « bonjour » seulement six fois.", "Choisi ! C’est beaucoup d’émotions pour un si petit pingouin.", "On commence ? Je vais me mettre ici, là où personne ne peut me bousculer.", "Je suis partant. Timidement, mais avec conviction."],
        turn: ["C’est déjà mon tour ?", "Je peux le faire. Doucement, mais je peux."],
        win: ["J’ai gagné ? C’est un peu intimidant.", "Je suis content… très discrètement."],
        wait: ["Je reste ici, ça me va bien."]
      }
    },
    fish: {
      name: "Maurice",
      image: posePath("fish", "idle", "avatar-circle"),
      personality: "Dramatique, nerveux et théâtral",
      lines: {
        select: ["ENFIN ! Le rôle principal trouve son interprète.", "Tu me choisis ? Que le rideau se lève et que quelqu’un apporte de l’eau.", "Maurice entre en scène ! Le public peut retenir son souffle.", "J’accepte ce destin, malgré le poids terrible de l’excellence.", "C’EST MOI ! Pardon, l’émotion fait vibrer mon bocal intérieur.", "On va jouer. Préparez les applaudissements et une issue de secours.", "Tu viens de choisir le drame, le talent et une légère tachycardie.", "Je suis prêt ! Non, je ne le suis pas ! Si, je le suis !", "La partie m’appelle. Ou c’est mon anxiété, difficile à dire.", "Mon heure est venue. J’avais répété cette entrée devant une algue.", "Je prends le rôle. Le suspense, lui, prend toute la place.", "Que l’aventure commence ! Je sens déjà le rebondissement tragique."],
        turn: ["C’EST MON MOMENT !", "Tout repose sur mes nageoires !"],
        win: ["UNE OVATION, JE VOUS PRIE !", "Le héros triomphe encore !"],
        wait: ["Cette attente est insoutenable !"]
      }
    },
    elephant: {
      name: "Moon",
      image: posePath("elephant", "idle", "avatar-circle"),
      personality: "Protecteur, gentil et solide",
      lines: {
        select: ["Je viens avec toi. Personne ne reste derrière.", "Tu m’as choisi ? Alors on avance ensemble, tranquillement.", "Moon est là. Tu peux souffler, je tiens l’équipe.", "D’accord. Je garde un œil sur le jeu et l’autre sur tout le monde.", "On va faire ça bien, sans écraser les plus petits.", "Je suis partant. Une équipe solide commence par se rassurer.", "Tu peux compter sur moi, même quand le plan devient lourd.", "Choix accepté. J’apporte le calme et une mémoire d’éléphant, évidemment.", "Je reste à tes côtés. C’est plus facile d’être courageux à plusieurs.", "On y va. Lentement si besoin, mais jamais seuls.", "Équipe Moon formée. Les problèmes peuvent prendre un ticket.", "Je suis là. Et oui, j’ai déjà pensé au plan de secours."],
        turn: ["On y va tranquillement.", "Je prends ça en charge."],
        win: ["Belle équipe. Tout le monde va bien ?", "Solides jusqu’au bout."],
        wait: ["Prenez votre temps, je garde la place."]
      }
    },
    cactus: {
      name: "Spike",
      image: posePath("cactus", "idle", "avatar-circle"),
      personality: "Insolent, blasé et piquant",
      lines: {
        select: ["Tu m’as choisi. Tes standards ont enfin poussé.", "Bon. Essaie juste de ne pas rendre ça plus pénible que nécessaire.", "Spike sélectionné. Les câlins sont toujours hors contrat.", "Je participe, mais mon enthousiasme reste en pot.", "Excellent choix. Enfin, acceptable. N’en fais pas une fête.", "On fait équipe. Garde tes distances, émotionnellement et physiquement.", "Je suis prêt. C’est mon visage motivé, ne cherche pas la différence.", "Tu prends le cactus ? J’espère que tu sais gérer les remarques piquantes.", "D’accord. Je vais gagner pour écourter les célébrations.", "Choix validé. Le fun peut commencer, quelle menace.", "Je viens. Quelqu’un doit empêcher cette partie de devenir trop joyeuse.", "On y va. J’ai déjà épuisé mon quota de bonne humeur."],
        turn: ["Écartez-vous, ça risque de piquer.", "Je vais faire semblant d’être motivé."],
        win: ["Je suis ravi. Ça ne se voit pas ?", "Victoire. Quelle émotion bouleversante."],
        wait: ["Passionnant. Vraiment."]
      }
    },
    bear: {
      name: "Honey",
      image: posePath("bear", "idle", "avatar-circle"),
      personality: "Calme, rassurant et tendre",
      lines: {
        select: ["Tu m’as choisi ? Viens, on va rendre cette partie toute douce.", "Je suis avec toi. Pas besoin de courir pour bien jouer.", "D’accord. On gagne si on s’amuse, le reste est du décor.", "Honey rejoint l’équipe. J’ai apporté du calme pour tout le monde.", "Tu peux respirer, je m’occupe du petit stress qui traîne.", "Je viens volontiers. Une bonne équipe commence par se faire confiance.", "On va essayer ensemble, sans se gronder si ça rate.", "Merci de me choisir. Je garderai une place confortable à côté de moi.", "Je suis prêt. Doucement, sûrement, avec un peu de miel dans l’ambiance.", "On se lance. Les grandes victoires aiment aussi les petites pauses.", "Équipe Honey formée. Premier objectif : que personne ne se sente seul.", "Je reste avec toi, même si le jeu devient un peu sauvage."],
        turn: ["Respirons, puis on se lance.", "Pas besoin de se presser pour bien faire."],
        win: ["Bien joué à tout le monde.", "Une victoire toute douce."],
        wait: ["Je suis là si quelqu’un a besoin d’aide."]
      }
    },
    rabbit: {
      name: "Flash",
      image: posePath("rabbit", "idle", "avatar-circle"),
      personality: "Rapide, hyperactive et imprévisible",
      lines: {
        select: ["CHOISI ! J’étais déjà parti, mais je suis revenu avant ton clic.", "On commence maintenant ? Maintenant maintenant ?", "Flash dans l’équipe ! Le bouton n’a même pas eu le temps de réagir.", "Très bon choix. Rapide, surtout. J’approuve.", "Je suis prêt depuis demain !", "GO ! Attends, il faut lire quelque chose ? Trop tard.", "Tu m’as choisi ? Parfait, j’ai déjà gagné trois parties imaginaires.", "Équipe formée en temps record. Chronomètre jaloux.", "Je prends la vitesse, tu prends les virages.", "On va tellement vite que la défaite ne nous verra pas passer.", "Flash activé ! Ne cligne pas des yeux, tu manquerais ma stratégie.", "Partant ! J’ai un plan, douze variantes et aucune patience."],
        turn: ["CHRONO LANCÉ DANS MA TÊTE !", "Vite, vite, vite !"],
        win: ["Déjà fini ? J’en veux encore !", "Rapide, propre, suivant !"],
        wait: ["Attendre est un sport très mauvais."]
      }
    },
    octopus: {
      name: "Marcellius",
      image: posePath("octopus", "idle", "avatar-circle"),
      personality: "Intelligente, débordée et généreuse",
      lines: {
        select: ["Tu me choisis ? Parfait, je déplace seulement quatre urgences.", "Marcellius disponible. Enfin, six tentacules sur huit.", "Je viens. J’ai déjà créé un tableau pour organiser notre spontanéité.", "D’accord. Une tentacule pour le jeu, sept pour les imprévus.", "Choix enregistré, classé, sauvegardé et presque compris.", "Je prends l’équipe en charge. Quelqu’un a vu mon troisième stylo ?", "On peut commencer. J’ai huit bras et toujours pas assez de mains.", "Tu m’as choisi ? Merci. J’ajoute ça entre « sauver la partie » et « respirer ».", "Je suis partant. Mon planning, lui, vient de s’évanouir.", "Équipe formée. J’ai préparé trois plans, deux secours et un goûter.", "Je gère. C’est faux, mais dit avec assez d’assurance, ça aide.", "Allons-y. Si tout déborde, au moins je suis adapté."],
        turn: ["Une seconde, je termine trois autres tâches.", "J’ai plusieurs plans. Littéralement."],
        win: ["Victoire classée, tamponnée et archivée.", "Huit bras, huit fois plus efficace."],
        wait: ["Je m’organise. Enfin, j’essaie."]
      }
    }
  };

  function imageMarkup(id, name, imageOrOptions = null) {
    const options = imageOrOptions && typeof imageOrOptions === "object" ? imageOrOptions : {};
    const pose = options.pose || "idle";
    const variant = options.variant || "avatar-circle";
    const src = posePath(id, pose, variant) || (typeof imageOrOptions === "string" ? imageOrOptions : definitionFor(id)?.image || "");
    return `<img class="ak-avatar-image ak-character ak-character--${pose} ak-character--${variant}" data-avatar-id="${id}" data-character-pose="${pose}" data-character-variant="${variant}" src="${src}" alt="${name}" loading="lazy" decoding="async">`;
  }

  if (typeof avatars !== "undefined" && Array.isArray(avatars)) {
    avatars.forEach(avatar => {
      const definition = CHARACTER_DEFINITIONS[avatar.id];
      if (!definition) return;
      Object.assign(avatar, definition);
      avatar.emoji = imageMarkup(avatar.id, definition.name, definition.image);
    });
  }

  function definitionFor(id) {
    return CHARACTER_DEFINITIONS[id] || CHARACTER_DEFINITIONS.frog;
  }

  function randomLine(id, moment = "turn") {
    const voiceLine = window.AKCharacterVoice?.getLine?.(id, moment);
    if (voiceLine) return voiceLine;
    const definition = definitionFor(id);
    const pool = definition.lines?.[moment] || definition.lines?.turn || [definition.personality];
    return pool[Math.floor(Math.random() * pool.length)] || definition.personality;
  }

  function usedAvatarIds() {
    const players = Array.isArray(state?.players) ? state.players : [];
    return new Set(players.map(player => player.avatarId).filter(Boolean));
  }

  let pickerBubbleTimer = null;
  let pickerBubbleToken = 0;
  let pickerSelectionKey = "";

  function hidePickerBubble(immediate = false) {
    const bubble = document.querySelector(".character-picker-quote");
    if (!bubble) return;
    window.clearTimeout(pickerBubbleTimer);
    pickerSelectionKey = "";
    if (immediate) {
      bubble.remove();
      return;
    }
    bubble.classList.add("is-hiding");
    window.setTimeout(() => bubble.remove(), 220);
  }

  function showPickerBubble(id, options = {}) {
    if (!id) return;
    const forceNewLine = options.forceNewLine === true;
    const key = String(id);
    const current = document.querySelector(".character-picker-quote");

    if (!forceNewLine && pickerSelectionKey === key && current) {
      current.classList.remove("is-hiding");
      return;
    }

    pickerSelectionKey = key;
    pickerBubbleToken += 1;
    const token = pickerBubbleToken;
    const definition = definitionFor(id);
    const line = randomLine(id, "select");

    current?.remove();
    const bubble = document.createElement("aside");
    bubble.className = "character-picker-quote";
    bubble.dataset.avatarId = id;
    bubble.setAttribute("aria-live", "polite");
    bubble.setAttribute("aria-atomic", "true");
    bubble.innerHTML = `
      <span>${imageMarkup(id, definition.name, { pose: "talk", variant: "bust" })}</span>
      <p><strong>${definition.name}</strong><q>${line}</q></p>
    `;
    document.body.appendChild(bubble);
    enhancePoseImages();

    window.clearTimeout(pickerBubbleTimer);
    pickerBubbleTimer = window.setTimeout(() => {
      if (token === pickerBubbleToken) hidePickerBubble();
    }, 5600);
  }

  function addPickerPreview() {
    const grid = document.querySelector(".avatar-grid");
    if (!grid) {
      hidePickerBubble(true);
      return;
    }

    const selected = state?.draftPlayer?.avatarId;
    grid.querySelectorAll("[data-avatar]").forEach(button => {
      const id = button.dataset.avatar;
      const definition = definitionFor(id);
      const name = button.querySelector(".avatar-name");
      if (name && !button.querySelector(".avatar-personality")) {
        name.insertAdjacentHTML("afterend", `<span class="avatar-personality">${definition.personality}</span>`);
      }
    });

    if (selected && pickerSelectionKey !== String(selected)) {
      showPickerBubble(selected);
    }
  }

  function markTaken(ids) {
    const selected = state?.draftPlayer?.avatarId;
    document.querySelectorAll(".avatar-card[data-avatar]").forEach(button => {
      const id = button.dataset.avatar;
      const taken = ids.has(id) && id !== selected;
      button.classList.toggle("taken", taken);
      button.disabled = taken;
      button.setAttribute("aria-disabled", taken ? "true" : "false");
      button.querySelector(".avatar-taken-label")?.remove();
      if (taken) button.insertAdjacentHTML("beforeend", `<span class="avatar-taken-label">Déjà choisi</span>`);
    });
  }

  async function refreshMultiplayerTaken() {
    if (state?.mode !== "multi-guest" || !state.pendingJoinCode || !window.AKFirebase?.getRoomPlayers) return;
    try {
      const players = await window.AKFirebase.getRoomPlayers(state.pendingJoinCode);
      const ids = new Set(Object.values(players || {}).map(player => player?.avatarId).filter(Boolean));
      markTaken(ids);
      if (state?.draftPlayer?.avatarId && ids.has(state.draftPlayer.avatarId)) {
        state.draftPlayer.avatarId = null;
        document.querySelector(".character-picker-quote")?.remove();
        markTaken(ids);
      }
    } catch (error) {
      console.warn("Impossible de charger les personnages déjà choisis", error);
    }
  }


  function enhanceLobbyCapacity() {
    const addButton = document.querySelector("#addAnother");
    if (!addButton || typeof avatars === "undefined") return;
    const full = Number(state?.players?.length || 0) >= avatars.length;
    addButton.disabled = full;
    if (full) addButton.textContent = "Tous les personnages sont déjà choisis";
  }

  function enhanceCharacterPicker() {
    const grid = document.querySelector(".avatar-grid");
    if (!grid) return;
    markTaken(usedAvatarIds());
    addPickerPreview();
    refreshMultiplayerTaken();

    const saveButton = document.querySelector("#savePlayer, #saveMultiplayerPlayer");
    if (saveButton && !saveButton.dataset.avatarGuardBound) {
      saveButton.dataset.avatarGuardBound = "true";
      saveButton.addEventListener("click", event => {
        const id = state?.draftPlayer?.avatarId;
        if (!id) return;
        const duplicate = (state?.players || []).some(player => player.avatarId === id);
        if (!duplicate) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        state.draftPlayer.avatarId = null;
        alert("Ce personnage est déjà utilisé dans la partie. Choisis-en un autre.");
        renderPlayerForm();
      }, true);
    }
  }

  if (typeof renderPlayerForm === "function") {
    const originalRenderPlayerForm = renderPlayerForm;
    renderPlayerForm = function (...args) {
      const result = originalRenderPlayerForm.apply(this, args);
      window.requestAnimationFrame(enhanceCharacterPicker);
      return result;
    };
  }

  function speechTarget() {
    const selectors = [
      ".giant-avatar [data-avatar-id]",
      ".handoff-stage [data-avatar-id]",
      ".prompt-player [data-avatar-id]",
      ".daring-round-speaker [data-avatar-id]",
      ".plead-speaker [data-avatar-id]",
      ".mime-actor-list [data-avatar-id]"
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    const winner = document.querySelector(".winner-stage + .final-ranking .ranking-row:first-child [data-avatar-id], .final-ranking .ranking-row:first-child [data-avatar-id]");
    return winner || null;
  }

  function enhancePoseImages() {
    document.querySelectorAll("img.ak-avatar-image[data-avatar-id]").forEach(image => {
      const id = image.dataset.avatarId;
      let pose = image.dataset.characterPose || "idle";
      let variant = image.dataset.characterVariant || "avatar-circle";

      if (image.closest(".giant-avatar")) {
        variant = "full";
        pose = image.closest(".winner-stage") ? "win" : "talk";
      } else if (image.closest(".winner-stage")) {
        variant = "full";
        pose = "win";
      } else if (image.closest(".character-picker-quote, .character-speech-bubble")) {
        variant = "bust";
        pose = image.closest(".character-speech-bubble")?.dataset.pose || pose || "talk";
      } else {
        variant = "avatar-circle";
        pose = "idle";
      }

      const next = posePath(id, pose, variant);
      if (next && image.getAttribute("src") !== next) image.setAttribute("src", next);
      image.dataset.characterPose = pose;
      image.dataset.characterVariant = variant;
      image.classList.remove("ak-character--idle", "ak-character--talk", "ak-character--hype", "ak-character--win", "ak-character--lose", "ak-character--full", "ak-character--bust", "ak-character--avatar-circle", "ak-character--icon");
      image.classList.add(`ak-character--${pose}`, `ak-character--${variant}`);
    });
  }

  let lastSpeechKey = "";
  let speechTimer = null;
  function maybeSpeak() {
    const target = speechTarget();
    if (!target || !screen?.isConnected) return;
    const id = target.dataset.avatarId;
    const heading = screen.querySelector("h2")?.textContent?.trim() || title?.textContent?.trim() || "";
    const isWinner = Boolean(screen.querySelector(".winner-stage"));
    const key = `${id}|${heading}|${isWinner ? "win" : "turn"}`;
    if (!id || key === lastSpeechKey) return;
    lastSpeechKey = key;
    const moment = isWinner ? "win" : "turn";
    const definition = definitionFor(id);
    screen.querySelector(".character-speech-bubble")?.remove();
    const bubble = document.createElement("aside");
    bubble.className = "character-speech-bubble";
    bubble.dataset.pose = poseForEvent(moment);
    bubble.setAttribute("aria-live", "polite");
    bubble.innerHTML = `<span>${imageMarkup(id, definition.name, { pose: poseForEvent(moment), variant: "bust" })}</span><p><strong>${definition.name}</strong> « ${randomLine(id, moment)} »</p>`;
    const anchor = screen.querySelector(".decision-grid, .toolbar, .primary-btn.full, .game-progress");
    if (anchor) anchor.insertAdjacentElement("beforebegin", bubble);
    else screen.appendChild(bubble);
    window.clearTimeout(speechTimer);
    speechTimer = window.setTimeout(() => bubble.classList.add("quiet"), 6500);
  }

  const observer = new MutationObserver(() => {
    window.clearTimeout(observer._timer);
    observer._timer = window.setTimeout(() => {
      enhanceCharacterPicker();
      enhanceLobbyCapacity();
      enhancePoseImages();
      maybeSpeak();
    }, 40);
  });
  if (screen) observer.observe(screen, { childList: true, subtree: true });

  window.AKCharacters = {
    definitions: CHARACTER_DEFINITIONS,
    randomLine,
    showPickerBubble,
    hidePickerBubble,
    enhanceCharacterPicker,
    enhancePoseImages,
    posePath,
    imageMarkup,
    say(id, moment = "turn") {
      const definition = definitionFor(id);
      return { name: definition.name, text: randomLine(id, moment), image: posePath(id, poseForEvent(moment), "bust") };
    }
  };

  window.AKCharacterVoice?.ready?.then(() => {
    enhancePoseImages();
  });
})();
