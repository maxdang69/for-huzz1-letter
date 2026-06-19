/* =========================================================================
   КОНФИГ — здесь меняешь контент, ничего больше трогать не нужно
   ========================================================================= */

// Текст на первой странице книжки. \n — перенос строки, пустая строка — отступ.
const letterText = `Для моей самой любимой huzz

Я сделал это, потому что хотел оставить тебе что-то особенное перед тем, как мы оба уедем.

Месяц — это не особо долго, но я буду скучать.

Я рад, что встретил тебя.

Мне нравится проводить с тобой время.
Мне нравится твоя улыбка.
Мне нравится, как ты смеешься с моих глупых шуток.
Мне нравится, как ты стестняешься.
Мне нравится, как мне хорошо и комфортно (слишком) рядом с тобой.

Ты очень красивая и милая, почти как я.
Но ещё сильнее мне нравится то, какая ты внутри.

Смешная, милая и хрупкая.

Тут не так много наших совместных фоток.
Но надеюсь, что мы будем пополнять их вместе еще долго-долго-долго.

Хорошо проведи время в Китае и возвращайся.
Буду ждать тебя. 
Дабль ю ризз?

iu em,
С любовью и уважением от твоего любимого anh Ốc❤`;

// Список фото в порядке показа. Дописывай сюда новые пути вручную —
// GitHub Pages не даёт получить список файлов папки автоматически.
// Поддерживаются .jpg, .jpeg, .png, .webp — просто укажи нужное расширение.
const PHOTO_EXTENSIONS = ["jpg", "png"];
const MAX_PHOTOS_TO_CHECK = 10;

let photos = [];

// Путь к музыке. Если файла нет — сайт не сломается, плеер просто молчит.
const MUSIC_SRC = "music/only.mp3";
const DEFAULT_VOLUME = 0.35;

const photoModal = document.getElementById("photoModal");
const photoModalImg = document.getElementById("photoModalImg");
const photoModalClose = document.getElementById("photoModalClose");


/* =========================================================================
   ФОНОВЫЙ ДЕКОР: сердечки + звёзды
   ========================================================================= */
function buildBgDecor() {
  const wrap = document.getElementById("bgDecor");
  if (!wrap) return;

  const HEARTS = 14;
  for (let i = 0; i < HEARTS; i++) {
    const h = document.createElement("div");
    h.className = "bg-heart";
    h.textContent = Math.random() > 0.5 ? "♥" : "❤";
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = (10 + Math.random() * 11).toFixed(0) + "px";
    const duration = 10 + Math.random() * 9;
    h.style.animationDuration = duration.toFixed(1) + "s";
    h.style.animationDelay = "-" + (Math.random() * duration).toFixed(1) + "s";
    h.style.setProperty("--drift", (Math.random() * 70 - 35).toFixed(0) + "px");
    wrap.appendChild(h);
  }

  const STARS = 28;
  for (let i = 0; i < STARS; i++) {
    const s = document.createElement("div");
    s.className = "bg-star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    const duration = 2 + Math.random() * 3;
    s.style.animationDuration = duration.toFixed(1) + "s";
    s.style.animationDelay = "-" + (Math.random() * duration).toFixed(1) + "s";
    wrap.appendChild(s);
  }
}

// Маленькое сердечко в месте тапа/клика — просто красивая мелочь
function bindTapHearts() {
  document.addEventListener("pointerdown", (e) => {
    const heart = document.createElement("div");
    heart.className = "tap-heart";
    heart.textContent = "❤";
    heart.style.left = e.clientX + "px";
    heart.style.top = e.clientY + "px";
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 950);
  });
}


/* =========================================================================
   АУДИО
   ========================================================================= */
const bgMusic = document.getElementById("bgMusic");
const volumeControl = document.getElementById("volumeControl");
const volumeSlider = document.getElementById("volumeSlider");
const bruhSound = document.getElementById("bruhSound");
let musicStarted = false;
let musicAvailable = true;

