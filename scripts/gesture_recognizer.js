// See: https://nolanlawson.com/2019/08/11/high-performance-input-handling-on-the-web/
const frameAlignedWrapper = (handler) => ((event) => {
  let callback;
  if (!callback) {
    requestAnimationFrame(() => {
      callback(event);
    });
  }
  callback = handler;
});

class GestureRecognizer {
  constructor(canvasOverlay) {
    this.dragDelayMS = 50;

    canvasOverlay.addEventListener("touchstart", 
      frameAlignedWrapper(this.touchstart.bind(this)));
    canvasOverlay.addEventListener("touchmove", 
      frameAlignedWrapper(this.touchmove.bind(this)));
    canvasOverlay.addEventListener("touchend", 
      frameAlignedWrapper(this.touchend.bind(this)));
  }

  touchstart(event) {
    this.downTime = performance.now();
    this.lengthMoved = 0;
    this.downPos = [
      event.touches[0].clientX,
      event.touches[0].clientY,
    ];
    this.dragStarted = false;
  }

  touchmove(event) {
    const elapsed = performance.now() - this.downTime;
    const dx = event.touches[0].clientX - this.downPos[0];
    const dy = event.touches[0].clientY - this.downPos[1];
    this.lengthMoved += Math.sqrt(dx * dx + dy * dy);
    if (elapsed > this.dragDelayMS && this.lengthMoved > 4) {
      if (!this.dragStarted) {
        this.onDragStart(this.downPos);
        this.dragStarted = true;
      }
      if (this.onDrag) {
        this.onDrag([
          dx,
          dy,
        ]);
      }
    }
  }

  touchend(_event) {
    const elapsed = performance.now() - this.downTime;
    if (elapsed < this.dragDelayMS || this.lengthMoved < 4) {
      if (this.onTap) {
        this.onTap(this.downTime);
      }
    }
  }
}