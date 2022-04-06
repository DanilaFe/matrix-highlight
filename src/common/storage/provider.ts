export interface StorageProvider {
    fetchStorage(keys: string[]): Promise<Record<string, any>>;
    setStorage(keys: Record<string, any>): Promise<void>;
}
