class BeatVisualizer {
  constructor(canvasOverlay, beats) {
    this.canvasOverlay = canvasOverlay;
    this.beats = beats;
    this.nodePool = [];
  }

  render(timelineState) {
    const { windowMin, windowMax } = timelineState;
    const windowSize = windowMax - windowMin;
    
    const validBeats = [];
    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      if (beat >= windowMin && beat <= windowMax) {
        validBeats.push(beat);
      }
    }

    let reuseIndex = 0;
    let offsetTop = this.canvasOverlay.clientHeight * 0.25;
    let beatHeight = this.canvasOverlay.clientHeight * 0.5;
    for (let i = 0; i < validBeats.length; i++) {
      var beat = validBeats[i];
      let node;
      if (this.nodePool.length > reuseIndex) {
        node = this.nodePool[reuseIndex];
      } else {
        node = document.createElement('div');
        node.classList.add('beat');
        this.nodePool.push(node);
      }
      const x = ((beat - windowMin) / windowSize) * this.canvasOverlay.clientWidth;
      node.style.left = `${x - 4}px`;
      node.style.top = `${offsetTop}px`;
      node.style.height = `${beatHeight}px`;
      if (!node.parentNode) {
        this.canvasOverlay.appendChild(node);
      }
      reuseIndex++;
    };

    while (reuseIndex < this.nodePool.length) {
      let node = this.nodePool[reuseIndex];
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      reuseIndex++;
    }
  }
}