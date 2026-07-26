(function () {
  "use strict";

  const BASE_PATH = "assets/characters";
  const POSES = new Set(["idle", "talk", "hype", "win", "lose"]);
  const FORMATS = new Set(["full", "bust", "avatar-circle", "icon"]);
  const SLUG_BY_AVATAR_ID = Object.freeze({
    frog: "croa", otter: "loki", panda: "kaia", dog: "bonnie",
    crow: "edgar", fox: "filou", duck: "nuggets", ghost: "vapo",
    dino: "rrrrh", cat: "sir-moustache", penguin: "snow",
    fish: "maurice", elephant: "moon", cactus: "spike",
    bear: "honey", rabbit: "flash", octopus: "marcellius"
  });

  const AVAILABLE_POSES = Object.freeze({
    croa: new Set(["idle", "talk", "hype", "win", "lose"]),
    loki: new Set(["idle", "talk", "hype", "win", "lose"])
  });

  function normalizeCharacterId(id) {
    if (!id || typeof id !== "string") return "croa";
    return SLUG_BY_AVATAR_ID[id] || id;
  }

  function normalizePose(pose) {
    return POSES.has(pose) ? pose : "idle";
  }

  function normalizeFormat(format) {
    return FORMATS.has(format) ? format : "full";
  }

  function hasPose(characterId, pose) {
    const slug = normalizeCharacterId(characterId);
    const normalizedPose = normalizePose(pose);
    return normalizedPose === "idle" || AVAILABLE_POSES[slug]?.has(normalizedPose) === true;
  }

  function resolvedPose(characterId, pose) {
    const normalizedPose = normalizePose(pose);
    return hasPose(characterId, normalizedPose) ? normalizedPose : "idle";
  }

  function assetPath(characterId, options = {}) {
    const slug = normalizeCharacterId(characterId);
    const format = normalizeFormat(options.format || "full");
    const pose = resolvedPose(slug, options.pose || "idle");
    return `${BASE_PATH}/${slug}/${pose}/${format}.webp`;
  }

  function legacyPath(characterId) {
    return `${BASE_PATH}/${normalizeCharacterId(characterId)}.webp`;
  }

  function applyImageFallback(img, characterId) {
    if (!(img instanceof HTMLImageElement)) return img;
    let stage = 0;
    img.addEventListener("error", () => {
      if (stage === 0) {
        stage = 1;
        const formatClass = [...img.classList].find((c) =>
          c.startsWith("ak-character--") && FORMATS.has(c.slice(14))
        );
        const format = formatClass ? formatClass.slice(14) : "full";
        img.src = `${BASE_PATH}/${normalizeCharacterId(characterId)}/idle/${format}.webp`;
      } else if (stage === 1) {
        stage = 2;
        img.src = legacyPath(characterId);
      }
    });
    return img;
  }

  function createImage(characterId, options = {}) {
    const requestedPose = normalizePose(options.pose || "idle");
    const format = normalizeFormat(options.format || "full");
    const img = document.createElement("img");
    img.className = `ak-character ak-character--${requestedPose} ak-character--${format}`;
    img.dataset.character = normalizeCharacterId(characterId);
    img.dataset.pose = requestedPose;
    img.alt = options.alt || normalizeCharacterId(characterId);
    img.loading = options.loading || "lazy";
    img.decoding = "async";
    img.src = assetPath(characterId, { pose: requestedPose, format });
    return applyImageFallback(img, characterId);
  }

  function setPose(img, pose, options = {}) {
    if (!(img instanceof HTMLImageElement)) return;
    const characterId = options.characterId || img.dataset.character;
    const formatClass = [...img.classList].find((c) =>
      c.startsWith("ak-character--") && FORMATS.has(c.slice(14))
    );
    const format = options.format || (formatClass ? formatClass.slice(14) : "full");
    const nextPose = normalizePose(pose);
    for (const p of POSES) img.classList.remove(`ak-character--${p}`);
    img.classList.add(`ak-character--${nextPose}`);
    img.dataset.pose = nextPose;
    img.src = assetPath(characterId, { pose: nextPose, format });
    applyImageFallback(img, characterId);
  }

  function pictureMarkup(characterId, options = {}) {
    const pose = normalizePose(options.pose || "idle");
    const format = normalizeFormat(options.format || "full");
    const slug = normalizeCharacterId(characterId);
    const src = assetPath(slug, { pose, format });
    const alt = String(options.alt || slug)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;");
    return `<img class="ak-character ak-character--${pose} ak-character--${format}" data-character="${slug}" data-pose="${pose}" src="${src}" alt="${alt}" loading="lazy" decoding="async">`;
  }

  window.AKCharacterPoses = Object.freeze({
    poses: [...POSES],
    avatarIdToSlug: SLUG_BY_AVATAR_ID,
    normalizeCharacterId,
    hasPose,
    assetPath,
    createImage,
    setPose,
    pictureMarkup
  });
})();
