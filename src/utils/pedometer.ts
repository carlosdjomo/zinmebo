// Real-time Pedometer & DeviceMotion tracker for Zinmebo

type StepCallback = (stepCountDelta: number) => void;

class MotionPedometer {
  private isListening = false;
  private onStepCallback: StepCallback | null = null;
  private lastStepTimestamp = 0;
  private lastAccelMagnitude = 0;
  private isPeakCandidate = false;

  // Thresholds for step detection
  private readonly STEP_THRESHOLD = 1.35; // Acceleration spike above gravity (m/s^2)
  private readonly MIN_STEP_INTERVAL_MS = 290; // Approx max cadence ~200 spm

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  }

  public async requestMotionPermission(): Promise<boolean> {
    if (!this.isAvailable()) return false;

    // iOS 13+ requires explicit user interaction to grant motion permission
    const MotionEvent = window.DeviceMotionEvent as any;
    if (typeof MotionEvent.requestPermission === 'function') {
      try {
        const state = await MotionEvent.requestPermission();
        return state === 'granted';
      } catch (err) {
        console.warn('DeviceMotionEvent permission error:', err);
        return false;
      }
    }
    return true; // Android / standard desktop Chrome don't require explicit popup
  }

  public startListening(callback: StepCallback) {
    if (this.isListening) return;
    this.onStepCallback = callback;

    if (typeof window !== 'undefined') {
      window.addEventListener('devicemotion', this.handleMotion, { passive: true });
      this.isListening = true;
    }
  }

  public stopListening() {
    if (!this.isListening) return;
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleMotion);
    }
    this.isListening = false;
    this.onStepCallback = null;
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    // Vector magnitude minus Earth standard gravity (~9.81 m/s^2)
    const rawMagnitude = Math.sqrt(x * x + y * y + z * z);
    const dynamicMagnitude = Math.abs(rawMagnitude - 9.81);

    const now = Date.now();

    // Check for peak
    if (dynamicMagnitude > this.STEP_THRESHOLD && dynamicMagnitude > this.lastAccelMagnitude) {
      this.isPeakCandidate = true;
    } else if (
      this.isPeakCandidate &&
      dynamicMagnitude < this.lastAccelMagnitude &&
      now - this.lastStepTimestamp > this.MIN_STEP_INTERVAL_MS
    ) {
      // Peak detected!
      this.lastStepTimestamp = now;
      this.isPeakCandidate = false;

      if (this.onStepCallback) {
        this.onStepCallback(1);
      }
    }

    this.lastAccelMagnitude = dynamicMagnitude;
  };

  public getStatus(): boolean {
    return this.isListening;
  }
}

export const pedometer = new MotionPedometer();
