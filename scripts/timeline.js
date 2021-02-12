const defaultSettings = {
  windowSize: 5,
  majorInterval: 1,
  minorInterval: 0.25,
};

class Timeline {
  constructor(canvas, settings) {
    this.canvas = canvas;

    this.ctx = canvas.getContext('2d', { alpha: false });
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
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    this.windowWidth = rect.width;
    this.windowHeight = rect.height;

    this.ctx.scale(dpr, dpr);
    this.ctx.font = '12px sans-serif';
  }

  toDateString(time) {
    const minutes = `${Math.floor(time / 60)}`.padStart(2, '0');
    const seconds = `${time - Math.floor(time / 60) * 60}`.padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  draw(timelineState) {
    const { windowSize, majorInterval } = this.settings;
    const { windowMin, windowMax, windowWidth, windowHeight } = timelineState;

    // Draw background.
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, windowWidth, windowHeight);

    // Draw tick shadow.
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#111';
    let cur = Math.max(0, Math.floor(windowMin / majorInterval) * majorInterval);
    while (cur < windowMax) {
      const x = ((cur - windowMin) / windowSize) * windowWidth;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, windowHeight);
      cur += majorInterval;
    }
    this.ctx.stroke();

    // Draw tick highlight.
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#333';
    cur = Math.max(0, Math.floor(windowMin / majorInterval) * majorInterval);
    while (cur < windowMax) {
      const x = ((cur - windowMin) / windowSize) * windowWidth;
      this.ctx.moveTo(x + 1, 0);
      this.ctx.lineTo(x + 1, windowHeight);
      cur += majorInterval;
    }
    this.ctx.stroke();

    // Draw track.
    this.ctx.beginPath();
    this.ctx.fillStyle = '#333';
    this.ctx.rect(0, 0, windowWidth, 30);
    this.ctx.fill();

    // Draw track shadow.
    this.ctx.beginPath();
    this.ctx.moveTo(0, 31);
    this.ctx.lineTo(windowWidth, 31);
    this.ctx.strokeStyle = '#1A1A1A';
    this.ctx.stroke();

    // Draw labels (separate pass to avoid state changes).
    this.ctx.fillStyle = '#666';
    cur = Math.max(0, Math.floor(windowMin / majorInterval) * majorInterval);
    while (cur < windowMax) {
      const x = ((cur - windowMin) / windowSize) * windowWidth;
      this.ctx.fillText(this.toDateString(cur), x - 14, 20);
      cur += majorInterval;
    }

    // Draw needle.
    this.ctx.strokeStyle = '#F00';
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

  timeScale() {
    const { active, windowWidth, settings } = timeline;
    const { windowSize } = settings;
    return windowSize / windowWidth;
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
    this.curTime = Math.max(0, time);
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
    this.draw(timelineState);
    this.plugins.forEach((plugin) => {
      plugin.render(timelineState);
    })
    this.lastFrameTimeMS = timeMS;
  }
}
