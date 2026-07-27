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
        select: ["Bon choix. J’allais justement te choisir aussi.", "On va gagner sans trop transpirer, d’accord ?"],
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
        select: ["Je viens, mais quelqu’un a prévu les snacks ?", "D’accord, mais je joue assise."],
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
        select: ["Tu as du goût. C’est déjà un bon début.", "Je suis sage. Enfin, en public."],
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
        select: ["On va jouer ensemble ? Trop bien !", "Je promets de faire de mon mieux !"],
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
        select: ["Enfin une décision raisonnable.", "Je savais que tu finirais par comprendre."],
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
        select: ["Tu viens de faire le choix le plus élégant.", "Avec moi, même perdre aura du style."],
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
        select: ["OUI ! Attends… on joue à quoi déjà ?", "Je suis prêt ! Enfin je crois !"],
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
        select: ["Je serai là… la plupart du temps.", "Tu m’as vu ? Parfait."],
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
        select: ["MISSION ACCEPTÉE ! C’était quoi la mission ?", "Scout Rrrrh au rapport !"],
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
        select: ["Votre jugement n’est pas entièrement mauvais.", "Très bien. Je prends la direction des opérations."],
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
        select: ["Moi ? D’accord… merci.", "Je vais essayer de ne pas glisser."],
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
        select: ["Enfin ! Mon public m’attendait !", "Je sens déjà le drame monter."],
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
        select: ["Je reste avec toi, on forme une équipe.", "Pas d’inquiétude, je suis là."],
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
        select: ["Bon. Au moins tu n’as pas choisi au hasard.", "Essaie de suivre le rythme."],
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
        select: ["On va passer un bon moment.", "Je suis content d’être dans ton équipe."],
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
        select: ["GO GO GO ! On commence quand ?", "Trop tard, j’ai déjà démarré !"],
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
        select: ["Parfait, j’avais justement huit choses à gérer.", "Je note ça quelque part… sur une tentacule."],
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

  function addPickerPreview() {
    const grid = document.querySelector(".avatar-grid");
    if (!grid) return;
    const selected = state?.draftPlayer?.avatarId;
    grid.querySelectorAll("[data-avatar]").forEach(button => {
      const id = button.dataset.avatar;
      const definition = definitionFor(id);
      const name = button.querySelector(".avatar-name");
      if (name && !button.querySelector(".avatar-personality")) {
        name.insertAdjacentHTML("afterend", `<span class="avatar-personality">${definition.personality}</span>`);
      }
    });
    grid.parentElement?.querySelector(".character-picker-quote")?.remove();
    if (!selected) return;
    const definition = definitionFor(selected);
    grid.insertAdjacentHTML("afterend", `
      <div class="character-picker-quote" aria-live="polite">
        <span>${imageMarkup(selected, definition.name, { pose: "talk", variant: "bust" })}</span>
        <p><strong>${definition.name}</strong> « ${randomLine(selected, "select")} »</p>
      </div>`);
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
