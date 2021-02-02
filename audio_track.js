class AudioTrack {
  constructor(beatManager) {
    this.beatManager = beatManager;
    this.prevTime = 0;
    this.muted = false;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    this.loadClip('https://freesound.org/data/previews/250/250551_4570971-lq.mp3');
  }

  async loadClip(url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    } catch(error) {
      console.error('Error loading clip: ', url, error);
    }
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  playTick() {
    if (this.audioBuffer && !this.muted) {
      const node = this.audioCtx.createBufferSource();
      node.buffer = this.audioBuffer;
      node.connect(this.audioCtx.destination);
      node.start();
    }
  }

  render(timelineState) {
    const { active, curTime } = timelineState;
    if (!active) {
      this.prevTime = curTime;
      return;
    }
    const idx = this.beatManager.binarySearchLE(this.beatManager.beats, curTime);
    if ((idx >= 0 && idx < this.beatManager.beats.length) &&
        (this.beatManager.beats[idx] >= this.prevTime) || // If we crossed this frame.
        (this.beatManager.beats[idx] == 0 && curTime < this.prevTime)) { // Rewind case.
      this.playTick();
    }
    this.prevTime = curTime;
  }
}
