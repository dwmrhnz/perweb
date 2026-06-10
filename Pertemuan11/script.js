const tiers = {
  none: { level: 0, name: "Belum Berlangganan", qualities: [] },
  lite: { level: 1, name: "Lite", qualities: ["480p", "720p"] },
  standar: { level: 2, name: "Standar", qualities: ["480p", "720p", "1080p"] },
  premium: { level: 3, name: "Premium", qualities: ["480p", "720p", "1080p", "4K HDR"] }
};

const plans = [
  {
    id: "lite",
    name: "Lite",
    monthly: 39000,
    yearly: 390000,
    tagline: "Masuk ke koleksi utama dengan kualitas nyaman.",
    benefits: [
      "Akses film tier Lite",
      "Kualitas sampai 720p",
      "1 perangkat aktif",
      "Iklan pembuka singkat"
    ]
  },
  {
    id: "standar",
    name: "Standar",
    monthly: 79000,
    yearly: 790000,
    tagline: "Pilihan seimbang untuk katalog lebih luas.",
    benefits: [
      "Akses film Lite dan Standar",
      "Kualitas sampai 1080p",
      "2 perangkat aktif",
      "Tanpa iklan pembuka"
    ],
    featured: true
  },
  {
    id: "premium",
    name: "Premium",
    monthly: 119000,
    yearly: 1190000,
    tagline: "Semua film, fitur lengkap, dan kualitas tertinggi.",
    benefits: [
      "Akses seluruh katalog",
      "Kualitas sampai 4K HDR",
      "4 perangkat aktif",
      "Download offline dummy"
    ]
  }
];

const movies = [
  {
    title: "Iron Man",
    year: "2008",
    runtime: "2j 6m",
    tier: "lite",
    description: "Tony Stark membangun armor pertamanya dan membuka era pahlawan modern.",
    poster: "assets/thumbnails/iron-man.svg",
    palette: ["#11111a", "#5b1f35", "rgba(239, 68, 68, 0.92)"],
    tilt: "-8deg"
  },
  {
    title: "Captain America: The First Avenger",
    year: "2011",
    runtime: "2j 4m",
    tier: "lite",
    description: "Steve Rogers berubah dari prajurit biasa menjadi simbol keberanian.",
    poster: "assets/thumbnails/captain-america-the-first-avenger.svg",
    palette: ["#0f172a", "#312e81", "rgba(96, 165, 250, 0.9)"],
    tilt: "10deg"
  },
  {
    title: "Thor",
    year: "2011",
    runtime: "1j 55m",
    tier: "lite",
    description: "Pangeran Asgard belajar arti tanggung jawab di bumi.",
    poster: "assets/thumbnails/thor.svg",
    palette: ["#121018", "#4c1d95", "rgba(196, 181, 253, 0.88)"],
    tilt: "-16deg"
  },
  {
    title: "The Avengers",
    year: "2012",
    runtime: "2j 23m",
    tier: "standar",
    description: "Para pahlawan pertama kali bersatu menghadapi ancaman besar.",
    poster: "assets/thumbnails/the-avengers.svg",
    palette: ["#070711", "#1f2937", "rgba(139, 92, 246, 0.95)"],
    tilt: "7deg"
  },
  {
    title: "Guardians of the Galaxy",
    year: "2014",
    runtime: "2j 1m",
    tier: "standar",
    description: "Tim antargalaksi tak terduga menjaga orb misterius.",
    poster: "assets/thumbnails/guardians-of-the-galaxy.svg",
    palette: ["#111827", "#581c87", "rgba(236, 72, 153, 0.88)"],
    tilt: "-12deg"
  },
  {
    title: "Black Panther",
    year: "2018",
    runtime: "2j 14m",
    tier: "standar",
    description: "T'Challa menjaga Wakanda dan warisan takhta yang penuh konflik.",
    poster: "assets/thumbnails/black-panther.svg",
    palette: ["#06040a", "#2e1065", "rgba(168, 85, 247, 0.96)"],
    tilt: "13deg"
  },
  {
    title: "Avengers: Infinity War",
    year: "2018",
    runtime: "2j 29m",
    tier: "premium",
    description: "Seluruh penjuru semesta menghadapi ancaman dari Thanos.",
    poster: "assets/thumbnails/avengers-infinity-war.svg",
    palette: ["#13081c", "#581c87", "rgba(250, 204, 21, 0.86)"],
    tilt: "-5deg"
  },
  {
    title: "Avengers: Endgame",
    year: "2019",
    runtime: "3j 1m",
    tier: "premium",
    description: "Para Avengers melakukan perjalanan terakhir untuk memulihkan semesta.",
    poster: "assets/thumbnails/avengers-endgame.svg",
    palette: ["#050507", "#4c1d95", "rgba(255, 255, 255, 0.9)"],
    tilt: "11deg"
  }
];

