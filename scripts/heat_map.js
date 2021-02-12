class HeatMap {
  constructor(tempoEstimator) {
    this.tempoEstimator = tempoEstimator;

    // In HSL.
    this.slowingSteadyColor = [215, 0, 14];
    this.acceleratingSteadyColor = [355, 0, 14];
    this.acceleratingColor = [355, 47, 14];
    this.slowingColor = [215, 90, 14];
  }

  getBackgroundColor(timelineState) {
    const { curTime } = timelineState;
    const acceleration = this.tempoEstimator.estimateAcceleration(curTime);
    const normalized = Math.min(1, Math.max(-1, acceleration / 5));
    const t = this.easeInCubic(Math.abs(normalized));

    const sourceColor = (normalized < 0) ? this.slowingSteadyColor : this.acceleratingSteadyColor;
    const targetColor = (normalized < 0) ? this.slowingColor : this.acceleratingColor;
    return this.lerp(sourceColor, targetColor, t);
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