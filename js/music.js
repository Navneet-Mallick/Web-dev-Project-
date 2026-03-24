(function () {
  const toggleBtn = document.getElementById("music-toggle");
  const icon = document.getElementById("music-icon");
  const trackName = document.getElementById("music-track-name");
  const progressBar = document.getElementById("music-progress-bar");
  const volumeSlider = document.getElementById("music-volume");
  const player = document.getElementById("music-player");

  if (!toggleBtn) return;

  // Just replace this path with any audio file you want
  const TRACK = "Assets/demons_phonk.mp3";

  const audio = new Audio(TRACK);
  audio.loop = true;
  audio.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.6;

  // Show filename as track name (strip path + extension)
  const name = TRACK.split("/").pop().replace(/\.[^.]+$/, "").replace(/_/g, " ");
  if (trackName) trackName.textContent = name;

  let playing = false;

  audio.addEventListener("timeupdate", function () {
    if (progressBar && audio.duration) {
      progressBar.style.width = (audio.currentTime / audio.duration * 100) + "%";
    }
  });

  function setUI(state) {
    playing = state;
    icon.className = state ? "fas fa-pause" : "fas fa-play";
    if (trackName) trackName.textContent = state ? name + " ▶" : name;
    if (player) player.setAttribute("data-playing", state ? "true" : "false");
  }

  toggleBtn.addEventListener("click", function () {
    if (playing) {
      audio.pause();
      setUI(false);
    } else {
      audio.play().then(function () { setUI(true); }).catch(function (e) { console.warn(e); });
    }
  });

  if (volumeSlider) {
    volumeSlider.addEventListener("input", function () {
      audio.volume = parseFloat(volumeSlider.value);
    });
  }

  document.addEventListener("click", function autoPlay(e) {
    if (playing || e.target.closest("#music-player")) return;
    audio.play().then(function () { setUI(true); }).catch(function () {});
    document.removeEventListener("click", autoPlay);
  });
})();