const state = {
  billing: "monthly",
  filter: "all",
  selectedPlan: null,
  selectedMovie: movies[7],
  progressTimer: null,
  progress: 24
};

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

const movieGrid = document.querySelector("#movie-grid");
const plansGrid = document.querySelector("#plans-grid");
const checkoutModal = document.querySelector("#checkout-modal");
const playerModal = document.querySelector("#player-modal");
const checkoutTitle = document.querySelector("#checkout-title");
const checkoutCopy = document.querySelector("#checkout-copy");
const checkoutForm = document.querySelector("#checkout-form");
const payButton = document.querySelector("#pay-button");
const accountTitle = document.querySelector("#account-title");
const accountCopy = document.querySelector("#account-copy");
const toast = document.querySelector("#toast");
const dummyVideo = document.querySelector("#dummy-video");
const progressFill = document.querySelector("#progress-fill");
const playToggle = document.querySelector("#play-toggle");
const playerTitle = document.querySelector("#player-title");
const playerTier = document.querySelector("#player-tier");
const playerDescription = document.querySelector("#player-description");
const qualityRow = document.querySelector("#quality-row");
const navLinks = document.querySelector(".nav-links");
const siteAudio = document.querySelector("#site-audio");
const audioToggle = document.querySelector("[data-audio-toggle]");
let audioAutoplayBlocked = false;

function getSubscription() {
  try {
    return JSON.parse(localStorage.getItem("marvel-stream-subscription")) || null;
  } catch {
    return null;
  }
}

function saveSubscription(subscription) {
  localStorage.setItem("marvel-stream-subscription", JSON.stringify(subscription));
}

function getCurrentTierId() {
  return getSubscription()?.plan || "none";
}

function canAccess(requiredTier) {
  return tiers[getCurrentTierId()].level >= tiers[requiredTier].level;
}

function renderAccount() {
  const subscription = getSubscription();

  if (!subscription) {
    accountTitle.textContent = "Belum berlangganan";
    accountCopy.textContent = "Pilih paket untuk membuka akses film dan fitur streaming.";
    return;
  }

  const plan = plans.find((item) => item.id === subscription.plan);
  const billingText = subscription.billing === "yearly" ? "tahunan" : "bulanan";
  accountTitle.textContent = `Aktif: ${plan.name}`;
  accountCopy.textContent = `Tagihan ${billingText} aktif untuk ${subscription.name}. Kualitas tertinggi: ${tiers[plan.id].qualities.at(-1)}.`;
}

