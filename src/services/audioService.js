/**
 * A service for handling audio playback and caching in the progression view
 */
export default class AudioService {
  constructor() {
    this.audioCache = new Map();
    this.currentPlayingAudio = null;
    this.currentTimeout = null;
    this.fadeDuration = 50; // มิลลิวินาที สำหรับ fade in/out เพื่อลดเสียงคลิก
    this.isPreloading = false;
  }
  
  /**
   * Preloads audio files for all chord names
   * @param {Array<string>} chords - Array of chord names to preload
   * @returns {Promise<void>}
   */
  async preloadAllChords(chords) {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    const uniqueChords = [...new Set(chords)];
    
    try {
      // ใช้ Promise.allSettled เพื่อให้ preload ต่อไปแม้บางคอร์ดจะไม่สำเร็จ
      await Promise.allSettled(
        uniqueChords.map(chord => this.preloadAudio(chord))
      );
    } catch (error) {
      console.warn('Some chords failed to preload:', error);
    } finally {
      this.isPreloading = false;
    }
  }
  
  /**
   * Preloads an audio file for a chord
   * @param {string} chord - The chord to preload audio for
   * @returns {Promise<HTMLAudioElement>} - A promise resolving to the audio element
   */
  async preloadAudio(chord) {
    if (this.audioCache.has(chord)) {
      // Create a new instance to allow multiple sounds to be played simultaneously
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
        // Create a new instance for use
        const newAudio = new Audio(audio.src);
        newAudio.volume = 0.8;
        newAudio.preload = "auto";
        resolve(newAudio);
      });
      audio.addEventListener('error', reject);
      audio.load();
    });
  }
  
  /**
   * Stops all currently playing audio with a smooth fade out
   */
  stopAll() {
    // Clear any existing timeout
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    
    // Stop any currently playing audio with fade out
    if (this.currentPlayingAudio) {
      this.fadeOutAndStop(this.currentPlayingAudio);
      this.currentPlayingAudio = null;
    }
    
    // Stop all cached audios
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
  
  /**
   * Fade out and stop an audio element
   * @param {HTMLAudioElement} audio - The audio element to fade out and stop
   */
  fadeOutAndStop(audio) {
    if (!audio) return;
    
    // ตรวจสอบว่า audio เป็น element ที่สมบูรณ์และมี volume
    if (!audio.volume) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }
    
    const originalVolume = audio.volume;
    const fadeSteps = 10;
    const fadeInterval = this.fadeDuration / fadeSteps;
    const volumeStep = originalVolume / fadeSteps;
    
    let currentStep = 0;
    
    const fadeOutInterval = setInterval(() => {
      currentStep++;
      
      if (currentStep >= fadeSteps) {
        clearInterval(fadeOutInterval);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = originalVolume; // คืนค่า volume เดิม
      } else {
        audio.volume = Math.max(0, originalVolume - (volumeStep * currentStep));
      }
    }, fadeInterval);
  }
  
  /**
   * Play a single chord sound with fade in
   * @param {string} chord - The chord to play
   * @returns {Promise<void>} - A promise that resolves when the chord starts playing
   */
  async playSingleChord(chord) {
    const audio = await this.preloadAudio(chord);
    
    if (this.currentPlayingAudio) {
      this.fadeOutAndStop(this.currentPlayingAudio);
    }
    
    this.currentPlayingAudio = audio;
    audio.currentTime = 0;
    audio.volume = 0;
    
    const playPromise = audio.play();
    
    // Fade in
    let currentStep = 0;
    const fadeSteps = 8;
    const fadeInterval = this.fadeDuration / fadeSteps;
    const volumeStep = 0.8 / fadeSteps; // Target volume is 0.8
    
    const fadeInInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(0.8, volumeStep * currentStep);
      
      if (currentStep >= fadeSteps) {
        clearInterval(fadeInInterval);
      }
    }, fadeInterval);
    
    return playPromise;
  }
  
  /**
   * Improved calculation of bar and chord positions for visualization
   * @param {number} sequenceIndex - Current index in the sequence
   * @param {number|Array<number>} beatsPerChord - Beats per chord settings
   * @returns {Object} - Contains barIndex and chordIndex
   */
  calculatePositionIndices(sequenceIndex, beatsPerChord) {
    // Handle custom beats calculation for visualization
    if (Array.isArray(beatsPerChord)) {
      let barIndex = 0;
      let beatCounter = 0;
      let chordsInCurrentBar = 0;
      
      // Calculate each bar's content
      for (let i = 0; i <= sequenceIndex; i++) {
        // If we've reached our target index, return current position
        if (i === sequenceIndex) {
          return {
            barIndex: barIndex,
            chordIndex: chordsInCurrentBar
          };
        }
        
        // Add beats for this chord
        const chordBeats = beatsPerChord[i] || 2;
        beatCounter += chordBeats;
        chordsInCurrentBar++;
        
        // Every 4 beats is a new bar (standard 4/4 time)
        if (beatCounter >= 4) {
          barIndex++;
          beatCounter = beatCounter % 4;
          chordsInCurrentBar = 0;
        }
      }
      
      // Fallback - shouldn't reach here
      return {
        barIndex: barIndex,
        chordIndex: chordsInCurrentBar
      };
    } else {
      // Standard uniform beats calculation
      const chordsPerBar = Math.round(4 / beatsPerChord); // Assuming 4/4 time
      return {
        barIndex: Math.floor(sequenceIndex / chordsPerBar),
        chordIndex: sequenceIndex % chordsPerBar
      };
    }
  }
  
  /**
   * Plays a sequence of chords at the specified tempo
   * @param {Array<string>} chords - Array of chord names to play
   * @param {number} tempo - The tempo in BPM
   * @param {number|Array<number>} beatsPerChord - Number of beats per chord or array of beats for each chord
   * @param {Function} onChordChange - Callback for when chord changes, receives indices
   * @param {Function} onComplete - Callback for when playback completes
   * @returns {Function} - A function to stop playback
   */
  async playChordSequence(chords, tempo, beatsPerChord, onChordChange, onComplete) {
    this.stopAll();
    
    // Preload all chords before starting playback for smoother experience
    await this.preloadAllChords(chords);
    
    try {
      let sequenceIndex = 0;
      const msPerBeat = 60000 / tempo;
      let isPlaying = true;
      
      const playNextChord = async () => {
        if (sequenceIndex < chords.length && isPlaying) {
          // Stop previous sound with fade out
          if (this.currentPlayingAudio) {
            this.fadeOutAndStop(this.currentPlayingAudio);
          }
          
          // Calculate position indices for visualization
          const { barIndex, chordIndex } = this.calculatePositionIndices(sequenceIndex, beatsPerChord);
          
          // Call the onChordChange callback with calculated indices
          onChordChange(barIndex, chordIndex);
          
          // Play the new sound with fade in
          const currentChord = chords[sequenceIndex];
          const audio = await this.preloadAudio(currentChord);
          
          this.currentPlayingAudio = audio;
          audio.currentTime = 0;
          audio.volume = 0; // Start at 0 for fade in
          
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Audio play failed:', error);
            });
          }
          
          // Fade in
          let currentStep = 0;
          const fadeSteps = 8;
          const fadeInterval = this.fadeDuration / fadeSteps;
          const volumeStep = 0.8 / fadeSteps; // Target volume is 0.8
          
          const fadeInInterval = setInterval(() => {
            currentStep++;
            if (audio && audio.volume !== undefined) {
              audio.volume = Math.min(0.8, volumeStep * currentStep);
            }
            
            if (currentStep >= fadeSteps) {
              clearInterval(fadeInInterval);
            }
          }, fadeInterval);
          
          // Calculate how long this chord should play
          const currentBeats = Array.isArray(beatsPerChord) ? 
            (beatsPerChord[sequenceIndex] || 2) : beatsPerChord;
          const msPerChord = msPerBeat * currentBeats;
          
          // Set up to stop the sound with fade out before next chord
          const stopCurrentAudio = () => {
            if (audio === this.currentPlayingAudio) {
              this.fadeOutAndStop(audio);
              this.currentPlayingAudio = null;
            }
          };
          
          // Calculate when to start fade out - 50ms before next chord
          const fadeOutTime = Math.max(msPerChord - this.fadeDuration, msPerChord * 0.75);
          setTimeout(stopCurrentAudio, fadeOutTime);
          
          sequenceIndex++;
          
          if (sequenceIndex < chords.length && isPlaying) {
            // Calculate delay for next chord based on the current chord's duration
            const nextChordDelay = msPerChord;
            
            this.currentTimeout = setTimeout(playNextChord, nextChordDelay);
          } else {
            // Finished playing
            const finalBeats = Array.isArray(beatsPerChord) ? 
              (beatsPerChord[sequenceIndex - 1] || 2) : beatsPerChord;
            const finalMsPerChord = msPerBeat * finalBeats;
            
            this.currentTimeout = setTimeout(() => {
              isPlaying = false;
              onComplete();
              this.currentTimeout = null;
              if (this.currentPlayingAudio) {
                this.currentPlayingAudio = null;
              }
            }, Math.min(finalMsPerChord, 3000));
          }
        }
      };
      
      playNextChord();
      
      // Return a function to stop playback
      return () => {
        isPlaying = false;
        this.stopAll();
      };
    } catch (error) {
      console.error('Failed to play chord sequence:', error);
      onComplete();
      return () => {};
    }
  }
}
