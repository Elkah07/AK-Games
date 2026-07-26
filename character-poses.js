(function () {
  "use strict";

  const BASE_PATH = "assets/characters";
  const POSES = new Set(["idle", "talk", "hype", "win", "lose"]);
  const SLUG_BY_AVATAR_ID = Object.freeze({
    frog: "croa", otter: "loki", panda: "kaia", dog: "bonnie",
    crow: "edgar", fox: "filou", duck: "nuggets", ghost: "vapo",
    dino: "rrrrh", cat: "sir-moustache", penguin: "snow",
    fish: "maurice", elephant: "moon", cactus: "spike",
    bear: "honey", rabbit: "flash", octopus: "marcellius"
  });

  const AVAILABLE_POSES = Object.freeze({
    croa: ["idle"], loki: ["idle"], kaia: ["idle"], bonnie: ["idle"],
    edgar: ["idle"], filou: ["idle"], nuggets: ["idle"], vapo: ["idle"],
    rrrrh: ["idle"], "sir-moustache": ["idle"], snow: ["idle"],
    maurice: ["idle"], moon: ["idle"], spike: ["idle"], honey: ["idle"],
    flash: ["idle"], marcellius: ["idle"]
  });

  function normalizeCharacterId(id) {
    if (!id || typeof id !== "string") return "croa";
    return SLUG_BY_AVATAR_ID[id] || id;
  }

  function normalizePose(pose) {
    return POSES.has(pose) ? pose : "idle";
  }

  function normalizeFormat(format) {
    if (["full", "bust", "avatar-circle", "icon"].includes(format)) return format;
    return "full";
  }

  function hasPose(characterId, pose) {
    const slug = normalizeCharacterId(characterId);
    return (AVAILABLE_POSES[slug] || ["idle"]).includes(normalizePose(pose));
  }

  function assetPath(characterId, options = {}) {
    const slug = normalizeCharacterId(characterId);
    const requestedPose = normalizePose(options.pose || "idle");
    const pose = hasPose(slug, requestedPose) ? requestedPose : "idle";
    const format = normalizeFormat(options.format || "full");
    const extension = options.extension === "png" ? "png" : "webp";
    return `${BASE_PATH}/${slug}/${pose}/${format}.${extension}`;
  }

  function applyImageFallback(img, characterId, options = {}) {
    if (!(img instanceof HTMLImageElement)) return img;
    const pngFallback = assetPath(characterId, {...options, extension: "png"});
    const idleFallback = assetPath(characterId, {pose: "idle", format: options.format, extension: "png"});
    let stage = 0;
    img.addEventListener("error", () => {
      stage += 1;
      if (stage === 1 && img.src !== pngFallback) img.src = pngFallback;
      else if (stage === 2 && img.src !== idleFallback) img.src = idleFallback;
    });
    return img;
  }

  function createImage(characterId, options = {}) {
    const img = document.createElement("img");
    const pose = normalizePose(options.pose || "idle");
    const format = normalizeFormat(options.format || "full");
    img.className = `ak-character ak-character--${pose} ak-character--${format}`;
    img.dataset.character = normalizeCharacterId(characterId);
    img.dataset.pose = pose;
    img.alt = options.alt || normalizeCharacterId(characterId);
    img.loading = options.loading || "lazy";
    img.decoding = "async";
    img.src = assetPath(characterId, {pose, format, extension: options.extension});
    return applyImageFallback(img, characterId, {pose, format});
  }

  function setPose(img, pose, options = {}) {
    if (!(img instanceof HTMLImageElement)) return;
    const characterId = options.characterId || img.dataset.character;
    const format = options.format || [...img.classList]
      .find(c => c.startsWith("ak-character--") && ["full","bust","avatar-circle","icon"].includes(c.slice(14)))
      ?.slice(14) || "full";
    const nextPose = normalizePose(pose);
    for (const p of POSES) img.classList.remove(`ak-character--${p}`);
    img.classList.add(`ak-character--${nextPose}`);
    img.dataset.pose = nextPose;
    img.src = assetPath(characterId, {pose: nextPose, format});
    applyImageFallback(img, characterId, {pose: nextPose, format});
  }

  function pictureMarkup(characterId, options = {}) {
    const pose = normalizePose(options.pose || "idle");
    const format = normalizeFormat(options.format || "full");
    const slug = normalizeCharacterId(characterId);
    const webp = assetPath(slug, {pose, format, extension: "webp"});
    const png = assetPath(slug, {pose, format, extension: "png"});
    const alt = String(options.alt || slug).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    return `<picture class="ak-character-picture ak-character-picture--${pose}">
      <source type="image/webp" srcset="${webp}">
      <img class="ak-character ak-character--${pose} ak-character--${format}" data-character="${slug}" data-pose="${pose}" src="${png}" alt="${alt}" loading="lazy" decoding="async">
    </picture>`;
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