function renderMovies() {
  const filteredMovies = state.filter === "all"
    ? movies
    : movies.filter((movie) => movie.tier === state.filter);

  movieGrid.innerHTML = filteredMovies.map((movie, index) => {
    const locked = !canAccess(movie.tier);
    const [from, to, accent] = movie.palette;
    const style = `--from:${from}; --to:${to}; --accent:${accent}; --tilt:${movie.tilt}; --x:${62 + (index % 3) * 8}%; --y:${18 + (index % 2) * 12}%`;

    return `
      <article class="movie-card ${locked ? "locked" : ""}">
        <div class="poster" style="${style}">
          <img class="poster-image" src="${movie.poster}" alt="Thumbnail ${movie.title}" loading="lazy">
          <span class="tier-badge">${tiers[movie.tier].name}</span>
          ${locked ? '<span class="status-badge">Locked</span>' : '<span class="status-badge">Open</span>'}
        </div>
        <div class="movie-body">
          <div>
            <h3>${movie.title}</h3>
            <span class="movie-meta">${movie.year} &bull; ${movie.runtime}</span>
          </div>
          <p class="movie-description">${movie.description}</p>
          <div class="movie-actions">
            <button class="watch-button" type="button" data-movie="${movie.title}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z"></path>
              </svg>
              ${locked ? "Upgrade" : "Tonton"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderPlans() {
  const currentTier = getCurrentTierId();

  plansGrid.innerHTML = plans.map((plan) => {
    const price = plan[state.billing];
    const active = currentTier === plan.id;
    const period = state.billing === "yearly" ? "/tahun" : "/bulan";

    return `
      <article class="plan-card ${plan.featured ? "featured" : ""} ${active ? "current" : ""}">
        <div class="plan-top">
          <div>
            <p class="eyebrow">${active ? "Paket Aktif" : "Subscription"}</p>
            <h3>${plan.name}</h3>
          </div>
          ${plan.featured ? '<span class="tier-badge">Popular</span>' : ""}
        </div>
        <p class="plan-price"><strong>${money.format(price)}</strong><span>${period}</span></p>
        <p class="plan-description">${plan.tagline}</p>
        <ul class="benefit-list">
          ${plan.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
        </ul>
        <div class="plan-actions">
          <button class="${active ? "ghost-button" : "primary-button"} full" type="button" data-plan="${plan.id}">
            ${active ? "Paket Sedang Aktif" : "Beli Paket"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function openCheckout(planId) {
  const plan = plans.find((item) => item.id === planId);
  state.selectedPlan = plan;
  const price = money.format(plan[state.billing]);
  const period = state.billing === "yearly" ? "tahunan" : "bulanan";

  checkoutTitle.textContent = `Aktifkan ${plan.name}`;
  checkoutCopy.textContent = `${price} untuk paket ${period}. Setelah pembayaran dummy berhasil, akses ${plan.name} langsung aktif di katalog.`;
  payButton.textContent = `Bayar ${price}`;
  checkoutModal.classList.add("active");
  checkoutModal.setAttribute("aria-hidden", "false");
  checkoutForm.elements.name.focus();
}

function closeCheckout() {
  checkoutModal.classList.remove("active");
  checkoutModal.setAttribute("aria-hidden", "true");
  checkoutForm.reset();
}

function openPlayer(movie) {
  state.selectedMovie = movie;
  playerTitle.textContent = movie.title;
  playerTier.textContent = `${tiers[movie.tier].name} Access`;
  playerDescription.textContent = `${movie.description} Video yang diputar adalah dummy cinematic stream untuk simulasi website.`;
  renderQualities();
  playerModal.classList.add("active");
  playerModal.setAttribute("aria-hidden", "false");
  startPlayback();
}

function closePlayer() {
  playerModal.classList.remove("active");
  playerModal.setAttribute("aria-hidden", "true");
  stopPlayback();
}

function renderQualities() {
  const allowed = tiers[getCurrentTierId()].qualities;
  const allQualities = ["480p", "720p", "1080p", "4K HDR"];
  qualityRow.innerHTML = allQualities.map((quality) => {
    const available = allowed.includes(quality);
    return `<span class="quality-chip ${available ? "available" : ""}">${quality}${available ? "" : " locked"}</span>`;
  }).join("");
}

function startPlayback() {
  dummyVideo.classList.add("playing");
  clearInterval(state.progressTimer);
  state.progressTimer = setInterval(() => {
    state.progress = state.progress >= 100 ? 0 : state.progress + 1;
    progressFill.style.width = `${state.progress}%`;
  }, 450);
}

function stopPlayback() {
  dummyVideo.classList.remove("playing");
  clearInterval(state.progressTimer);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("active");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("active"), 3200);
}

function updateAudioButton(isPlaying) {
  audioToggle.classList.toggle("playing", isPlaying);
  audioToggle.setAttribute("aria-label", isPlaying ? "Jeda musik" : "Putar musik");
  audioToggle.setAttribute("title", isPlaying ? "Jeda musik" : "Putar musik");
}

function playSiteAudio(options = {}) {
  return siteAudio.play()
    .then(() => {
      audioAutoplayBlocked = false;
      updateAudioButton(true);
    })
    .catch(() => {
      audioAutoplayBlocked = true;
      updateAudioButton(false);
      if (!options.silent) {
        showToast("Autoplay diblokir browser. Klik tombol musik untuk memutar lagu.");
      }
    });
}

function pauseSiteAudio() {
  siteAudio.pause();
  updateAudioButton(false);
}

function setupAudio() {
  siteAudio.volume = 0.42;
  playSiteAudio({ silent: true });
}

function refresh() {
  renderAccount();
  renderMovies();
  renderPlans();
}

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scrollTarget).scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("[data-featured-play]").addEventListener("click", () => {
  const movie = movies.find((item) => item.title === "Avengers: Endgame");

  if (!canAccess(movie.tier)) {
    showToast("Avengers: Endgame membutuhkan paket Premium.");
    document.querySelector("#plans").scrollIntoView({ behavior: "smooth" });
    return;
  }

  openPlayer(movie);
});

document.querySelector("[data-menu-toggle]").addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

audioToggle.addEventListener("click", () => {
  if (siteAudio.paused) {
    playSiteAudio();
    return;
  }

  pauseSiteAudio();
});

document.querySelectorAll(".filter-pill").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-pill").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    renderMovies();
  });
});

