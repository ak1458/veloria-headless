export class RateLimiter {
  private cache = new Map<string, { count: number; resetAt: number }>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(ip: string): { success: boolean; remaining: number } {
    const now = Date.now();
    const record = this.cache.get(ip);

    if (!record || now > record.resetAt) {
      this.cache.set(ip, { count: 1, resetAt: now + this.windowMs });
      return { success: true, remaining: this.maxRequests - 1 };
    }

    if (record.count >= this.maxRequests) {
      return { success: false, remaining: 0 };
    }

    record.count += 1;
    this.cache.set(ip, record);
    return { success: true, remaining: this.maxRequests - record.count };
  }
  
  // Useful for Lucky Draw strict enforcement
  public hasRecord(ip: string): boolean {
    const record = this.cache.get(ip);
    if (!record) return false;
    if (Date.now() > record.resetAt) {
      this.cache.delete(ip);
      return false;
    }
    return true;
  }
}
