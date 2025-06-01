<script>
export default {
  data() {
    return {
      notes: ["C", "D", "E", "F", "G", "A", "B"],
      progressions: [
        "2-5-1-6",
        "1-6-2-5", 
        "1-5-6-4",
        "1-6-4-5",
        "1-4-5-1",
        "1-4-6-5",
        "1-6-2-6",
        "6-4-3-2",
      ],
      selectedKey: "C",
      selectedProgression: "2-5-1-6",
      keyChords: {
        C: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
        D: ["D", "Em", "Gbm", "G", "A", "Bm", "C#dim"],
        E: ["E", "Gbm", "Abm", "A", "B", "Dbm", "D#dim"],
        F: ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
        G: ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
        A: ["A", "Bm", "Dbm", "D", "E", "Gbm", "G#dim"],
        B: ["B", "Dbm", "Ebm", "E", "Gb", "Abm", "A#dim"],
      },
      highlightedChords: [],
      displayedChords: [],
      playingChordIndex: -1,
      selectedBars: 4,
      tempo: 120,
      isPlaying: false,
      beatsPerChord: 2,
      playingBarIndex: -1,
      playingChordInBarIndex: -1,
      playingSingleChord: false,
      audioCache: new Map(),
      currentTimeout: null,
      currentPlayingAudio: null,
      // Add MIDI-related data
      isGeneratingMidi: false,
    };
  },
  computed: {
    chordBarsDisplay() {
      if (this.displayedChords.length === 0) return [];
      
      const beatsPerBar = 4; // Standard 4/4 time
      const chordsPerBar = beatsPerBar / this.beatsPerChord; // 4/2 = 2 chords per bar
      const totalChords = this.selectedBars * chordsPerBar;
      
      let expandedChords = [];
      for (let i = 0; i < totalChords; i++) {
        expandedChords.push(this.displayedChords[i % this.displayedChords.length]);
      }
      
      let bars = [];
      for (let i = 0; i < this.selectedBars; i++) {
        let barChords = [];
        for (let j = 0; j < chordsPerBar; j++) {
          const chordIndex = i * chordsPerBar + j;
          if (chordIndex < expandedChords.length) {
            barChords.push({
              chord: expandedChords[chordIndex],
              beats: this.beatsPerChord
            });
          }
        }
        bars.push({
          barNumber: i + 1,
          chords: barChords
        });
      }
      
      return bars;
    }
  },
  watch: {
    selectedBars(newValue) {
      if (newValue < 1) {
        this.selectedBars = 1;
      } else if (newValue > 32) {
        this.selectedBars = 32;
      }
    },
    
    // Stop playing when tempo changes to avoid timing issues
    tempo() {
      if (this.isPlaying) {
        this.stopPlaying();
      }
    }
  },
  methods: {
    selectProgression(progression, key) {
      this.selectedKey = key;
      this.selectedProgression = progression;
      this.generateProgression();
      this.setDisplayedChords();
    },
    generateProgression() {
      const progressionSteps = this.selectedProgression.split("-").map(Number);
      this.highlightedChords = progressionSteps;
    },
    setDisplayedChords() {
      const progressionSteps = this.selectedProgression.split("-").map(Number);
      this.displayedChords = progressionSteps.map(step => this.keyChords[this.selectedKey][step - 1]);
    },
    isChordHighlighted(key, chordIndex) {
      if (this.selectedKey !== key) {
        return false;
      }
      const isHighlighted = this.highlightedChords.includes(chordIndex + 1);
      return isHighlighted;
    },
    isProgressionActive(progression) {
      return this.selectedProgression === progression;
    },
    getChordImage(chord) {
      return `src/assets/guitarchord/${chord}.png`;
    },
    async preloadAudio(chord) {
      if (this.audioCache.has(chord)) {
        // สร้าง instance ใหม่เพื่อให้เล่นได้หลายตัวพร้อมกัน
        const cachedAudio = this.audioCache.get(chord);
        const newAudio = new Audio(cachedAudio.src);
        newAudio.volume = 0.8;
        newAudio.preload = "auto";
        return newAudio;
      }
      
      const audio = new Audio(`src/assets/sounds/${chord}.mp3`);
      audio.preload = "auto";
      audio.volume = 0.8;
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          this.audioCache.set(chord, audio);
          // สร้าง instance ใหม่สำหรับการใช้งาน
          const newAudio = new Audio(audio.src);
          newAudio.volume = 0.8;
          newAudio.preload = "auto";
          resolve(newAudio);
        });
        audio.addEventListener('error', reject);
        audio.load();
      });
    },
    
    async playSound() {
      if (this.isPlaying) return;
      if (this.chordBarsDisplay.length === 0) return;

      // Clear any existing timeout
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
      }

      // Stop any currently playing audio
      if (this.currentPlayingAudio) {
        this.currentPlayingAudio.pause();
        this.currentPlayingAudio.currentTime = 0;
        this.currentPlayingAudio = null;
      }

      // สร้าง array ของ audio files จาก chordBarsDisplay
      let audioSequence = [];
      this.chordBarsDisplay.forEach(bar => {
        bar.chords.forEach(chordData => {
          audioSequence.push(chordData.chord);
        });
      });

      try {
        let sequenceIndex = 0;
        this.isPlaying = true;
        
        // คำนวณเวลาตามหลักดนตรี
        const msPerBeat = 60000 / this.tempo;
        const msPerChord = msPerBeat * this.beatsPerChord;

        const startTime = Date.now();

        const playNextChord = async () => {
          if (sequenceIndex < audioSequence.length && this.isPlaying) {
            // หยุดเสียงก่อนหน้า (สำหรับ BPM เร็ว)
            if (this.currentPlayingAudio) {
              this.currentPlayingAudio.pause();
              this.currentPlayingAudio.currentTime = 0;
            }

            // คำนวณหา bar และ chord index
            let currentBarIndex = 0;
            let currentChordInBarIndex = 0;
            let tempIndex = sequenceIndex;

            for (let i = 0; i < this.chordBarsDisplay.length; i++) {
              if (tempIndex < this.chordBarsDisplay[i].chords.length) {
                currentBarIndex = i;
                currentChordInBarIndex = tempIndex;
                break;
              }
              tempIndex -= this.chordBarsDisplay[i].chords.length;
            }

            this.playingBarIndex = currentBarIndex;
            this.playingChordInBarIndex = currentChordInBarIndex;

            // เล่นเสียงใหม่
            const currentChord = audioSequence[sequenceIndex];
            const audio = await this.preloadAudio(currentChord);
            
            // เก็บ reference ของเสียงที่กำลังเล่น
            this.currentPlayingAudio = audio;
            audio.currentTime = 0;
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error('Audio play failed:', error);
              });
            }

            // กำหนดให้เสียงหยุดเมื่อถึงเวลาของคอร์ดถัดไป (สำหรับ BPM เร็ว)
            const stopCurrentAudio = () => {
              if (audio === this.currentPlayingAudio) {
                audio.pause();
                audio.currentTime = 0;
                if (this.currentPlayingAudio === audio) {
                  this.currentPlayingAudio = null;
                }
              }
            };

            // ตั้งเวลาหยุดเสียงตามระยะเวลาของคอร์ด
            setTimeout(stopCurrentAudio, Math.min(msPerChord, 3000)); // ไม่เกิน 3 วินาที
            
            sequenceIndex++;
            
            if (sequenceIndex < audioSequence.length && this.isPlaying) {
              // คำนวณเวลาที่แม่นยำ
              const expectedTime = startTime + (sequenceIndex * msPerChord);
              const currentTime = Date.now();
              const delay = Math.max(0, expectedTime - currentTime);
              
              this.currentTimeout = setTimeout(playNextChord, delay);
            } else {
              // เล่นครบแล้ว
              this.currentTimeout = setTimeout(() => {
                this.isPlaying = false;
                this.playingBarIndex = -1;
                this.playingChordInBarIndex = -1;
                this.currentTimeout = null;
                if (this.currentPlayingAudio) {
                  this.currentPlayingAudio = null;
                }
              }, Math.min(msPerChord, 3000));
            }
          }
        };

        playNextChord();
      } catch (error) {
        console.error('Failed to preload audio:', error);
        this.isPlaying = false;
      }
    },
    
    async playChordSound(chord, barIndex, chordIndex) {
      if (this.isPlaying || this.playingSingleChord) return;
      
      try {
        this.playingSingleChord = true;
        this.playingBarIndex = barIndex;
        this.playingChordInBarIndex = chordIndex;
        
        const audio = await this.preloadAudio(chord);
        audio.currentTime = 0;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Single chord play failed:', error);
          });
        }
        
        // Reset highlighting after sound duration
        setTimeout(() => {
          this.playingSingleChord = false;
          this.playingBarIndex = -1;
          this.playingChordInBarIndex = -1;
        }, 2000);
      } catch (error) {
        console.error('Failed to play chord sound:', error);
        this.playingSingleChord = false;
        this.playingBarIndex = -1;
        this.playingChordInBarIndex = -1;
      }
    },
    stopPlaying() {
      this.isPlaying = false;
      this.playingBarIndex = -1;
      this.playingChordInBarIndex = -1;
      this.playingSingleChord = false;
      
      // Clear any pending timeout
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
      }
      
      // Stop currently playing audio
      if (this.currentPlayingAudio) {
        this.currentPlayingAudio.pause();
        this.currentPlayingAudio.currentTime = 0;
        this.currentPlayingAudio = null;
      }
      
      // Stop all cached audios
      this.audioCache.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    },
    isChordPlaying(barIndex, chordIndex) {
      return this.playingBarIndex === barIndex && this.playingChordInBarIndex === chordIndex;
    },
    
    // Add MIDI generation methods
    chordToMidiNotes(chordName) {
      // Define chord formulas (root + intervals in semitones)
      const chordFormulas = {
        // Major chords
        'C': [60, 64, 67],     // C E G
        'D': [62, 66, 69],     // D F# A
        'E': [64, 68, 71],     // E G# B
        'F': [65, 69, 72],     // F A C
        'G': [67, 71, 74],     // G B D
        'A': [69, 73, 76],     // A C# E
        'B': [71, 75, 78],     // B D# F#
        
        // Minor chords
        'Dm': [62, 65, 69],    // D F A
        'Em': [64, 67, 71],    // E G B
        'Gm': [67, 70, 74],    // G Bb D
        'Am': [69, 72, 76],    // A C E
        'Bm': [71, 74, 78],    // B D F#
        'Dbm': [61, 64, 68],   // C# E G#
        'Ebm': [63, 66, 70],   // Eb Gb Bb
        'Gbm': [66, 69, 73],   // F# A C#
        'Abm': [68, 71, 75],   // Ab B Eb
        
        // Diminished chords
        'Bdim': [71, 74, 77],  // B D F
        'C#dim': [61, 64, 67], // C# E G
        'D#dim': [63, 66, 69], // D# F# A
        'Edim': [64, 67, 70],  // E G Bb
        'F#dim': [66, 69, 72], // F# A C
        'G#dim': [68, 71, 74], // G# B D
        'A#dim': [70, 73, 76], // A# C# E
        
        // Additional chords
        'Bb': [70, 74, 77],    // Bb D F
        'Gb': [66, 70, 73],    // Gb Bb Db
      };
      
      return chordFormulas[chordName] || [60, 64, 67]; // Default to C major
    },
    
    generateMidiFile() {
      if (this.displayedChords.length === 0) {
        alert('Please select a chord progression first!');
        return;
      }
      
      this.isGeneratingMidi = true;
      
      try {
        // Create MIDI data structure
        const midiData = this.createMidiData();
        
        // Convert to MIDI file format
        const midiFile = this.createMidiFileFromData(midiData);
        
        // Download the file
        this.downloadMidiFile(midiFile);
        
      } catch (error) {
        console.error('Error generating MIDI file:', error);
        alert('Error generating MIDI file. Please try again.');
      } finally {
        this.isGeneratingMidi = false;
      }
    },
    
    createMidiData() {
      const ticksPerQuarter = 480;
      const beatsPerChord = this.beatsPerChord;
      const ticksPerChord = ticksPerQuarter * beatsPerChord;
      
      // Calculate total chords based on selected bars
      const beatsPerBar = 4;
      const chordsPerBar = beatsPerBar / beatsPerChord;
      const totalChords = this.selectedBars * chordsPerBar;
      
      // Expand chord progression to fill all bars
      let expandedChords = [];
      for (let i = 0; i < totalChords; i++) {
        expandedChords.push(this.displayedChords[i % this.displayedChords.length]);
      }
      
      // Create MIDI events
      const events = [];
      let currentTick = 0;
      
      // Add tempo event
      const microsecondsPerQuarter = Math.round(60000000 / this.tempo);
      events.push({
        deltaTime: 0,
        type: 'meta',
        subtype: 'setTempo',
        microsecondsPerQuarter: microsecondsPerQuarter
      });
      
      // Add time signature event
      events.push({
        deltaTime: 0,
        type: 'meta',
        subtype: 'timeSignature',
        numerator: 4,
        denominator: 4,
        metronome: 24,
        thirtyseconds: 8
      });
      
      // Add chord events
      expandedChords.forEach((chord, index) => {
        const midiNotes = this.chordToMidiNotes(chord);
        const chordStartTick = index * ticksPerChord;
        const chordEndTick = (index + 1) * ticksPerChord;
        
        // Note on events
        midiNotes.forEach((note, noteIndex) => {
          events.push({
            deltaTime: noteIndex === 0 ? (chordStartTick - currentTick) : 0,
            type: 'channel',
            subtype: 'noteOn',
            channel: 0,
            noteNumber: note,
            velocity: 80
          });
          if (noteIndex === 0) currentTick = chordStartTick;
        });
        
        // Note off events
        midiNotes.forEach((note, noteIndex) => {
          events.push({
            deltaTime: noteIndex === 0 ? (chordEndTick - currentTick) : 0,
            type: 'channel',
            subtype: 'noteOff',
            channel: 0,
            noteNumber: note,
            velocity: 0
          });
          if (noteIndex === 0) currentTick = chordEndTick;
        });
      });
      
      // Add end of track
      events.push({
        deltaTime: 0,
        type: 'meta',
        subtype: 'endOfTrack'
      });
      
      return {
        ticksPerQuarter: ticksPerQuarter,
        events: events
      };
    },
    
    createMidiFileFromData(midiData) {
      // Simple MIDI file creation (Type 0, single track)
      const header = new Uint8Array([
        0x4D, 0x54, 0x68, 0x64, // "MThd"
        0x00, 0x00, 0x00, 0x06, // Header length
        0x00, 0x00,             // Type 0
        0x00, 0x01,             // 1 track
        0x01, 0xE0              // Ticks per quarter note (480)
      ]);
      
      // Convert events to MIDI track data
      const trackData = this.eventsToMidiTrackData(midiData.events);
      
      // Create track header
      const trackHeader = new Uint8Array([
        0x4D, 0x54, 0x72, 0x6B, // "MTrk"
        ...this.numberToBytes(trackData.length, 4) // Track length
      ]);
      
      // Combine all parts
      const midiFile = new Uint8Array(header.length + trackHeader.length + trackData.length);
      midiFile.set(header, 0);
      midiFile.set(trackHeader, header.length);
      midiFile.set(trackData, header.length + trackHeader.length);
      
      return midiFile;
    },
    
    eventsToMidiTrackData(events) {
      const trackBytes = [];
      
      events.forEach(event => {
        // Add delta time
        trackBytes.push(...this.numberToVariableLength(event.deltaTime));
        
        if (event.type === 'meta') {
          trackBytes.push(0xFF, this.getMetaTypeNumber(event.subtype));
          
          if (event.subtype === 'setTempo') {
            trackBytes.push(0x03); // Length
            trackBytes.push(...this.numberToBytes(event.microsecondsPerQuarter, 3));
          } else if (event.subtype === 'timeSignature') {
            trackBytes.push(0x04); // Length
            trackBytes.push(event.numerator, Math.log2(event.denominator), event.metronome, event.thirtyseconds);
          } else if (event.subtype === 'endOfTrack') {
            trackBytes.push(0x00); // Length
          }
        } else if (event.type === 'channel') {
          const statusByte = (event.subtype === 'noteOn' ? 0x90 : 0x80) | event.channel;
          trackBytes.push(statusByte, event.noteNumber, event.velocity);
        }
      });
      
      return new Uint8Array(trackBytes);
    },
    
    getMetaTypeNumber(subtype) {
      const metaTypes = {
        'setTempo': 0x51,
        'timeSignature': 0x58,
        'endOfTrack': 0x2F
      };
      return metaTypes[subtype] || 0x00;
    },
    
    numberToVariableLength(value) {
      const bytes = [];
      bytes.unshift(value & 0x7F);
      value >>= 7;
      
      while (value > 0) {
        bytes.unshift((value & 0x7F) | 0x80);
        value >>= 7;
      }
      
      return bytes;
    },
    
    numberToBytes(value, byteCount) {
      const bytes = [];
      for (let i = byteCount - 1; i >= 0; i--) {
        bytes.push((value >> (i * 8)) & 0xFF);
      }
      return bytes;
    },
    
    downloadMidiFile(midiFile) {
      const blob = new Blob([midiFile], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `chord-progression-${this.selectedKey}-${this.selectedProgression}-${this.tempo}bpm.mid`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    },
  },
  
  mounted() {
    // Preload common chords on component mount
    const commonChords = ['C', 'Dm', 'Em', 'F', 'G', 'Am'];
    commonChords.forEach(chord => {
      this.preloadAudio(chord).catch(error => {
        console.warn(`Failed to preload ${chord}:`, error);
      });
    });
  },
  
  beforeUnmount() {
    this.stopPlaying();
  },
};
</script>

