<template>
  <div class="song-recommend-section">
    <div class="container">
      <h2 class="section-title">Song Recommend for you</h2>
      <div class="slider-wrapper">
        <!-- Navigation Buttons -->
        <button class="nav-btn prev-btn" @click="scrollLeft" :disabled="isAtStart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button class="nav-btn next-btn" @click="scrollRight" :disabled="isAtEnd">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Songs Container -->
        <div class="songs-container" ref="songsContainer" @scroll="checkScrollPosition">
          <div 
            v-for="(song, index) in recommendedSongs" 
            :key="index"
            class="song-card"
            :class="{ 'selected': selectedSong && selectedSong.id === song.id }"
            @click="selectSong(song)"
          >
            <div class="song-image">
              <img v-if="song.image" :src="song.image" :alt="song.name" />
              <div v-else class="placeholder-image">
                <i class="music-icon">🎵</i>
              </div>
            </div>
            <div class="song-info">
              <h3 class="song-name">{{ song.name || 'Song name' }}</h3>
              <p class="artist-name">{{ song.artist || 'Artist' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Song Details Section -->
      <div v-if="selectedSong" class="song-details-section" ref="songDetailsSection">
        <div class="song-details-container">
          <div class="song-details-header">
            <div class="song-details-image">
              <img v-if="selectedSong.image" :src="selectedSong.image" :alt="selectedSong.name" />
              <div v-else class="placeholder-detail-image">
                <i class="music-icon">🎵</i>
              </div>
            </div>
            <div class="song-details-info">
              <h2 class="detail-song-name">{{ selectedSong.name }}</h2>
              <p class="detail-artist-name">{{ selectedSong.artist }}</p>
              <div class="song-meta">
                <span class="meta-item">{{ selectedSong.mood }}</span>
                <span class="meta-item">{{ selectedSong.genre }}</span>
                <span class="meta-item">{{ selectedSong.year }}</span>
              </div>
            </div>
          </div>
          
          <div class="song-details-content">
            <div class="lyrics-section">
              <h3>Short Lyric</h3>
              <p class="lyrics-text">{{ selectedSong.shortLyric }}</p>
            </div>
            
            <div class="song-info-grid">
              <div class="info-section">
                <h4>What this song is about</h4>
                <p>{{ selectedSong.description }}</p>
              </div>
              
              <div class="details-grid">
                <div class="detail-item">
                  <span class="label">Mood:</span>
                  <span class="value">{{ selectedSong.mood }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Genre:</span>
                  <span class="value">{{ selectedSong.genre }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Year:</span>
                  <span class="value">{{ selectedSong.year }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Keywords:</span>
                  <span class="value">{{ selectedSong.keywords }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Tempo:</span>
                  <span class="value">{{ selectedSong.tempo }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Style:</span>
                  <span class="value">{{ selectedSong.style }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Instruments:</span>
                  <span class="value">{{ selectedSong.instruments }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SongRecommendSection',
  data() {
    return {
      isAtStart: true,
      isAtEnd: false,
      selectedSong: null,
      recommendedSongs: [
        {
          id: 1,
          name: 'Song name',
          artist: 'Artist',
          image: null,
          mood: 'Sad, Romantic',
          genre: 'Lo-fi, Sad Pop',
          year: '20xx',
          tempo: '74 BPM',
          style: 'Joji, Keshi',
          instruments: 'Guitar, Pad',
          keywords: 'smile, goodbye, fade',
          shortLyric: 'Brings me back up from a dream\nWhere you and I had to say goodbye\nAnd I don\'t know what it all means\nBut since I survived, I realized\nWherever you go, that\'s where I\'ll follow\nNobody\'s promised tomorrow...',
          description: 'This song expresses the longing to remember someone\'s smile as a final emotional memory. It\'s a specific take on romantic heartbreak, where the smile of a loved one becomes a symbol of both comfort and loss.'
        },
        {
          id: 2,
          name: 'Die With Your Smile',
          artist: 'Bruno Mars',
          image: null,
          mood: 'Sad, Romantic',
          genre: 'Lo-fi, Sad Pop',
          year: '2024',
          tempo: '74 BPM',
          style: 'Joji, Keshi',
          instruments: 'Guitar, Pad',
          keywords: 'smile, goodbye, fade',
          shortLyric: 'I just wanna see you smile\nEven if it\'s for a while\nJust wanna see you smile again\nI\'d rather die with your smile...',
          description: 'This song expresses the longing to remember someone\'s smile as a final emotional memory. It\'s a specific take on romantic heartbreak, where the smile of a loved one becomes a symbol of both comfort and loss.'
        },
        {
          id: 3,
          name: 'Song All Too Well Artist',
          artist: 'Taylor swift',
          image: null,
          mood: 'Sad, Romantic',
          genre: 'Lo-fi, Sad Pop',
          year: '2021',
          tempo: '74 BPM',
          style: 'Joji, Keshi',
          instruments: 'Guitar, Pad',
          keywords: 'smile, goodbye, fade',
          shortLyric: 'And you call me up again just to break me like a promise\nSo casually cruel in the name of being honest\nI\'m a crumpled up piece of paper lying here...',
          description: 'This song expresses the longing to remember someone\'s smile as a final emotional memory. It\'s a specific take on romantic heartbreak, where the smile of a loved one becomes a symbol of both comfort and loss.'
        },
        {
          id: 4,
          name: 'Song name',
          artist: 'Artist',
          image: null,
          mood: 'Sad, Romantic',
          genre: 'Lo-fi, Sad Pop',
          year: '20xx',
          tempo: '74 BPM',
          style: 'Joji, Keshi',
          instruments: 'Guitar, Pad',
          keywords: 'smile, goodbye, fade',
          shortLyric: 'Sample lyrics for this song...',
          description: 'This song expresses the longing to remember someone\'s smile as a final emotional memory.'
        },
        {
          id: 5,
          name: 'Song name',
          artist: 'Artist',
          image: null,
          mood: 'Sad, Romantic',
          genre: 'Lo-fi, Sad Pop',
          year: '20xx',
          tempo: '74 BPM',
          style: 'Joji, Keshi',
          instruments: 'Guitar, Pad',
          keywords: 'smile, goodbye, fade',
          shortLyric: 'Sample lyrics for this song...',
          description: 'This song expresses the longing to remember someone\'s smile as a final emotional memory.'
        },
        {
          id: 6,
          name: 'Song name',
          artist: 'Artist',
          image: null,
          mood: 'Sad, Romantic',
          genre: 'Lo-fi, Sad Pop',
          year: '20xx',
          tempo: '74 BPM',
          style: 'Joji, Keshi',
          instruments: 'Guitar, Pad',
          keywords: 'smile, goodbye, fade',
          shortLyric: 'Sample lyrics for this song...',
          description: 'This song expresses the longing to remember someone\'s smile as a final emotional memory.'
        },
        {
          id: 7,
          name: 'Song name',
          artist: 'Artist',
          image: null,
          mood: 'Sad, Romantic',
          genre: 'Lo-fi, Sad Pop',
          year: '20xx',
          tempo: '74 BPM',
          style: 'Joji, Keshi',
          instruments: 'Guitar, Pad',
          keywords: 'smile, goodbye, fade',
          shortLyric: 'Sample lyrics for this song...',
          description: 'This song expresses the longing to remember someone\'s smile as a final emotional memory.'
        },
        {
          id: 8,
          name: 'Song name',
          artist: 'Artist',
          image: null,
          mood: 'Sad, Romantic',
          genre: 'Lo-fi, Sad Pop',
          year: '20xx',
          tempo: '74 BPM',
          style: 'Joji, Keshi',
          instruments: 'Guitar, Pad',
          keywords: 'smile, goodbye, fade',
          shortLyric: 'Sample lyrics for this song...',
          description: 'This song expresses the longing to remember someone\'s smile as a final emotional memory.'
        }
      ]
    }
  },
  mounted() {
    this.checkScrollPosition();
  },
  methods: {
    selectSong(song) {
      this.selectedSong = song;
      // Auto scroll to details section
      this.$nextTick(() => {
        if (this.$refs.songDetailsSection) {
          this.$refs.songDetailsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    },
    scrollLeft() {
      const container = this.$refs.songsContainer;
      container.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    },
    scrollRight() {
      const container = this.$refs.songsContainer;
      container.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    },
    checkScrollPosition() {
      const container = this.$refs.songsContainer;
      if (!container) return;
      
      this.isAtStart = container.scrollLeft === 0;
      this.isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 10);
    }
  }
}
</script>

<style scoped>
.song-recommend-section {
  background: linear-gradient(180deg, #1b1b1b 0%, #2d2d2d 100%);
  padding: 80px 20px;
  min-height: 500px;
  position: relative;
}

.song-recommend-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
  pointer-events: none;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.section-title {
  font-size: 3rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 50px;
  text-align: left;
  font-family: 'Anton', sans-serif;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
}

.slider-wrapper {
  position: relative;
  overflow: hidden;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.nav-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
}

.nav-btn svg {
  width: 20px;
  height: 20px;
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

.songs-container {
  display: flex;
  gap: 25px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 20px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.songs-container::-webkit-scrollbar {
  display: none;
}

.song-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  min-width: 220px;
  max-width: 220px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.song-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.song-card:hover::before {
  left: 100%;
}

.song-card:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.song-image {
  width: 120px;
  height: 120px;
  margin: 0 auto 25px;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.song-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.placeholder-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.music-icon {
  font-size: 2.5rem;
  z-index: 1;
}

.song-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.song-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.artist-name {
  font-size: 1rem;
  color: #cccccc;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.song-card.selected {
  border-color: rgba(255, 255, 255, 0.6);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Song Details Section */
.song-details-section {
  margin-top: 60px;
  padding: 40px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.song-details-container {
  max-width: 100%;
}

.song-details-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  align-items: flex-start;
}

.song-details-image {
  width: 120px;
  height: 120px;
  border-radius: 15px;
  overflow: hidden;
  flex-shrink: 0;
}

.song-details-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-detail-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.song-details-info {
  flex: 1;
}

.detail-song-name {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.detail-artist-name {
  font-size: 1.2rem;
  color: #cccccc;
  margin-bottom: 15px;
}

.song-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.meta-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.song-details-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.lyrics-section h3,
.info-section h4 {
  font-size: 1.3rem;
  color: #ffffff;
  margin-bottom: 15px;
  font-weight: bold;
}

.lyrics-text {
  color: #cccccc;
  line-height: 1.6;
  font-size: 1rem;
  white-space: pre-line;
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid rgba(255, 255, 255, 0.3);
}

.info-section p {
  color: #cccccc;
  line-height: 1.6;
  font-size: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item .label {
  font-weight: bold;
  color: #ffffff;
  font-size: 0.9rem;
}

.detail-item .value {
  color: #cccccc;
  font-size: 0.95rem;
}

/* Responsive for song details */
@media (max-width: 768px) {
  .song-details-section {
    margin-top: 40px;
    padding: 25px;
  }
  
  .song-details-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .song-details-image {
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }
  
  .detail-song-name {
    font-size: 1.5rem;
  }
  
  .song-details-content {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .song-recommend-section {
    padding: 60px 15px;
  }
  
  .section-title {
    font-size: 2.5rem;
    margin-bottom: 40px;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
  }
  
  .nav-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .prev-btn {
    left: 5px;
  }
  
  .next-btn {
    right: 5px;
  }
  
  .songs-container {
    gap: 15px;
  }
  
  .song-card {
    min-width: 180px;
    max-width: 180px;
    min-height: 250px;
    padding: 20px;
  }
  
  .song-image {
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 2rem;
  }
  
  .song-card {
    min-width: 160px;
    max-width: 160px;
    min-height: 230px;
    padding: 18px;
  }
  
  .song-image {
    width: 90px;
    height: 90px;
  }
  
  .nav-btn {
    width: 35px;
    height: 35px;
  }
  
  .nav-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>
