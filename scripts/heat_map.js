class HeatMap {
  constructor(background, tempoEstimator) {
    this.background = background;
    this.tempoEstimator = tempoEstimator;

    this.steadyColor = [34, 34, 34]; // #222.
    this.acceleratingColor = [80, 20, 40];
    this.slowingColor = [20, 20, 80];
  }

  render(timelineState) {
    const { curTime } = timelineState;
    const acceleration = this.tempoEstimator.estimateAcceleration(curTime);
    const normalized = Math.min(1, Math.max(-1, acceleration / 5));
    const t = this.easeInCubic(Math.abs(normalized));

    const targetColor = (normalized < 0) ? this.slowingColor : this.acceleratingColor;
    const res = this.lerp(this.steadyColor, targetColor, t);
    this.background.style.backgroundColor = `rgb(${res[0]},${res[1]},${res[2]})`;
  }

  lerp(fromColor, toColor, t) {
    return [
      (1 - t) * fromColor[0] + t * toColor[0],
      (1 - t) * fromColor[1] + t * toColor[1],
      (1 - t) * fromColor[2] + t * toColor[2],
    ];
  }

  easeInCubic(x) {
    return x * x * x;  
  }
}