function initAudio() {
  bgMusic.volume = DEFAULT_VOLUME;
  volumeSlider.value = DEFAULT_VOLUME;
  bgMusic.src = MUSIC_SRC;

  // Если файл не нашёлся / не проигрывается — не ломаем страницу,
  // просто визуально "гасим" плеер громкости.
  bgMusic.addEventListener("error", () => {
    musicAvailable = false;
    volumeControl.style.opacity = "0.4";
    volumeControl.title = "Музыка не найдена: " + MUSIC_SRC;
  });

  volumeSlider.addEventListener("input", (e) => {
    bgMusic.volume = parseFloat(e.target.value);
    if (!musicStarted) startMusic();
  });
}

function playBruhSound() {
  if (!bruhSound) return;

  bruhSound.currentTime = 0;
  bruhSound.volume = 0.15;

  const playPromise = bruhSound.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => { });
  }
}

// Браузеры блокируют autoplay без действия пользователя,
// поэтому запускаем музыку только после нажатия "Открыть".
function startMusic() {
  if (musicStarted || !musicAvailable) return;
  musicStarted = true;
  const playPromise = bgMusic.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      // автоплей не разрешён — ничего страшного, не мешаем пользователю
      musicStarted = false;
    });
  }
}


/* =========================================================================
   ЭКРАН 1 — КОНВЕРТ + кнопка "Не открывать"
   ========================================================================= */
const introScreen = document.getElementById("introScreen");
const envelope = document.getElementById("envelope");
const openBtn = document.getElementById("openBtn");
const noBtn = document.getElementById("noBtn");
const heartSeal = document.getElementById("heartSeal");

function inflateRect(r, by) {
  return { left: r.left - by, top: r.top - by, right: r.right + by, bottom: r.bottom + by };
}

function overlapArea(a, b) {
  const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return w * h;
}

// Телепортация кнопки "Не открывать" в случайное безопасное место
function teleportNoBtn() {
  noBtn.classList.add("teleported");

  const margin = 14;
  const w = noBtn.offsetWidth || 130;
  const h = noBtn.offsetHeight || 48;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Зоны, которые нельзя перекрывать
  const obstacles = [inflateRect(openBtn.getBoundingClientRect(), 16)];

  const envStage = document.querySelector(".envelope-stage");
  if (envStage && introScreen.style.display !== "none") {
    obstacles.push(inflateRect(envStage.getBoundingClientRect(), 16));
  }

  const bookEl = document.getElementById("book");
  const bookScreenEl = document.getElementById("bookScreen");
  if (bookScreenEl.classList.contains("active")) {
    obstacles.push(inflateRect(bookEl.getBoundingClientRect(), 16));
  }

  let bestRect = null;
  let bestOverlap = Infinity;
  const maxX = Math.max(margin, vw - w - margin);
  const maxY = Math.max(margin, vh - h - margin);

  for (let attempt = 0; attempt < 50; attempt++) {
    const x = margin + Math.random() * (maxX - margin);
    const y = margin + Math.random() * (maxY - margin);
    const candidate = { left: x, top: y, right: x + w, bottom: y + h };
    const totalOverlap = obstacles.reduce((sum, o) => sum + overlapArea(candidate, o), 0);

    if (totalOverlap === 0) {
      bestRect = candidate;
      break;
    }
    if (totalOverlap < bestOverlap) {
      bestOverlap = totalOverlap;
      bestRect = candidate;
    }
  }

  if (!bestRect) bestRect = { left: margin, top: margin };

  noBtn.style.left = bestRect.left + "px";
  noBtn.style.top = bestRect.top + "px";

  // перезапускаем "прыжковую" анимацию
  noBtn.classList.remove("jump");
  void noBtn.offsetWidth; // форсируем reflow, чтобы анимация сыграла заново
  noBtn.classList.add("jump");
}

function bindNoButton() {
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    playBruhSound();
    teleportNoBtn();
  });
}

// Открытие конверта -> вспышка света -> переход к книжке
function openEnvelope() {
  if (envelope.classList.contains("is-open")) return;
  envelope.classList.add("is-open");

  const burst = document.createElement("div");
  burst.className = "envelope-burst play";
  envelope.appendChild(burst);

  startMusic();

  setTimeout(showBookScreen, 850);
}

function bindOpenControls() {
  openBtn.addEventListener("click", openEnvelope);
  heartSeal.addEventListener("click", openEnvelope);
}


/* =========================================================================
   ЭКРАН 2 — КНИЖКА
   ========================================================================= */
