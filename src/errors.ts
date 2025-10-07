export class AirtableError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorType?: string
  ) {
    super(message);
    this.name = 'AirtableError';
    Object.setPrototypeOf(this, AirtableError.prototype);
  }
}

export class RateLimitError extends AirtableError {
  constructor(message: string) {
    super(message, 429, 'RATE_LIMIT');
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
