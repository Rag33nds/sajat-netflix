document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const seasonContainer = document.getElementById("season-container");
  // A currentProfile lekérése
  const currentProfile = localStorage.getItem('currentProfile');

  // Video container létrehozása
  const videoContainer = document.createElement("div");
  videoContainer.id = "video-container";
  document.querySelector("#main-container").prepend(videoContainer);

  const videoWrapper = document.createElement("div");
  videoWrapper.id = "video-wrapper";
  videoContainer.appendChild(videoWrapper);

  const videoPlayer = document.createElement("iframe");
  videoPlayer.allow = "autoplay";
  videoPlayer.allowFullscreen = true;
  videoWrapper.appendChild(videoPlayer);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "❌ Bezárás";
  closeBtn.className = "close-btn";
  videoContainer.insertBefore(closeBtn, videoWrapper);
  
  const searchInput = document.getElementById('searchInput');
let allShows = []; // Itt tároljuk az összes műsort

searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredShows = allShows.filter(show => 
      show.title.toLowerCase().includes(searchTerm)
  );
  
  content.innerHTML = '';
  
  filteredShows.forEach(show => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
          <img src="${show.cover}" alt="${show.title}" />
          <h3>${show.title}</h3>
      `;
      card.addEventListener("click", () => showContent(show)); // Itt is változtattuk
      content.appendChild(card);
  });
});

  // Profilonként külön tároljuk a megtekintett epizódokat
  const watchedEpisodes = JSON.parse(localStorage.getItem(`watchedEpisodes_${currentProfile}`)) || {};

  function closeVideo() {
      videoContainer.style.display = "none";
      videoPlayer.src = "";
  }

  function getVideoEmbedUrl(videoId, source) {
    switch(source) {
        case 'drive':
            return `https://drive.google.com/file/d/${videoId}/preview`;
        case 'dailymotion':
            return `https://www.dailymotion.com/embed/video/${videoId}`;
        case 'vimeo':
            return `https://player.vimeo.com/video/${videoId}`;
        case 'streamsb':
            return `https://streamsb.net/e/${videoId}`;
        case 'streamtape':
            return `https://streamtape.com/e/${videoId}`;
        default:
            return videoId;
    }
}

  closeBtn.addEventListener("click", closeVideo);

  function showContent(show) {
    if (show.type === "movie") {
        // Ha film, akkor egyből lejátsszuk
        content.style.display = "none";
        seasonContainer.innerHTML = "";
        
        if (!show.videoId) {
            alert("A film jelenleg nem elérhető.");
            return;
        }

        const videoUrl = getVideoEmbedUrl(show.videoId, show.source || 'drive');
        videoPlayer.src = videoUrl;
        videoContainer.style.display = "block";
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Vissza gomb a főoldalra
        const backBtn = document.createElement("button");
        backBtn.textContent = "← Vissza a főoldalra";
        backBtn.className = "back-btn";
        backBtn.addEventListener("click", () => {
            content.style.display = "flex";
            seasonContainer.innerHTML = "";
            closeVideo();
        });
        seasonContainer.appendChild(backBtn);
    } else {
        // Ha sorozat, akkor mutatjuk az évadokat
        content.style.display = "none";
        seasonContainer.innerHTML = "";
        closeVideo();
        
        const seasonsTitle = document.createElement("h2");
        seasonsTitle.textContent = "Évadok";
        seasonsTitle.style.textAlign = "center";
        seasonsTitle.style.marginBottom = "15px";
        seasonContainer.appendChild(seasonsTitle);
        
        show.seasons.forEach(season => {
            const btn = document.createElement("button");
            btn.textContent = season.name;
            btn.className = "season-btn";
            btn.addEventListener("click", () => showEpisodes(show, season));
            seasonContainer.appendChild(btn);
        });

        // Vissza gomb a főoldalra
        const backBtn = document.createElement("button");
        backBtn.textContent = "← Vissza a főoldalra";
        backBtn.className = "back-btn";
        backBtn.addEventListener("click", () => {
            content.style.display = "flex"; // Itt változtattuk flex-re!
            seasonContainer.innerHTML = "";
        });
        seasonContainer.appendChild(backBtn);
    }
}


  function showEpisodes(show, season) {
      seasonContainer.innerHTML = "";
      
      const episodesTitle = document.createElement("h2");
      episodesTitle.textContent = `${season.name} epizódok`;
      episodesTitle.style.textAlign = "center";
      episodesTitle.style.marginBottom = "15px";
      seasonContainer.appendChild(episodesTitle);

      season.episodes.forEach((episode, index) => {
          const epBtn = document.createElement("button");
          epBtn.textContent = index + 1;
          epBtn.className = "episode-btn";
          
          const episodeId = `${show.title}-${season.name}-${index + 1}`;
          if (watchedEpisodes[episodeId]) {
              epBtn.classList.add('watched');
          }

          epBtn.addEventListener("click", () => {
              if (!episode.videoId || episode.videoId === "?") {
                  alert("Ez az epizód még nem elérhető.");
                  return;
              }

              if (videoPlayer.src.includes(episode.videoId)) {
                  return;
              }

              videoPlayer.src = getVideoEmbedUrl(episode.videoId, episode.source || 'drive');
              videoContainer.style.display = "block";
              
              window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
              });

              watchedEpisodes[episodeId] = true;
              // Profilonként mentjük a megtekintett epizódokat
              localStorage.setItem(`watchedEpisodes_${currentProfile}`, JSON.stringify(watchedEpisodes));
              epBtn.classList.add('watched');
          });
          seasonContainer.appendChild(epBtn);
      });

      // Vissza gomb az évadokhoz
      const backBtn = document.createElement("button");
      backBtn.textContent = "← Vissza az évadokhoz";
      backBtn.className = "back-btn";
      backBtn.addEventListener("click", () => {
        // Töröljük az epizódokat és újra megjelenítjük az évadokat
        seasonContainer.innerHTML = "";
        videoContainer.style.display = "none";
        const seasonsTitle = document.createElement("h2");
        seasonsTitle.textContent = "Évadok";
        seasonsTitle.style.textAlign = "center";
        seasonsTitle.style.marginBottom = "15px";
        seasonContainer.appendChild(seasonsTitle);
        show.seasons.forEach(seasonObj => {
          const btn = document.createElement("button");
          btn.textContent = seasonObj.name;
          btn.className = "season-btn";
          btn.addEventListener("click", () => showEpisodes(show, seasonObj));
          seasonContainer.appendChild(btn);
        });
        // Vissza gomb a főoldalra
        const backBtnMain = document.createElement("button");
        backBtnMain.textContent = "← Vissza a főoldalra";
        backBtnMain.className = "back-btn";
        backBtnMain.addEventListener("click", () => {
          content.style.display = "flex";
          seasonContainer.innerHTML = "";
          videoContainer.style.display = "none";
        });
        seasonContainer.appendChild(backBtnMain);
      });
      seasonContainer.appendChild(backBtn);
  }

  fetch("data/gumball.json")
    .then(res => res.json())
    .then(data => {
        allShows = data; // Mentsük el az összes műsort
        data.forEach(show => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${show.cover}" alt="${show.title}" />
                <h3>${show.title}</h3>
            `;
            card.addEventListener("click", () => showContent(show));
            content.appendChild(card);
        });
    });
});
