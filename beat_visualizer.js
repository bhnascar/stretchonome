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

    const currentNodes = {};

    const start = this.binarySearchGE(this.beats, windowMin);
    if (start >= 0) {
      for (let i = start; i < this.beats.length && this.beats[i] <= windowMax; i++) {
        var beat = beats[i];

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
        node.style.top = `${windowHeight * 0.25}px`;
        node.style.height = `${windowHeight * 0.5}px`;

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
        this.nodePool.putNode(node);
      }
    }
    this.activeNodes = currentNodes;
  }

  binarySearchGE(arr, target) {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      if (arr[mid] >= target && (mid == 0 || arr[mid - 1] < target)) {
        return mid;
      }
      if (arr[mid] < target) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    return -1;
  }
}
