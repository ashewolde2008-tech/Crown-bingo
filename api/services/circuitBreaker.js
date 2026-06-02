class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.threshold = options.threshold || 5;
    this.timeout = options.timeout || 30000;
    this.fallback = options.fallback || null;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttemptTime = Date.now();
  }

  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        if (this.fallback) return this.fallback();
        throw new Error('Circuit breaker OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.timeout;
    }
  }

  getState() { return this.state; }
  getFailureCount() { return this.failureCount; }
}

module.exports = { CircuitBreaker };
