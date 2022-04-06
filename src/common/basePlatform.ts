export abstract class BasePlatform {
    abstract fetchStorage(keys: string[]): Promise<Record<string, any>>;
    abstract setStorage(keys: Record<string, any>): Promise<void>;
}
