export interface ICommandField {
    getId(): string;
    getPluginId(): string;
    getValue(): string;
    setValue(value: string): void;
}