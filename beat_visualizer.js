class BeatVisualizer {
  constructor(canvasOverlay, beats) {
    this.canvasOverlay = canvasOverlay;
    this.beats = beats;

    this.activeNodes = {};
    this.nodePool = new DOMPool();
  }

  render(timelineState) {
    const { curTime, windowMin, windowMax, windowWidth, windowHeight } = timelineState;
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

    let offsetTop = windowHeight * 0.25;
    let beatHeight = windowHeight * 0.5;
    for (let i = 0; i < validBeats.length; i++) {
      var beat = validBeats[i];
      const node = this.activeNodes[beat];
      const x = ((beat - windowMin) / windowSize) * windowWidth;
      node.style.left = `${x - 4}px`;
      node.style.top = `${offsetTop}px`;
      node.style.height = `${beatHeight}px`;

      const timeGap = (curTime - beat);
      if (timeGap < 0.6 && timeGap > 0) {
        const t = this.easeInOutCubic(timeGap / 0.6);
        const xScale = this.lerp(2, 1, t);
        const yScale = this.lerp(1.2, 1, t);
        const r = this.lerp(255, 85, t);
        const g = this.lerp(0, 85, t);
        const b = this.lerp(0, 85, t);
        node.style.backgroundColor = `rgb(${r},${g},${b})`;
        node.style.transform = `scale(${xScale}, ${yScale})`;
      } else {
        node.style.backgroundColor = null;
        node.style.transform = null;
      }
    };
  }

  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  lerp(a, b, t) {
    t = Math.min(1, Math.max(t, 0));
    return (1 - t) * a + t * b;
  }
}