<template>
  <div class="body">
    <div class="result">
      <h2 class="animate__animated animate__fadeInDown animate__delay-1s">
        Major Keys Chord Table
      </h2>
      <table class="animate__animated animate__fadeInUp animate__delay-1s">
        <thead>
          <tr>
            <th>Key</th>
            <th>Progression</th>
            <th v-for="(num, index) in 7" :key="index">{{ index + 1 }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in Object.keys(keyChords)" :key="key">
            <td :class="{ highlighted: key === selectedKey }">{{ key }}</td>
            <td>
              <div class="progression-buttons">
                <button
                  v-for="(progression, index) in progressions"
                  :key="index"
                  :class="{ 'active-progression': isProgressionActive(progression) }"
                  @click="selectProgression(progression, key)"
                >
                  {{ progression }}
                </button>
              </div>
            </td>
            <td
              v-for="(chord, chordIndex) in keyChords[key]"
              :key="chord"
              :class="{ highlighted: isChordHighlighted(key, chordIndex) }"
            >
              {{ chord }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- New Controls Section -->
      <div class="controls-section animate__animated animate__fadeInUp animate__delay-1s">
        <div class="control-group">
          <h3>Number of bars (1-32)</h3>
          <input
            type="number"
            v-model.number="selectedBars"
            min="1"
            max="32"
            class="bars-input"
          />
          <p class="selection-text">You selected {{ selectedBars }} bars</p>
        </div>

        <div class="control-group">
          <h3>Set Tempo (BPM)</h3>
          <h4>40-240</h4>
          <div class="tempo-container">
            <input
              type="range"
              v-model.number="tempo"
              min="40"
              max="240"
              step="1"
              class="tempo-slider"
            />
            <p class="tempo-text">Tempo: {{ tempo }} BPM</p>
            <p class="tempo-info">{{ Math.round((60000 / tempo) * beatsPerChord) }}ms per chord ({{ beatsPerChord }} beats)</p>
            <p class="tempo-detail">{{ Math.round(4 / beatsPerChord) }} chords per bar</p>
            <p class="tempo-note" v-if="((60000 / tempo) * beatsPerChord) < 1000">
              <i>Fast tempo - audio will be cut short</i>
            </p>
          </div>
        </div>

        <div class="control-group">
          <button class="custom-button">Custom chord and Beat</button>
        </div>
      </div>

      <div v-if="displayedChords.length > 0" class="chords-display">
        <h2 class="head2">
          Selected Chord Progression:
          <span style="color: yellow; font-weight: bold">{{ selectedProgression }}</span> in Key
          <span style="color: yellow; font-weight: bold">{{ selectedKey }}</span>
        </h2>

        <!-- New Bars Display Section -->
        <div v-if="chordBarsDisplay.length > 0" class="bars-display-section">
          <h3 class="bars-title">Chord Progression in {{ selectedBars }} Bars ({{ beatsPerChord }} beats per chord)</h3>
          <div class="bars-container">
            <div v-for="(bar, barIndex) in chordBarsDisplay" :key="bar.barNumber" class="bar-item">
              <div class="bar-header">Bar {{ bar.barNumber }}</div>
              <div class="bar-content">
                <div v-for="(chordData, chordIndex) in bar.chords" :key="chordIndex" class="chord-beat">
                  <div class="chord-display">
                    <div class="chord-name">{{ chordData.chord }}</div>
                    <img 
                      :src="getChordImage(chordData.chord)" 
                      :alt="chordData.chord + ' chord diagram'"
                      :class="{ 
                        'chord-diagram': true, 
                        'chord-playing': isChordPlaying(barIndex, chordIndex),
                        'clickable': !isPlaying && !playingSingleChord
                      }"
                      @click="playChordSound(chordData.chord, barIndex, chordIndex)"
                    />
                  </div>
                  <div class="beat-indicators">
                    <span v-for="beat in chordData.beats" :key="beat" class="beat-dot"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Play Sound Button -->
        <div class="sound-button-container">
          <div class="button-group">
            <button 
              class="sound" 
              :disabled="playingSingleChord" 
              @click="isPlaying ? stopPlaying() : playSound()"
            >
            </button>
            <p class="sound-text">{{ isPlaying ? 'Stop' : 'Play Progression' }}</p>
          </div>
          
          <!-- Add MIDI Download Button -->
          <div class="button-group">
            <button 
              class="midi-download" 
              :disabled="isGeneratingMidi || isPlaying"
              @click="generateMidiFile"
            >
            </button>
            <p class="sound-text">{{ isGeneratingMidi ? 'Generating...' : 'Download MIDI' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sound-button-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  gap: 40px;
}

.button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.sound {
  padding: 5px;
  border-radius: 100%;
  box-shadow: 0px 0px 10px 5px #e9eaeb73;
  background-color: #151b22;
  color: white;
  font-size: 17px;
  border: none;
  display: flex;
  align-items: center;
  z-index: 4;
  position: relative;
  transition: all 0.3s ease;
}

.sound::before {
  content: 'fac';
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNzUycHQiIGhlaWdodD0iNzUycHQiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDc1MiA3NTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8cGF0aCBkPSJtNTQ4Ljg2IDM4Mi4xNmMwIDM1LjUyLTMuMzE2NCA3MC4wOS05LjQ3MjcgMTAzLjI0LTAuOTQ1MzEgNC43MzQ0LTQuNzM0NCA3LjU3ODEtOS40NzI3IDcuNTc4MWgtMS44OTQ1Yy01LjIxMDktMC45NDUzMS04LjUyMzQtNi4xNTYyLTcuNTc4MS0xMC44OTEgNi4xNTYyLTMyLjIwMyA5LjQ3MjctNjUuODI4IDkuNDcyNy05OS45MjZzLTMuMzE2NC02OC42NjgtOS40NzI3LTEwMi43N2MtMC45NDUzMS01LjIxMDkgMi4zNjcyLTkuOTQ1MyA3LjU3ODEtMTAuODkxIDUuMjEwOS0wLjk0NTMxIDkuOTQ1MyAyLjM2NzIgMTAuODkxIDcuNTc4MSA2LjYzMjggMzUuMDM5IDkuOTQ5MiA3MC41NTkgOS45NDkyIDEwNi4wN3ptLTE0NC45Mi0xMzguNzZjMTAuODkxIDQ1LjkzOCAxNi41NzQgOTIuMzQ4IDE2LjU3NCAxMzguMjkgMCA0NS40NjUtNS4yMTA5IDg5Ljk4LTE2LjEwMiAxMzIuMTMtMC45NDUzMSAzLjMxNjQtMi4zNjcyIDYuMTU2Mi00LjI2MTcgOC41MjM0LTMuNzg5MSA1LjIxMDktOS40NzI3IDguMDUwOC0xNS42MjkgOC45OTYxaC0yLjgzOThjLTUuMjEwOSAwLTEwLjQxOC0xLjg5NDUtMTQuMjA3LTQuNzM0NGwtNzIuOTMtNTUuNDA2Yy0wLjk0NTMxLTAuNDcyNjYtMS44OTQ1LTAuOTQ1MzEtMi44Mzk4LTAuOTQ1MzFoLTUyLjA5NGMtOC41MjM0IDAtMTYuMTAyLTQuNzM0NC0yMC4zNjMtMTEuODQtMTIuMzEyLTIwLjgzNi0xOC40NjktNDYuODgzLTE4LjQ2OS03Ni4yNDYgMC0yOS44MzYgNi4xNTYyLTU3LjMwNSAxOC40NjktODEuOTMgMy43ODkxLTguMDUwOCAxMi4zMTItMTMuMjYyIDIxLjMxMi0xMy4yNjJoNTEuNjIxYzAuOTQ1MzEgMCAxLjg5NDUtMC40NzI2NiAyLjgzOTgtMC45NDUzMWw3MS41MDgtNTUuODg3YzIuODM5OC0xLjg5NDUgNS42ODM2LTMuMzE2NCA4Ljk5NjEtNC4yNjE3IDYuMTU2Mi0xLjQyMTkgMTIuMzEyLTAuNDcyNjYgMTcuOTk2IDIuODM5OCA1LjIxMDkgMy4zMTY0IDkgOC41MjczIDEwLjQxOCAxNC42ODR6bS0yLjgzOTggMTM4Ljc2YzAtNDQuNTE2LTUuMjEwOS04OS41MDgtMTUuNjI5LTEzNC4wMi0wLjQ3MjY2LTEuODk0NS0xLjQyMTktMi4zNjcyLTEuODk0NS0yLjgzOTgtMC40NzI2Ni0wLjQ3MjY2LTEuODk0NS0wLjk0NTMxLTMuNzg5MS0wLjQ3MjY2LTAuNDcyNjYgMC0xLjQyMTkgMC40NzI2Ni0xLjg5NDUgMC45NDUzMWwtNzEuNTA4IDU0LjkzOGMtNC4yNjE3IDMuMzE2NC05LjQ3MjcgNC43MzQ0LTE0LjY4IDQuNzM0NGgtNTEuMTQ4Yy0xLjg5NDUgMC0zLjMxNjQgMC45NDUzMS00LjI2MTcgMi44Mzk4LTEwLjg5MSAyMi4yNTgtMTYuNTc0IDQ2Ljg4My0xNi41NzQgNzMuODc5IDAgMjYuMDQ3IDUuMjEwOSA0OC43NzcgMTUuNjI5IDY2Ljc3MyAwLjk0NTMxIDEuNDIxOSAyLjM2NzIgMi4zNjcyIDQuMjYxNyAyLjM2NzJoNTIuMDk0YzUuMjEwOSAwIDEwLjQxOCAxLjg5NDUgMTQuNjggNC43MzQ0bDcxLjk4NCA1NS44ODNjMS40MjE5IDAuOTQ1MzEgMi44Mzk4IDAuOTQ1MzEgMy4zMTY0IDAuOTQ1MzEgMC45NDUzMSAwIDEuODk0NS0wLjQ3MjY2IDMuMzE2NC0xLjg5NDUgMC4wNzI2Ni0wLjQ3MjY2IDAuNDcyNjYtMC45NDUzMSAwLjk0NTMxLTEuODk0NSA5Ljk0MTQtNDAuMjQ2IDE1LjE1Mi04My4zNDQgMTUuMTUyLTEyNi45MXptODIuODc1LTc5LjA4NmMtNS4yMTA5IDAuNDcyNjYtOC45OTYxIDUuMjEwOS04LjA1MDggMTAuNDE4IDIuODM5OCAyMi43MyA0LjI2MTcgNDUuOTM4IDQuMjYxNyA2OC42NjhzLTEuNDIxOSA0NS40NjUtNC4yNjE3IDY3LjI1Yy0wLjQ3MjY2IDUuMjEwOSAyLjgzOTggOS45NDUzIDguMDUwOCAxMC40MThoMS40MjE5YzQuNzM0NCAwIDguOTk2MS0zLjMxNjQgOS40NzI3LTguNTIzNCAyLjgzOTgtMjIuNzMgNC4yNjE3LTQ1LjkzOCA0LjI2MTctNjkuNjE3IDAtMjMuNjgtMS40MjE5LTQ3LjM1OS00LjI2MTctNzAuNTYyLTAuOTQ5MjItNS4yMTA5LTUuNjgzNi05LTEwLjg5NS04LjA1MDh6IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPgo=');
  background-size: 100%;
  background-repeat: no-repeat;
  color: transparent;
  position: relative;
  width: 40px;
  height: 40px;
  display: block;
}

.sound:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0px 0px 15px 10px #e5e2de;
  background-color: #ebdf70;
}

.sound:active:not(:disabled) {
  border-radius: 100%;
  box-shadow: inset 0px 0px 10px 0px rgb(240, 237, 237);
}

.sound:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sound-text {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  text-align: center;
}

.body {
  text-align: center;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1b1b1b;
}

.result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h2 {
  padding-top: 3%;
  font-family: 'Avalors Personal Use';
  font-size: 40px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
  position: relative;
}

.head2 {
  font-family: 'Avalors Personal Use';
  font-size: 30px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
  position: relative;
}

table {
  border-collapse: collapse;
  margin-top: 20px;
  color: #fff;
}

th,
td {
  border: 2px solid #fff;
  padding: 10px;
  text-align: center;
}

th {
  background-color: #ef6b6b;
  color: black;
}

tr:nth-child(even) {
  background-color: #2c2c2c;
}

button[disabled] {
  background-color: gray;
  cursor: not-allowed;
  opacity: 0.6;
}

.highlighted {
  background-color: rgb(244, 244, 115);
  color: #000;
  border-radius: 20%;
}

.progression-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.progression-buttons button {
  padding: 5px 10px;
  background-color: #444;
  color: #fff;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s;
}

.progression-buttons button:hover {
  background-color: #666;
}

.active-progression {
  background-color: #ff8c00;
  color: #000;
  font-weight: bold;
  border: 2px solid #ff4500;
  transform: scale(1.1);
  box-shadow: 0 0 10px #ff4500;
}

.chord-set {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.chord {
  text-align: center;
  color: #fff;
}

.chord img {
  width: 100px;
  height: auto;
  border: 2px solid #fff;
  border-radius: 10px;
  transition: transform 0.3s;
}

.chord img:hover {
  transform: scale(1.1);
}

.chord img.highlighted {
  transform: scale(1.1); 
  border-color: #ff8c00; 
  box-shadow: 0 0 15px 5px #ff8c00; 
  transition: transform 0.3s, box-shadow 0.3s;
}

.controls-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 40px 0;
  padding: 20px;
  background-color: #2c2c2c;
  border-radius: 10px;
  width: 80%;
  max-width: 900px;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.control-group h3 {
  color: #fff;
  font-size: 18px;
  margin: 0;
  font-weight: bold;
}

.bars-select {
  padding: 8px 15px;
  background-color: #444;
  color: #fff;
  border: 2px solid #666;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
}

.bars-select:focus {
  outline: none;
  border-color: #ff8c00;
}

.bars-input {
  padding: 8px 15px;
  background-color: #444;
  color: #fff;
  border: 2px solid #666;
  border-radius: 5px;
  font-size: 14px;
  width: 80px;
  text-align: center;
}

.bars-input:focus {
  outline: none;
  border-color: #ff8c00;
}

.selection-text {
  color: #ccc;
  font-size: 12px;
  margin: 0;
}

.tempo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.tempo-slider {
  width: 200px;
  height: 6px;
  background: #444;
  outline: none;
  border-radius: 5px;
  cursor: pointer;
}

.tempo-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #ff8c00;
  border-radius: 50%;
  cursor: pointer;
}

.tempo-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #ff8c00;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.tempo-text {
  color: #fff;
  font-size: 14px;
  margin: 0;
}

