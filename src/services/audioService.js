/**
 * A service for handling audio playback and caching in the progression view
 */
export default class AudioService {
  constructor() {
    this.audioCache = new Map();
    this.currentPlayingAudio = null;
    this.previousAudio = null;
    this.currentTimeout = null;
    this.fadeOutTimeout = null;
    this.fadeDuration = 40;
    this.isPreloading = false;
    this.fadeIntervals = []; 
    this.volumeEnvelope = {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.8,
      release: 0.3
    };
    this.volumeEnvelopeInterval = null;
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
    
    const audio = new Audio(`src/assets/singlechord/${chord}.mp3`);
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
   * หยุดเสียงที่กำลังเล่นและลบการตั้งเวลาทั้งหมด
   */
  stopAll() {
    // Clear any existing timeout
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    
    if (this.fadeOutTimeout) {
      clearTimeout(this.fadeOutTimeout);
      this.fadeOutTimeout = null;
    }
    
    // ล้าง intervals ทั้งหมด
    this.fadeIntervals.forEach(intervalId => clearInterval(intervalId));
    this.fadeIntervals = [];

    if (this.volumeEnvelopeInterval) {
      clearInterval(this.volumeEnvelopeInterval);
      this.volumeEnvelopeInterval = null;
    }
    
    // หยุดเสียงที่กำลังเล่นอยู่
    if (this.currentPlayingAudio) {
      this.currentPlayingAudio.pause();
      this.currentPlayingAudio.currentTime = 0;
      this.currentPlayingAudio = null;
    }
    
    // หยุดเสียงก่อนหน้า
    if (this.previousAudio) {
      this.previousAudio.pause();
      this.previousAudio.currentTime = 0;
      this.previousAudio = null;
    }
    
    // Stop all cached audios
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
  
  /**
   * Fade out และหยุดเสียง
   * @param {HTMLAudioElement} audio - เสียงที่จะหยุด
   * @param {number} duration - ระยะเวลาในการ fade (ms)
   */
  fadeOutAndStop(audio, duration = this.fadeDuration) {
    if (!audio) return;
    
    if (!audio || typeof audio.volume === 'undefined') {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }
    
    const originalVolume = audio.volume;
    const fadeSteps = 5; 
    const fadeInterval = duration / fadeSteps;
    
    let currentStep = 0;
    
    // หยุด interval เดิมทั้งหมด
    this.fadeIntervals = this.fadeIntervals.filter(id => {
      clearInterval(id);
      return false;
    });
    
    const fadeOutInterval = setInterval(() => {
      currentStep++;
      
      if (currentStep >= fadeSteps || !audio) {
        clearInterval(fadeOutInterval);
        
        const index = this.fadeIntervals.indexOf(fadeOutInterval);
        if (index !== -1) this.fadeIntervals.splice(index, 1);
        
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      } else {
        try {
          // ใช้ exponential fadeout เพื่อความเป็นธรรมชาติ
          const ratio = Math.pow(1 - (currentStep / fadeSteps), 2);
          audio.volume = Math.max(0, originalVolume * ratio);
        } catch (error) {
          console.error('Error setting audio volume:', error);
          clearInterval(fadeOutInterval);
        }
      }
    }, fadeInterval);
    
    // เก็บ interval ID
    this.fadeIntervals.push(fadeOutInterval);
  }

  /**
   * ใช้ ADSR envelope กับเสียง
   * @param {HTMLAudioElement} audio - เสียงที่จะปรับ envelope 
   * @param {number} durationMs - ความยาวของคอร์ดทั้งหมด (ms)
   */
  applyVolumeEnvelope(audio, durationMs) {
    if (!audio) return;
    
    // ล้าง interval เดิม
    if (this.volumeEnvelopeInterval) {
      clearInterval(this.volumeEnvelopeInterval);
      this.volumeEnvelopeInterval = null;
    }
    
    const maxVolume = 0.8;  // ความดังสูงสุด
    
    // คำนวณเวลาสำหรับแต่ละช่วง (ms)
    const attackTime = durationMs * this.volumeEnvelope.attack;
    const decayTime = durationMs * this.volumeEnvelope.decay;
    const sustainLevel = this.volumeEnvelope.sustain * maxVolume;
    const releaseTime = durationMs * this.volumeEnvelope.release;
    
    // เวลาที่เริ่มต้นแต่ละช่วง
    const decayStart = attackTime;
    const sustainStart = attackTime + decayTime;
    const releaseStart = durationMs - releaseTime;
    
    const updateInterval = Math.min(30, durationMs / 50);  // อัพเดททุก 30ms หรือน้อยกว่าถ้า BPM สูงมาก
    let startTime = Date.now();
    
    audio.volume = 0;  // เริ่มที่ความดัง 0
    
    this.volumeEnvelopeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed >= durationMs) {
        // สิ้นสุดแล้ว
        clearInterval(this.volumeEnvelopeInterval);
        this.volumeEnvelopeInterval = null;
        return;
      }
      
      try {
        // ใช้ ADSR envelope
        if (elapsed < attackTime) {
          // Attack phase: เพิ่มความดังจาก 0 ถึงค่าสูงสุด
          const ratio = elapsed / attackTime;
          audio.volume = maxVolume * ratio;
        } 
        else if (elapsed < sustainStart) {
          // Decay phase: ลดความดังจากค่าสูงสุดเป็น sustain
          const ratio = (elapsed - decayStart) / decayTime;
          audio.volume = maxVolume - (ratio * (maxVolume - sustainLevel));
        } 
        else if (elapsed < releaseStart) {
          // Sustain phase: รักษาความดังคงที่
          audio.volume = sustainLevel;
        } 
        else {
          // Release phase: ลดความดังลงไปถึง 0
          const ratio = (elapsed - releaseStart) / releaseTime;
          audio.volume = sustainLevel * (1 - ratio);
        }
      } catch (error) {
        console.error('Error setting volume in envelope:', error);
        clearInterval(this.volumeEnvelopeInterval);
        this.volumeEnvelopeInterval = null;
      }
    }, updateInterval);
  }
  
  /**
   * เล่นเสียงคอร์ดเดี่ยว
   * @param {string} chord - ชื่อคอร์ด
   * @returns {Promise<void>} - Promise ที่จะทำงานเสร็จเมื่อเริ่มเล่นเสียง
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
    
    // ใช้ volume envelope แทน fade in ธรรมดา
    this.applyVolumeEnvelope(audio, 2000); // 2 วินาทีสำหรับการเล่น single chord
    
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
   * Plays a sequence of chords at the specified tempo without overlapping sounds
   * @param {Array<string>} chords - Array of chord names to play
   * @param {number} tempo - The tempo in BPM
   * @param {number|Array<number>} beatsPerChord - Number of beats per chord or array of beats for each chord
   * @param {Function} onChordChange - Callback for when chord changes, receives indices
   * @param {Function} onComplete - Callback for when playback completes
   * @returns {Function} - A function to stop playback
   */
  async playChordSequence(chords, tempo, beatsPerChord, onChordChange, onComplete) {
    this.stopAll();
    
    // ปรับค่า envelope ตาม tempo
    if (tempo > 150) {
      // สำหรับ tempo เร็ว: attack เร็วขึ้น, release สั้นลง 
      this.volumeEnvelope.attack = 0.005;
      this.volumeEnvelope.decay = 0.02;
      this.volumeEnvelope.sustain = 0.7;
      this.volumeEnvelope.release = 0.2;
    } else if (tempo > 100) {
      // สำหรับ tempo ปานกลาง
      this.volumeEnvelope.attack = 0.01;
      this.volumeEnvelope.decay = 0.05;
      this.volumeEnvelope.sustain = 0.8;
      this.volumeEnvelope.release = 0.25;
    } else {
      // สำหรับ tempo ช้า: attack นุ่มนวลขึ้น, release ยาวขึ้น
      this.volumeEnvelope.attack = 0.02;
      this.volumeEnvelope.decay = 0.08;
      this.volumeEnvelope.sustain = 0.85;
      this.volumeEnvelope.release = 0.3;
    }
    
    // Preload all chords
    await this.preloadAllChords(chords);
    
    try {
      let sequenceIndex = 0;
      const msPerBeat = 60000 / tempo;
      let isPlaying = true;
      
      const playNextChord = async () => {
        if (sequenceIndex < chords.length && isPlaying) {
          // ดึงข้อมูลคอร์ด
          const currentChord = chords[sequenceIndex];
          
          // คำนวณระยะเวลาของคอร์ด
          const currentBeats = Array.isArray(beatsPerChord) ? 
            (beatsPerChord[sequenceIndex] || 2) : beatsPerChord;
          const msPerChord = msPerBeat * currentBeats;
          
          // คำนวณตำแหน่งสำหรับการแสดงผล
          const { barIndex, chordIndex } = this.calculatePositionIndices(sequenceIndex, beatsPerChord);
          
          // แจ้ง callback เมื่อเปลี่ยนคอร์ด
          onChordChange(barIndex, chordIndex);
          
          // หยุดเสียงก่อนหน้า
          if (this.currentPlayingAudio) {
            if (this.previousAudio) {
              this.previousAudio.pause();
              this.previousAudio.currentTime = 0;
              this.previousAudio = null;
            }
            
            this.previousAudio = this.currentPlayingAudio;
            this.fadeOutAndStop(this.previousAudio, 100);
          }
          
          // เตรียมเสียง
          const audio = await this.preloadAudio(currentChord);
          
          // ตั้งค่าเสียง
          this.currentPlayingAudio = audio;
          audio.currentTime = 0;
          audio.volume = 0;  // เริ่มที่ความดัง 0
          
          // เล่นเสียง
          try {
            await audio.play();
          } catch (error) {
            console.error('Audio play failed:', error);
          }
          
          // ปรับความดังตาม envelope
          // ปรับเวลาให้น้อยลงเล็กน้อยเพื่อให้มีช่วงเวลาระหว่างคอร์ด
          const adjustedDuration = msPerChord * 0.95;
          this.applyVolumeEnvelope(audio, adjustedDuration);
          
          // ไปยังคอร์ดถัดไป
          sequenceIndex++;
          
          if (sequenceIndex < chords.length && isPlaying) {
            // ตั้งเวลาเล่นคอร์ดถัดไป
            this.currentTimeout = setTimeout(playNextChord, msPerChord);
          } else {
            // เล่นเสร็จแล้ว
            const finalBeats = Array.isArray(beatsPerChord) ? 
              (beatsPerChord[sequenceIndex - 1] || 2) : beatsPerChord;
            const finalMsPerChord = msPerBeat * finalBeats;
            
            // ตั้งเวลาสำหรับการเล่นเสร็จสิ้น
            this.currentTimeout = setTimeout(() => {
              isPlaying = false;
              this.stopAll();
              
              // เรียก onComplete
              onComplete();
              this.currentTimeout = null;
              this.currentPlayingAudio = null;
              this.previousAudio = null;
            }, finalMsPerChord * 0.8);
          }
        }
      };
      
      // เริ่มเล่นคอร์ดแรก
      playNextChord();
      
      // คืนฟังก์ชันสำหรับหยุดเล่น
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