const bookScreen = document.getElementById("bookScreen");
const pageLeftContent = document.getElementById("pageLeftContent");
const pageRightContent = document.getElementById("pageRightContent");
const flipLayer = document.getElementById("flipLayer");
const arrowBack = document.getElementById("arrowBack");
const arrowForward = document.getElementById("arrowForward");
const pageIndicator = document.getElementById("pageIndicator");
const backToEnvelope = document.getElementById("backToEnvelope");

let spreads = [];
let currentSpread = 0;
let isFlipping = false;

function pixelHeartSVG(extraClass) {
  return `<div class="${extraClass} pixel-heart-char" aria-hidden="true">❤</div>`;
}

function returnToEnvelope() {
  bookScreen.classList.remove("active");
  bookScreen.setAttribute("aria-hidden", "true");

  introScreen.style.display = "";
  envelope.classList.remove("is-open");

  const burst = envelope.querySelector(".envelope-burst");
  if (burst) burst.remove();

  currentSpread = 0;
  isFlipping = false;
  flipLayer.innerHTML = "";
}

// Собираем "развороты": 0-й — письмо, дальше — фото по 2 на разворот
function buildSpreads() {
  spreads = [{ type: "letter" }];
  for (let i = 0; i < photos.length; i += 2) {
    spreads.push({ type: "photo", left: photos[i] || null, right: photos[i + 1] || null });
  }
  if (photos.length === 0) {
    spreads.push({ type: "photo", left: null, right: null });
  }
}

function letterPageHTML() {
  return `
    <div class="letter-page">
      <p class="letter-heading"><span class="mini-heart">❤</span> Письмо Тиен</p>
      <p class="letter-text">${escapeHTML(letterText)}</p>
    </div>`;
}

function letterDecoHTML() {
  return `
    <div class="deco-page">
      ${pixelHeartSVG("deco-big-heart")}
      <p class="deco-label">ЛИСТАЙ ДАЛЬШЕ →</p>
    </div>`;
}

function photoSlotHTML(src, indexInAll) {
  if (!src) {
    return `
      <div class="deco-page">
        ${pixelHeartSVG("deco-big-heart")}
        <p class="deco-label">КОНЕЦ</p>
      </div>`;
  }
  const num = indexInAll + 1;
  return `
    <div class="photo-page">
      <div class="photo-frame">
        <span class="pixel-corner pc-tl">❤</span>
        <span class="pixel-corner pc-tr">❤</span>
        <span class="pixel-corner pc-bl">❤</span>
        <span class="pixel-corner pc-br">❤</span>
        <img src="${src}" alt="Фото №${num}">
      </div>
      <p class="photo-caption">ФОТО №${num}</p>
    </div>`;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function checkImageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadPhotosAutomatically() {
  const found = [];

  for (let i = 1; i <= MAX_PHOTOS_TO_CHECK; i++) {
    let foundForThisNumber = null;

    for (const ext of PHOTO_EXTENSIONS) {
      const src = `photos/${i}.${ext}`;
      const result = await checkImageExists(src);

      if (result) {
        foundForThisNumber = result;
        break;
      }
    }

    if (foundForThisNumber) {
      found.push(foundForThisNumber);
    }
  }

  photos = found;
}

// Если фото не загрузилось — заменяем рамку на понятную плашку,
// сайт при этом не ломается (как и требуется для музыки).
function bindImageFallbacks(container) {
  container.querySelectorAll("img").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        const wrap = img.closest(".photo-page");
        if (!wrap) return;
        const src = img.getAttribute("src") || "";
        const alt = img.getAttribute("alt") || "Фото";
        wrap.innerHTML = `<div class="photo-empty">${escapeHTML(alt)} не загрузилось<br>(проверь файл ${escapeHTML(src)})</div>`;
      },
      { once: true }
    );

    img.addEventListener("click", () => {
      openPhotoModal(img.src);
    });
  });
}

let modalHeartsInterval = null;

function openPhotoModal(src) {
  photoModalImg.src = src;
  photoModal.classList.add("active");
  photoModal.setAttribute("aria-hidden", "false");

  modalHeartsInterval = setInterval(spawnModalHeart, 220);
}

function closePhotoModal() {
  photoModal.classList.remove("active");
  photoModal.setAttribute("aria-hidden", "true");
  photoModalImg.src = "";

  clearInterval(modalHeartsInterval);
  modalHeartsInterval = null;
}