document.querySelectorAll(".billing-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".billing-option").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.billing = button.dataset.billing;
    renderPlans();
  });
});

movieGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-movie]");
  if (!button) return;

  const movie = movies.find((item) => item.title === button.dataset.movie);

  if (!canAccess(movie.tier)) {
    showToast(`${movie.title} membutuhkan paket ${tiers[movie.tier].name}.`);
    document.querySelector("#plans").scrollIntoView({ behavior: "smooth" });
    return;
  }

  openPlayer(movie);
});

plansGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-plan]");
  if (!button) return;

  if (getCurrentTierId() === button.dataset.plan) {
    showToast("Paket ini sudah aktif.");
    return;
  }

  openCheckout(button.dataset.plan);
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(checkoutForm);
  const originalLabel = payButton.textContent;

  payButton.disabled = true;
  payButton.textContent = "Memproses...";

  setTimeout(() => {
    saveSubscription({
      plan: state.selectedPlan.id,
      billing: state.billing,
      name: formData.get("name"),
      email: formData.get("email"),
      purchasedAt: new Date().toISOString()
    });

    payButton.disabled = false;
    payButton.textContent = originalLabel;
    closeCheckout();
    refresh();
    showToast(`Pembayaran dummy berhasil. Paket ${state.selectedPlan.name} aktif.`);
  }, 900);
});

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeCheckout);
});

document.querySelectorAll("[data-close-player]").forEach((element) => {
  element.addEventListener("click", closePlayer);
});

playToggle.addEventListener("click", () => {
  if (dummyVideo.classList.contains("playing")) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeCheckout();
  closePlayer();
});

window.addEventListener("pointerdown", (event) => {
  if (!audioAutoplayBlocked || !siteAudio.paused) return;
  if (event.target.closest("[data-audio-toggle]")) return;
  playSiteAudio({ silent: true });
}, { once: true });

refresh();
setupAudio();
