export interface IConnectorHelper {
    getOwnConnectorApi(): any;
    getOwnName(): string;
    loadData(): any;
    saveData(data: any): void;
}