function spawnModalHeart() {
  if (!photoModal.classList.contains("active")) return;

  const el = document.createElement("div");
  el.className = "photo-modal-float";

  // 8% шанс какашки
  el.textContent = Math.random() < 0.4 ? "💩" : "❤";

  el.style.left = Math.random() * 100 + "vw";
  el.style.top = 70 + Math.random() * 25 + "vh";

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}

function spreadHTML(spread) {
  if (spread.type === "letter") {
    return { left: letterPageHTML(), right: letterDecoHTML() };
  }
  // находим глобальные индексы фото для подписи "Фото №N"
  const leftIdx = spread.left ? photos.indexOf(spread.left) : -1;
  const rightIdx = spread.right ? photos.indexOf(spread.right) : -1;
  return {
    left: photoSlotHTML(spread.left, leftIdx),
    right: photoSlotHTML(spread.right, rightIdx),
  };
}

function updateNav() {
  pageIndicator.textContent = `${currentSpread + 1} / ${spreads.length}`;
  arrowBack.disabled = currentSpread === 0;
  arrowForward.disabled = currentSpread === spreads.length - 1;
}

function renderCurrentSpread() {
  const html = spreadHTML(spreads[currentSpread]);
  pageLeftContent.innerHTML = html.left;
  pageRightContent.innerHTML = html.right;
  bindImageFallbacks(pageLeftContent);
  bindImageFallbacks(pageRightContent);
  updateNav();
}

// Анимация перелистывания: клонируем текущую видимую страницу,
// "переворачиваем" её через rotateY, в середине анимации подменяем
// настоящий контент под ней, затем убираем клон.
function flipTo(targetIndex, direction) {
  if (isFlipping) return;
  if (targetIndex < 0 || targetIndex >= spreads.length) return;
  isFlipping = true;

  flipLayer.innerHTML = "";

  const sourceContent = direction === "forward" ? pageRightContent.innerHTML : pageLeftContent.innerHTML;
  const sideClass = direction === "forward" ? "from-right" : "from-left";

  // .flip-page — это лист целиком (вращается), внутри две статичные грани
  const sheet = document.createElement("div");
  sheet.className = `flip-page ${sideClass}`;

  const front = document.createElement("div");
  front.className = "flip-face front";
  front.innerHTML = `<div class="page-content">${sourceContent}</div>`;

  const back = document.createElement("div");
  back.className = "flip-face back";

  sheet.appendChild(front);
  sheet.appendChild(back);
  flipLayer.appendChild(sheet);

  // запускаем анимацию на следующем кадре, чтобы transition сработал
  requestAnimationFrame(() => {
    flipLayer.classList.add("animating");
  });

  setTimeout(() => {
    currentSpread = targetIndex;
    renderCurrentSpread();
  }, 300);

  setTimeout(() => {
    flipLayer.classList.remove("animating");
    flipLayer.innerHTML = "";
    isFlipping = false;
  }, 660);
}

function bindBookNav() {
  arrowForward.addEventListener("click", () => flipTo(currentSpread + 1, "forward"));
  arrowBack.addEventListener("click", () => flipTo(currentSpread - 1, "backward"));

  // свайпы для мобильных
  let touchStartX = null;
  const bookEl = document.getElementById("book");
  bookEl.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  bookEl.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) flipTo(currentSpread + 1, "forward");
      else flipTo(currentSpread - 1, "backward");
    }
    touchStartX = null;
  }, { passive: true });
}

function showBookScreen() {
  introScreen.style.display = "none";
  bookScreen.removeAttribute("aria-hidden");
  bookScreen.classList.add("active");

  photos = [];
  buildSpreads();
  currentSpread = 0;
  renderCurrentSpread();

  loadPhotosAutomatically().then(() => {
    buildSpreads();
    currentSpread = 0;
    renderCurrentSpread();
  });
}


/* =========================================================================
   СТАРТ
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  buildBgDecor();
  bindTapHearts();
  initAudio();
  bindOpenControls();
  bindNoButton();
  bindBookNav();
  backToEnvelope.addEventListener("click", returnToEnvelope);
  photoModalClose.addEventListener("click", closePhotoModal);

  photoModal.addEventListener("click", (e) => {
    if (e.target === photoModal) closePhotoModal();
  });
});
