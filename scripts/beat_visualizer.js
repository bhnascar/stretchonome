class BeatVisualizer {
  constructor(canvasOverlay, beatManager) {
    this.canvasOverlay = canvasOverlay;
    this.beatManager = beatManager;

    this.activeNodes = {};
    this.nodePool = new DOMPool();
  }

  render(timelineState) {
    const { curTime, windowMin, windowMax, windowWidth, windowHeight } = timelineState;
    const windowSize = windowMax - windowMin;

    const trackHeight = 30;
    const uiheight = 120;
    const pad = Math.max(40, 0.15 * windowHeight);
    const beatHeight = windowHeight - (trackHeight + uiheight + 2 * pad);

    const currentNodes = {};
    const { beats } = this.beatManager;

    const start = this.beatManager.binarySearchGE(beats, windowMin);
    if (start >= 0) {
      for (let i = start; i < beats.length && beats[i] <= windowMax; i++) {
        const beat = beats[i];

        // Reuse or get a DOM node for this beat.
        let node = this.activeNodes[beat];
        if (!node) {
          node = this.nodePool.getNode('div');
          node.classList.add('beat');
          this.canvasOverlay.appendChild(node);
        }
        currentNodes[beat] = node;

        // Position the node.
        const x = ((beat - windowMin) / windowSize) * windowWidth;
        node.style.left = `${x - 4}px`;
        node.style.top = `${trackHeight + pad}px`;
        node.style.height = `${beatHeight}px`;

        // Animate nodes that overlap with 'now'.
        const timeGap = (curTime - beat);
        if (timeGap < 0.6 && timeGap > 0) {
          if (!node.classList.contains('beat-bounce')) {
            node.classList.add('beat-bounce');
          }
        } else {
          if (node.classList.contains('beat-bounce')) {
            node.classList.remove('beat-bounce');
          }
        }
      };
    }

    // Free unused nodes.
    for (const beat in this.activeNodes) {
      if (!currentNodes[beat]) {
        const node = this.activeNodes[beat];
        this.canvasOverlay.removeChild(node);
        this.nodePool.putNode(node);
      }
    }
    this.activeNodes = currentNodes;
  }
}
