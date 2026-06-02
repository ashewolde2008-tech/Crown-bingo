class RetryWrapper {
  constructor(maxRetries = 3, initialDelayMs = 100) {
    this.maxRetries = maxRetries;
    this.initialDelayMs = initialDelayMs;
  }

  isRetryable(error) {
    const retryableCodes = ['NETWORK', 'TIMEOUT', 'SERVICE_UNAVAILABLE', 'RESOURCE_EXHAUSTED', 'DEADLINE_EXCEEDED', 'UNAVAILABLE'];
    if (error.code && retryableCodes.some(c => error.code.includes(c))) return true;
    if (error.message && retryableCodes.some(c => error.message.includes(c))) return true;
    return false;
  }

  async execute(fn) {
    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (!this.isRetryable(error)) throw error;
        if (attempt < this.maxRetries - 1) {
          const delay = this.initialDelayMs * Math.pow(2, attempt) + Math.random() * 50;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
}

module.exports = { RetryWrapper };
