class BeatVisualizer {
  constructor(canvasOverlay, beats) {
    this.canvasOverlay = canvasOverlay;
    this.beats = beats;

    this.activeNodes = {};
    this.nodePool = new DOMPool();
  }

  render(timelineState) {
    const { windowMin, windowMax } = timelineState;
    const windowSize = windowMax - windowMin;
    
    const validBeats = [];
    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      if (beat >= windowMin && beat <= windowMax) {
        validBeats.push(beat);
        if (!this.activeNodes[beat]) {
          const node = this.nodePool.getNode('div');
          node.classList.add('beat');
          this.canvasOverlay.appendChild(node);
          this.activeNodes[beat] = node;
        }
      } else if (this.activeNodes[beat]) {
        const node = this.activeNodes[beat];
        delete this.activeNodes[beat];
        this.nodePool.putNode(node);
      }
    }

    if (this.beats.length == 0) {
      for (let beat in this.activeNodes) {
        const node = this.activeNodes[beat];
        delete this.activeNodes[beat];
        this.nodePool.putNode(node);
      }
    }

    let offsetTop = this.canvasOverlay.clientHeight * 0.25;
    let beatHeight = this.canvasOverlay.clientHeight * 0.5;
    for (let i = 0; i < validBeats.length; i++) {
      var beat = validBeats[i];
      const node = this.activeNodes[beat];
      const x = ((beat - windowMin) / windowSize) * this.canvasOverlay.clientWidth;
      node.style.left = `${x - 4}px`;
      node.style.top = `${offsetTop}px`;
      node.style.height = `${beatHeight}px`;
    };
  }
}
