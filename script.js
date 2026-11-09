const header = document.getElementById('site-header');
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('primary-menu');
const navLinks = [...document.querySelectorAll('.nav-links a')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

function updateActiveLink() {
  const activationLine = header.offsetHeight + 80;
  const activeSection = [...sections].reverse().find((section) => (
    section.getBoundingClientRect().top <= activationLine
  )) || sections[0];

  navLinks.forEach((link) => {
    if (link.hash === `#${activeSection.id}`) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

updateHeader();
updateActiveLink();
window.addEventListener('scroll', () => {
  updateHeader();
  updateActiveLink();
}, { passive: true });

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '開啟導覽選單');
  menu.classList.remove('is-open');
}

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  menuToggle.setAttribute('aria-label', isExpanded ? '開啟導覽選單' : '關閉導覽選單');
  menu.classList.toggle('is-open', !isExpanded);
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    event.preventDefault();
    closeMenu();
    history.pushState(null, '', link.hash);
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-enabled');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

const tracks = [
  {
    title: 'Suit Up',
    artist: 'SUPER JUNIOR-L.S.S.',
    src: "images/audio/SUPER JUNIOR-L.S.S. 슈퍼주니어-L.S.S. 'Suit Up' MV.mp3",
  },
  {
    title: '조크든요 (JOKE)',
    artist: 'SUPER JUNIOR-L.S.S.',
    src: "images/audio/SUPER JUNIOR-L.S.S. 슈퍼주니어-L.S.S. '조크든요 (JOKE)' MV.mp3",
  },
];
const audio = document.getElementById('audio-player');
const player = document.querySelector('.player');
const playToggle = document.getElementById('play-toggle');
const previousTrack = document.getElementById('previous-track');
const nextTrack = document.getElementById('next-track');
const seekBar = document.getElementById('seek-bar');
const volumeBar = document.getElementById('volume-bar');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const audioStatus = document.getElementById('audio-status');
const currentTimeLabel = document.getElementById('current-time');
const durationLabel = document.getElementById('duration');
const trackList = document.getElementById('track-list');
let currentTrackIndex = -1;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function renderTrackList() {
  trackList.replaceChildren();

  tracks.forEach((track, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const title = document.createElement('span');
    const artist = document.createElement('span');

    button.type = 'button';
    button.dataset.trackIndex = String(index);
    title.textContent = track.title;
    artist.textContent = track.artist;
    button.append(title, artist);
    item.append(button);
    trackList.append(item);
  });
}

function updateTrackSelection() {
  trackList.querySelectorAll('button').forEach((button) => {
    if (Number(button.dataset.trackIndex) === currentTrackIndex) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function updatePlayButton() {
  const isPlaying = !audio.paused;
  playToggle.textContent = isPlaying ? 'Ⅱ' : '▶';
  playToggle.setAttribute('aria-label', isPlaying ? '暫停' : '播放');
  player.classList.toggle('is-playing', isPlaying);
}

function loadTrack(index, shouldPlay = true) {
  if (tracks.length === 0) return;
  currentTrackIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrackIndex];

  audio.src = track.src;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  audioStatus.textContent = '正在載入音源…';
  seekBar.value = '0';
  currentTimeLabel.textContent = '0:00';
  durationLabel.textContent = '0:00';
  updateTrackSelection();

  if (shouldPlay) {
    audio.play().catch((error) => {
      audioStatus.textContent = '無法播放此音源，請確認檔案格式及瀏覽器支援。';
      console.error('Audio playback failed:', error);
    });
  }
}

playToggle.addEventListener('click', () => {
  if (currentTrackIndex < 0) {
    loadTrack(0);
    return;
  }

  if (audio.paused) {
    audio.play().catch((error) => {
      audioStatus.textContent = '無法播放此音源，請確認檔案格式及瀏覽器支援。';
      console.error('Audio playback failed:', error);
    });
  } else {
    audio.pause();
  }
});

previousTrack.addEventListener('click', () => loadTrack(currentTrackIndex - 1));
nextTrack.addEventListener('click', () => loadTrack(currentTrackIndex + 1));
trackList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-track-index]');
  if (button) loadTrack(Number(button.dataset.trackIndex));
});

audio.addEventListener('loadedmetadata', () => {
  durationLabel.textContent = formatTime(audio.duration);
  audioStatus.textContent = '音源已就緒。';
});

audio.addEventListener('timeupdate', () => {
  currentTimeLabel.textContent = formatTime(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    seekBar.value = String((audio.currentTime / audio.duration) * 100);
  }
});

audio.addEventListener('play', updatePlayButton);
audio.addEventListener('pause', updatePlayButton);
audio.addEventListener('ended', () => {
  loadTrack(currentTrackIndex + 1);
});
audio.addEventListener('error', () => {
  if (currentTrackIndex < 0) return;
  audioStatus.textContent = '音源載入失敗，請確認音檔存在且格式受支援。';
});

seekBar.addEventListener('input', () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(seekBar.value) / 100) * audio.duration;
  }
});

volumeBar.addEventListener('input', () => {
  audio.volume = Number(volumeBar.value);
});

audio.volume = Number(volumeBar.value);
renderTrackList();

if (tracks.length > 0) {
  [playToggle, previousTrack, nextTrack, seekBar, volumeBar].forEach((control) => {
    control.disabled = false;
  });
  audioStatus.textContent = `${tracks.length} 首音樂已就緒，選擇歌曲開始試聽。`;
}
