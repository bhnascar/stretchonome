class Timeline {
  constructor(canvas, canvasOverlay) {
    this.canvas = canvas;
    this.canvasOverlay = canvasOverlay;

    this.ctx = canvas.getContext('2d');
    this.resize();

    this.active = false;

    this.windowSize = 5;
    this.majorInterval = 1;
    this.minorInterval = 0.25;

    this.curTime = 0;
    this.lastFrameTimeMS = 0;

    this.nodePool = [];
  }

  resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.ctx.font = '12px sans-serif';
    this.ctx.strokeStyle = '#999';
    this.ctx.fillStyle = '#999';
    this.ctx.lineWidth = 2;
  }

  toDateString(time) {
    const tmp = new Date(time * 1000);
    const hours = tmp.getUTCHours().toString().padStart(2, '0');
    const minutes = tmp.getUTCMinutes().toString().padStart(2, '0');
    const seconds = tmp.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  drawTicks(time) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const left = time - 0.5 * this.windowSize;
    const right = time + 0.5 * this.windowSize;
    let cur = Math.ceil(left / this.minorInterval) * this.minorInterval;
    while (cur < right) {
      if (cur >= 0) {
        const x = ((cur - left) / this.windowSize) * this.canvas.clientWidth;
        const isMajorInterval = (cur / this.majorInterval) - Math.floor(cur / this.majorInterval) < 0.001;
        const lineHeight = (isMajorInterval) ? 75.5 : 50.5;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, lineHeight);
        this.ctx.stroke();
        if (isMajorInterval) {
          this.ctx.fillText(this.toDateString(cur), x + 5, 73.5);
        }
      }
      cur += this.minorInterval;
    }
  }

  drawBeats(time) {
    const left = time - 0.5 * this.windowSize;
    const right = time + 0.5 * this.windowSize;
    
    const validBeats = [];
    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      if (beat >= left && beat <= right) {
        validBeats.push(beat);
      }
    }

    let reuseIndex = 0;
    for (let i = 0; i < validBeats.length; i++) {
      var beat = validBeats[i];
      let node;
      if (this.nodePool.length > reuseIndex) {
        node = this.nodePool[reuseIndex];
      } else {
        node = document.createElement('div');
        node.style.width = '8px';
        node.style.height = '300px';
        node.style.top = '100px';
        node.style.backgroundColor = '#FF0000';
        node.style.position = "absolute";
        node.style.borderRadius = '4px';
        this.nodePool.push(node);
      }
      const x = ((beat - left) / this.windowSize) * this.canvas.clientWidth;
      node.style.left = `${x - 4}px`;
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

  setWindowSize(windowSize) {
    this.windowSize = Math.min(Math.max(2, windowSize), 10);
  }

  currentTime() {
    return this.curTime;
  }

  reset() {
    this.curTime = 0;
  }

  start() {
    this.active = true;
  }

  stop() {
    this.active = false;
  }

  setTime(time) {
    this.curTime = time;
  }

  render(timeMS) {
    if (this.active) {
      this.curTime += (timeMS - this.lastFrameTimeMS) / 1000;
    }
    this.drawTicks(this.curTime);
    this.drawBeats(this.curTime);
    this.lastFrameTimeMS = timeMS;
  }
}
