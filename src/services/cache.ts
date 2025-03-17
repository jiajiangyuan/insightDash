import dayjs from 'dayjs';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export class CacheService {
  private cache: Map<string, CacheItem<any>>;
  private static instance: CacheService;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 缓存数据
   * @param expiresIn 过期时间（毫秒）
   */
  public set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };
    this.cache.set(key, cacheItem);
  }

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据，如果过期或不存在则返回null
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 生成带时间范围的缓存键
   * @param baseKey 基础键名
   * @param timeRange 时间范围
   * @returns 缓存键
   */
  public static generateTimeRangeKey(baseKey: string, timeRange: [dayjs.Dayjs, dayjs.Dayjs]): string {
    return `${baseKey}_${timeRange[0].format('YYYY-MM-DD')}_${timeRange[1].format('YYYY-MM-DD')}`;
  }

  /**
   * 清除指定键的缓存
   * @param key 缓存键
   */
  public clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  public clearAll(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存项的剩余有效时间（毫秒）
   * @param key 缓存键
   * @returns 剩余有效时间，如果缓存不存在则返回0
   */
  public getTimeToLive(key: string): number {
    const item = this.cache.get(key);
    if (!item) return 0;

    const now = Date.now();
    const elapsed = now - item.timestamp;
    return Math.max(0, item.expiresIn - elapsed);
  }
}

export const cacheInstance = CacheService.getInstance(); 