.custom-button {
  padding: 12px 25px;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.custom-button:hover {
  background-color: #ff8c00;
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 140, 0, 0.3);
}

.bars-display-section {
  margin: 30px 0;
  padding: 20px;
  background-color: #2c2c2c;
  border-radius: 10px;
  width: 100%;
}

.bars-title {
  color: #fff;
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
  font-family: 'Avalors Personal Use';
}

.bars-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.bar-item {
  background-color: #444;
  border-radius: 8px;
  padding: 15px;
  border: 2px solid #666;
}

.bar-header {
  color: #ff8c00;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid #666;
  padding-bottom: 8px;
}

.bar-content {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  gap: 10px;
}

.chord-beat {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chord-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.chord-name {
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
}

.chord-diagram {
  width: 140px;
  height: 160px;
  object-fit: contain;
  border-radius: 5px;
  border: 2px solid #666;
  background-color: #fff;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  padding: 4px;
}

.chord-diagram:hover {
  transform: scale(1.1);
  border-color: #ff8c00;
}

.chord-diagram.clickable {
  cursor: pointer;
}

.chord-diagram.clickable:hover {
  transform: scale(1.15);
  border-color: #ff8c00;
  box-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
}

.chord-diagram.chord-playing {
  transform: scale(1.2);
  border-color: #ff4500;
  box-shadow: 0 0 20px 5px #ff4500;
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1.25);
  }
}

