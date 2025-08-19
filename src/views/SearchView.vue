<template>
  <div class="search-view">
    <!-- Header Section -->
    <div class="search-header">
      <h1 class="search-title">ARTISTVERSE</h1>
      
      <!-- Search Bar -->
      <div class="search-bar-container">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search for songs, artists, or styles..."
            class="search-input"
            @input="handleSearch"
          />
          <button class="search-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.515 16.515M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filter Tags -->
      <div class="filter-section">
        <div class="filter-group">
          <span class="filter-label">All</span>
          <button 
            v-for="filter in filterOptions" 
            :key="filter"
            :class="['filter-tag', { active: activeFilters.includes(filter) }]"
            @click="toggleFilter(filter)"
          >
            {{ filter }}
          </button>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="results-section">
      <div class="container">
        <!-- Results Header -->
        <div class="results-header">
          <h2 v-if="searchQuery" class="results-title">
            Search results for "{{ searchQuery }}"
          </h2>
          <h2 v-else class="results-title">
            Discover Music
          </h2>
          <p class="results-count">{{ filteredResults.length }} results found</p>
        </div>

        <!-- Cards Grid -->
        <div class="cards-grid">
          <div 
            v-for="(item, index) in filteredResults" 
            :key="index"
            class="music-card"
            @click="selectItem(item)"
          >
            <div class="card-image">
              <img v-if="item.image" :src="item.image" :alt="item.name" />
              <div v-else class="placeholder-image">
                <i class="music-icon">🎵</i>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ item.name }}</h3>
              <p class="card-artist">{{ item.artist }}</p>
              <div class="card-tags">
                <span class="tag">{{ item.genre }}</span>
                <span class="tag">{{ item.year }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredResults.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      </div>
    </div>    <!-- Selected Item Details Modal -->
    <div v-if="selectedItem" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">&times;</button>
        
        <!-- Modal Header similar to recommend section -->
        <div class="song-details-header">
          <div class="song-details-image">
            <img v-if="selectedItem.image" :src="selectedItem.image" :alt="selectedItem.name" />
            <div v-else class="placeholder-detail-image">
              <i class="music-icon">🎵</i>
            </div>
          </div>
          <div class="song-details-info">
            <h2 class="detail-song-name">{{ selectedItem.name }}</h2>
            <p class="detail-artist-name">{{ selectedItem.artist }}</p>
            <div class="song-meta">
              <span class="meta-item">{{ selectedItem.mood }}</span>
              <span class="meta-item">{{ selectedItem.genre }}</span>
              <span class="meta-item">{{ selectedItem.year }}</span>
            </div>
          </div>
        </div>
        
        <!-- Modal Content similar to recommend section -->
        <div class="song-details-content">
          <div class="lyrics-section">
            <h3>Short Lyric</h3>
            <p class="lyrics-text">{{ selectedItem.shortLyric || 'Sample lyrics for this song...' }}</p>
          </div>
          
          <div class="song-info-grid">
            <div class="info-section">
              <h4>What this song is about</h4>
              <p>{{ selectedItem.description || 'This song represents the artist\'s unique style and musical expression.' }}</p>
            </div>
            
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Mood:</span>
                <span class="value">{{ selectedItem.mood }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Genre:</span>
                <span class="value">{{ selectedItem.genre }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Year:</span>
                <span class="value">{{ selectedItem.year }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Key:</span>
                <span class="value">{{ selectedItem.key }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Tempo:</span>
                <span class="value">{{ selectedItem.tempo }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Style:</span>
                <span class="value">{{ selectedItem.style }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Instruments:</span>
                <span class="value">{{ selectedItem.instruments }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Valence:</span>
                <span class="value">{{ selectedItem.valence }}</span>
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
  name: 'SearchView',
  data() {
    return {
      searchQuery: '',
      activeFilters: [],
      selectedItem: null,
      filterOptions: ['Key', 'Track Name', 'Artist Name', 'Release Year', 'Valence', 'Genre'],      mockData: [
        {
          id: 1,
          name: 'Cardigan',
          artist: 'Taylor Swift',
          image: null,
          genre: 'Indie Folk',
          mood: 'Melancholy',
          year: '2020',
          tempo: '84 BPM',
          style: 'Taylor Swift, Bon Iver',
          instruments: 'Guitar, Piano, Strings',
          valence: 'Low',
          key: 'Bb Major',
          shortLyric: 'Vintage tee, brand new phone\nHigh heels on cobblestones\nWhen you are young, they assume you know nothing\nSequin smile, black lipstick',
          description: 'A nostalgic ballad about lost love and looking back on a relationship that defined your youth. The song captures the bittersweet feeling of remembering someone who was once everything to you.'
        },
        {
          id: 2,
          name: 'Levitating',
          artist: 'Dua Lipa',
          image: null,
          genre: 'Pop',
          mood: 'Energetic',
          year: '2020',
          tempo: '103 BPM',
          style: 'Dua Lipa, Disco',
          instruments: 'Synths, Drums, Bass',
          valence: 'High',
          key: 'B Minor',
          shortLyric: 'If you wanna run away with me\nI know a galaxy and I can take you for a ride\nI had a premonition that we fell into a rhythm\nWhere the music don\'t stop for life',
          description: 'An uplifting disco-pop anthem about escapism and finding love that makes you feel like you\'re floating. The song combines retro disco elements with modern pop production.'
        },
        {
          id: 3,
          name: 'Blinding Lights',
          artist: 'The Weeknd',
          image: null,
          genre: 'Synthwave',
          mood: 'Upbeat',
          year: '2019',
          tempo: '171 BPM',
          style: 'The Weeknd, 80s Synth',
          instruments: 'Synths, Drums',
          valence: 'High',
          key: 'F# Major',
          shortLyric: 'I\'ve been tryna call\nI\'ve been on my own for long enough\nMaybe you can show me how to love, maybe\nI feel like I\'m just missing something when you\'re gone',
          description: 'A synth-heavy track that captures the feeling of driving through city lights at night, searching for love and connection. Heavily influenced by 80s synthwave and electronic music.'
        },
        {
          id: 4,
          name: 'Driver\'s License',
          artist: 'Olivia Rodrigo',
          image: null,
          genre: 'Pop Ballad',
          mood: 'Sad',
          year: '2021',
          tempo: '144 BPM',
          style: 'Taylor Swift, Lorde',
          instruments: 'Piano, Strings',
          valence: 'Low',
          key: 'Bb Major',
          shortLyric: 'I got my driver\'s license last week\nJust like we always talked about\n\'Cause you were so excited for me\nTo finally drive up to your house',
          description: 'A heartbreaking ballad about growing up and moving on from your first love. The song deals with themes of independence, heartbreak, and the painful process of letting go.'
        },
        {
          id: 5,
          name: 'Good 4 U',
          artist: 'Olivia Rodrigo',
          image: null,
          genre: 'Pop Rock',
          mood: 'Angry',
          year: '2021',
          tempo: '178 BPM',
          style: 'Paramore, Pop Punk',
          instruments: 'Guitar, Drums, Bass',
          valence: 'Medium',
          key: 'A Major',
          shortLyric: 'Well, good for you, I guess you moved on really easily\nYou found a new girl and it only took a couple weeks\nRemember when you said that you wanted to give me the world',
          description: 'An angsty pop-punk anthem about watching an ex-partner move on quickly while you\'re still processing the breakup. The song channels raw emotion through aggressive instrumentation.'
        },
        {
          id: 6,
          name: 'Stay',
          artist: 'The Kid LAROI & Justin Bieber',
          image: null,
          genre: 'Pop',
          mood: 'Nostalgic',
          year: '2021',
          tempo: '169 BPM',
          style: 'Modern Pop, Hip-Hop',
          instruments: 'Guitar, Drums, Synths',
          valence: 'Medium',
          key: 'C Major',
          shortLyric: 'I do the same thing I told you that I never would\nI told you I\'d change, even when I knew I never could\nI know that I can\'t find nobody else as good as you',
          description: 'A collaborative track about wanting someone to stay in your life despite knowing the relationship might not be healthy. The song blends pop melodies with hip-hop influences.'
        },
        {
          id: 7,
          name: 'Heat Waves',
          artist: 'Glass Animals',
          image: null,
          genre: 'Indie Pop',
          mood: 'Dreamy',
          year: '2020',
          tempo: '80 BPM',
          style: 'Glass Animals, Alt Pop',
          instruments: 'Synths, Guitar, Drums',
          valence: 'Medium',
          key: 'C# Minor',
          shortLyric: 'Road shimmer, wiggling the vision\nHeat heat waves, I\'m swimming in a mirror\nRoad shimmer, wiggling the vision\nHeat heat waves, I\'m swimming in a',
          description: 'A dreamy, psychedelic track about longing and separation. The song uses heat waves as a metaphor for the distortion of memory and the hazy feeling of missing someone.'
        },
        {
          id: 8,
          name: 'Montero',
          artist: 'Lil Nas X',
          image: null,
          genre: 'Hip-Hop',
          mood: 'Confident',
          year: '2021',
          tempo: '150 BPM',
          style: 'Lil Nas X, Pop Rap',
          instruments: 'Synths, Drums, Bass',
          valence: 'High',
          key: 'C# Minor',
          shortLyric: 'Call me when you want, call me when you need\nCall me in the morning, I\'ll be on the way\nCall me when you want, call me when you need\nCall me out by your name, I\'ll be on the way like',
          description: 'A bold, confident track about self-acceptance and living authentically. The song combines elements of pop and hip-hop while delivering a message of empowerment and pride.'
        }
      ]
    }
  },
  computed: {
    filteredResults() {
      let results = this.mockData;

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        results = results.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.artist.toLowerCase().includes(query) ||
          item.genre.toLowerCase().includes(query) ||
          item.style.toLowerCase().includes(query)
        );
      }

      // Filter by active filters (this would be more complex in real implementation)
      if (this.activeFilters.length > 0) {
        // For demo purposes, just return filtered results
        // In real app, you would filter based on actual filter criteria
      }

      return results;
    }
  },
  methods: {
    handleSearch() {
      // Handle search input
      console.log('Searching for:', this.searchQuery);
    },
    toggleFilter(filter) {
      const index = this.activeFilters.indexOf(filter);
      if (index > -1) {
        this.activeFilters.splice(index, 1);
      } else {
        this.activeFilters.push(filter);
      }
    },
    selectItem(item) {
      this.selectedItem = item;
    },
    closeModal() {
      this.selectedItem = null;
    }
  }
}
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  background-color: #1b1b1b;
  color: white;
}

/* Header Section */
.search-header {
  background: linear-gradient(180deg, #000000 0%, #1b1b1b 100%);
  padding: 80px 20px 40px;
  text-align: center;
}

.search-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 30px;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.search-bar-container {
  max-width: 600px;
  margin: 0 auto 30px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 5px;
  backdrop-filter: blur(10px);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  padding: 15px 20px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-btn {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border: none;
  border-radius: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
  transform: scale(1.05);
}

/* Filter Section */
.filter-section {
  max-width: 800px;
  margin: 0 auto;
}

.filter-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: bold;
  margin-right: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.filter-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 8px 16px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.filter-tag.active {
  background: linear-gradient(145deg, #667eea, #764ba2);
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Results Section */
.results-section {
  padding: 60px 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.results-header {
  text-align: center;
  margin-bottom: 50px;
}

.results-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #ffffff;
}

.results-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.music-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.music-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.music-card:hover::before {
  left: 100%;
}

.music-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.card-image {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-image img {
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

.card-content {
  flex-grow: 1;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.3;
}

.card-artist {
  font-size: 1rem;
  color: #cccccc;
  margin-bottom: 15px;
  line-height: 1.2;
}

.card-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-content {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 40px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
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

.close-btn {
  position: absolute;
  top: 20px;
  right: 25px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ff6b6b;
}

/* Song Details Header - similar to recommend section */
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

/* Song Details Content - similar to recommend section */
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

.song-info-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
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

/* Responsive Design */
@media (max-width: 768px) {
  .search-title {
    font-size: 2.5rem;
  }
  
  .filter-group {
    justify-content: center;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  /* Modal responsive - similar to recommend section */
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
  
  .modal-content {
    padding: 25px;
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .search-header {
    padding: 70px 15px 30px;
  }
  
  .search-title {
    font-size: 2rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .music-card {
    padding: 20px;
  }
  
  .filter-tag {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .modal-content {
    padding: 20px;
    margin: 10px;
  }
  
  .song-details-header {
    gap: 15px;
  }
  
  .song-details-image {
    width: 80px;
    height: 80px;
  }
  
  .detail-song-name {
    font-size: 1.3rem;
  }
  
  .lyrics-text {
    padding: 15px;
    font-size: 0.9rem;
  }
}
</style>