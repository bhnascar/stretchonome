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
    this.ctx.strokeStyle = '#666';
    this.ctx.fillStyle = '#666';
    this.ctx.lineWidth = 2;
  }

  toDateString(time) {
    const tmp = new Date(time * 1000);
    const minutes = tmp.getUTCMinutes().toString().padStart(2, '0');
    const seconds = tmp.getSeconds().toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  drawTicks(time) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const left = time - 0.5 * this.windowSize;
    const right = time + 0.5 * this.windowSize;
    let cur = Math.ceil(left / this.minorInterval) * this.minorInterval;
    const majorLineHeight = 0.12 * this.canvas.clientHeight;
    const minorLineHeight = 0.08 * this.canvas.clientHeight;
    while (cur < right) {
      if (cur >= 0) {
        const x = ((cur - left) / this.windowSize) * this.canvas.clientWidth;
        const isMajorInterval = (cur / this.majorInterval) - Math.floor(cur / this.majorInterval) < 0.001;
        const lineHeight = (isMajorInterval) ? majorLineHeight : minorLineHeight;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, lineHeight);
        this.ctx.stroke();
        if (isMajorInterval) {
          this.ctx.fillText(this.toDateString(cur), x + 5, majorLineHeight - 2);
        }
      }
      cur += this.minorInterval;
    }
  }

  drawBeats(time, beats) {
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
    let offsetTop = this.canvas.clientHeight * 0.25;
    let beatHeight = this.canvas.clientHeight * 0.5;
    for (let i = 0; i < validBeats.length; i++) {
      var beat = validBeats[i];
      let node;
      if (this.nodePool.length > reuseIndex) {
        node = this.nodePool[reuseIndex];
      } else {
        node = document.createElement('div');
        node.style.width = '8px';
        node.style.backgroundColor = '#FF0000';
        node.style.position = "absolute";
        node.style.borderRadius = '4px';
        this.nodePool.push(node);
      }
      const x = ((beat - left) / this.windowSize) * this.canvas.clientWidth;
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

  setWindowSize(windowSize) {
    this.windowSize = Math.min(Math.max(2, windowSize), 10);
  }

  currentTime() {
    return this.curTime;
  }

  currentTimeString() {
    const tmp = new Date(this.curTime * 1000);
    const minutes = tmp.getUTCMinutes().toString().padStart(2, '0');
    const seconds = tmp.getSeconds().toString().padStart(2, '0');
    const millis = tmp.getMilliseconds().toString().padStart(3, '0');
    return `${minutes}:${seconds}:${millis}`;
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

  render(timeMS, beats) {
    if (this.active) {
      this.curTime += (timeMS - this.lastFrameTimeMS) / 1000;
    }
    this.drawTicks(this.curTime);
    this.drawBeats(this.curTime, beats);
    this.lastFrameTimeMS = timeMS;
  }
}