.beat-indicators {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin-top: 5px;
}

.beat-dot {
  width: 8px;
  height: 8px;
  background-color: #ff8c00;
  border-radius: 50%;
  display: inline-block;
}

@media (max-width: 768px) {
  .sound-button-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .bars-container {
    grid-template-columns: 1fr;
  }
  
  .bar-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .chord-beat {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .chord-display {
    flex-direction: row;
    gap: 15px;
  }
  
  .chord-name {
    margin-bottom: 0;
    min-width: 60px;
  }
  
  .chord-diagram {
    width: 110px;
    height: 130px;
  }
}

@media (max-width: 480px) {
  .bars-container {
    grid-template-columns: 1fr;
  }
  
  .chord-diagram {
    width: 90px;
    height: 110px;
  }
  
  .chord-name {
    font-size: 14px;
  }
  
  .beat-dot {
    width: 6px;
    height: 6px;
  }
}

.tempo-info {
  color: #aaa;
  font-size: 12px;
  margin: 0;
  font-style: italic;
}

.tempo-detail {
  color: #ccc;
  font-size: 11px;
  margin: 0;
  font-weight: bold;
}

.tempo-note {
  color: #ff6b6b;
  font-size: 10px;
  margin: 0;
  font-style: italic;
}

.midi-download {
  padding: 5px;
  border-radius: 100%;
  box-shadow: 0px 0px 10px 5px #e9eaeb73;
  background-color: #151b22;
  color: white;
  font-size: 17px;
  border: none;
  display: flex;
  align-items: center;
  z-index: 4;
  position: relative;
  transition: all 0.3s ease;
}

.midi-download::before {
  content: 'midi';
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNzUycHQiIGhlaWdodD0iNzUycHQiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDc1MiA3NTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8cGF0aCBkPSJtMjA2LjQgMjU4LjM2aDU0LjcydjMxLjA0aC0yMS4xNnY4OC4zMmgtMTIuOTZ2LTg4LjMyaC0yMS4xNnYtMzEuMDR6bTk5Ljg0IDBoNDYuMDh2MTE5LjM2aC0xMi45NnYtOTIuMTZoLTAuNDhsLTEzLjQ0IDkyLjE2aC0xMy40NGwtMTMuNDQtOTIuMTZoLTAuNDh2OTIuMTZoLTEyLjk2di0xMTkuMzZ6bTEwOC4yNCAwaDQ3LjA0djMxLjA0aC0xNi42NHY4OC4zMmgtMTIuOTZ2LTg4LjMyaC0xNi42NHYtMzEuMDR6bTk3LjkyIDBoMTIuOTZ2MTE5LjM2aC0xMi45NnYtMTE5LjM2em0tMjIxLjI4IDIwMGg1MC4wOHYyNi40aC0xNy4yOHY3Mi4zMmgtMTAuNTZ2LTcyLjMyaC0xNy4yOHYtMjYuNHptODMuMDQgMGgzNy42djk4LjcyaC0xMC41NnYtNzUuODRoLTAuNGwtMTAuOTYgNzUuODRoLTEwLjk2bC0xMC45Ni03NS44NGgtMC40djc1Ljg0aC0xMC41NnYtOTguNzJ6bTkyLjE2IDBoMzguMjR2MjYuNGgtMTMuNTJ2NzIuMzJoLTEwLjU2di03Mi4zMmgtMTMuNTJ2LTI2LjR6bTc5LjY4IDBoMTAuNTZ2OTguNzJoLTEwLjU2di05OC43MnptLTI4MC4xNiAyMDAuNjRoNDEuOTJ2MjEuNzZoLTE0LjA4djU5LjUyaC04LjY0di01OS41MmgtMTQuMDh2LTIxLjc2em06Ni45NiAwaDMwLjcydjgxLjI4aC04LjY0di02Mi4yNGgtMC4zMmwtOC45NiA2Mi4yNGgtOC45NmwtOC45Ni02Mi4yNGgtMC4zMnY2Mi4yNGgtOC42NHYtODEuMjh6bTc1LjUyIDBoMzEuMzZWNjgwaDExLjA0djU5LjUyaC04LjY0di01OS41MmgtMTEuMDR2LTIxLjc2em02NS4yOCAwaDguNjR2ODEuMjhoLTguNjR2LTgxLjI4eiIgZmlsbD0iI2ZmZiIvPgogPHBhdGggZD0ibTQxOC4wOCAzNzIuMDgtMzguNCA0MC4zMmMtMy44NCA0LjE2LTEwLjI0IDQuNzItMTQuODggMS42LTIuMDgtMS4yOC0zLjUyLTMuMjAtNC0wLjQ4aC0wLjMybC0xNi4zMiAwLjE2Yy01LjI4IDAuMTYtOS45Mi00LjE2LTEwLjI0LTkuNDRsLTAuNDgtMjMuMzZjLTAuMTYtNS4yOCA0LjE6IDkuOTIgOS40NC0xMC4yNGwyMy4zNi0wLjQ4YzIuNTYtMC4wOCA0Ljk2IDAuNjQgNi44OCAyaDEuMTJjMTMuMTItNjQgNjguNzItMTE1LjUyIDEzNy45Mi0xMTUuNTJzMTI0LjggNTEuNTIgMTM3LjkyIDExNS41MmMxLjQ0LTAuOCA0LjE2LTIuMTYgNi44OC0yaDIzLjM2YzUuMjggMC4zMiA5LjYgNC45NiA5LjQ0IDEwLjI0bC0wLjQ4IDIzLjM2Yy0wLjMyIDUuMjgtNC45NiA5LjYtMTAuMjQgOS40NGwtMTYuMzItMC4xNmgtMC4zMmMtMC4zMi0xLjQ0LTEuOTItMi4wOC00LTAuNDgtNC42NCAzLjEyLTExLjA0IDIuNTYtMTQuODgtMS42bC0zOC40LTQwLjMyem0tMTA1Ljc2IDEwMi40YzUyLjE2IDAgOTQuNCAtNDIuMjQgOTQuNC05NC40cy00Mi4yNC05NC40LTk0LjQtOTQuNHMtOTQuNCA0Mi4yNC05NC40IDk0LjRzNDIuMjQgOTQuNCA5NC40IDk0LjR6IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPgo=');
  background-size: 100%;
  background-repeat: no-repeat;
  color: transparent;
  position: relative;
  width: 40px;
  height: 40px;
  display: block;
}

.midi-download:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0px 0px 15px 10px #70d4eb;
  background-color: #70d4eb;
}

.midi-download:active:not(:disabled) {
  border-radius: 100%;
  box-shadow: inset 0px 0px 10px 0px rgb(240, 237, 237);
}

.midi-download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .sound-button-container {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
