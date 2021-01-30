const defaultSettings = {
  windowSize: 5,
  majorInterval: 1,
  minorInterval: 0.25,
};

class Timeline {
  constructor(canvas, settings) {
    this.canvas = canvas;

    this.ctx = canvas.getContext('2d');
    this.resize();

    this.settings = {
      ...defaultSettings,
      ...settings,
    };

    this.active = false;
    this.curTime = 0;
    this.lastFrameTimeMS = 0;

    this.plugins = [];
  }

  resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    this.windowWidth = rect.width;
    this.windowHeight = rect.height;

    this.ctx.scale(dpr, dpr);
    this.ctx.font = '12px sans-serif';
    this.ctx.lineWidth = 2;
  }

  toDateString(time) {
    const tmp = new Date(time * 1000);
    const minutes = tmp.getUTCMinutes().toString().padStart(2, '0');
    const seconds = tmp.getSeconds().toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  draw(timelineState) {
    const { windowSize, minorInterval, majorInterval } = this.settings;
    const { windowMin, windowMax, windowWidth, windowHeight } = timelineState;

    const majorLineHeight = 0.12 * windowHeight;
    const minorLineHeight = 0.08 * windowHeight;

    this.ctx.strokeStyle = '#666';
    this.ctx.fillStyle = '#666';

    // Draw ticks.
    let cur = Math.floor(windowMin / minorInterval) * minorInterval;
    while (cur < windowMax) {
      if (cur >= 0) {
        const x = ((cur - windowMin) / windowSize) * windowWidth;
        const isMajorInterval = (cur / majorInterval) - Math.floor(cur / majorInterval) < 0.001;
        const lineHeight = (isMajorInterval) ? majorLineHeight : minorLineHeight;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, lineHeight);
        this.ctx.stroke();
      }
      cur += minorInterval;
    }

    // Draw labels (separate pass to avoid state changes).
    cur = Math.floor(windowMin / majorInterval) * majorInterval;
    while (cur < windowMax) {
      if (cur >= 0) {
        const x = ((cur - windowMin) / windowSize) * windowWidth;
        this.ctx.fillText(this.toDateString(cur), x + 5, majorLineHeight - 2);
      }
      cur += majorInterval;
    }

    // Draw needle.
    this.ctx.strokeStyle = '#F00';
    this.ctx.fillStyle = '#F00';

    this.ctx.beginPath();
    this.ctx.moveTo(windowWidth / 2, 0);
    this.ctx.lineTo(windowWidth / 2, windowHeight);
    this.ctx.stroke();
  }

  addPlugin(plugin) {
    this.plugins.push(plugin);
  }

  setWindowSize(windowSize) {
    this.settings.windowSize = Math.min(Math.max(2, windowSize), 10);
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

  render(timeMS) {
    if (this.active) {
      this.curTime += (timeMS - this.lastFrameTimeMS) / 1000;
    }
    const timelineState = {
      ctx: this.ctx,
      curTime: this.curTime,
      active: this.active,
      windowMin: this.curTime - 0.5 * this.settings.windowSize,
      windowMax: this.curTime + 0.5 * this.settings.windowSize,
      windowWidth: this.windowWidth,
      windowHeight: this.windowHeight,
    };
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw(timelineState);
    this.plugins.forEach((plugin) => {
      plugin.render(timelineState);
    })
    this.lastFrameTimeMS = timeMS;
  }
}
