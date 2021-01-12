export interface ICommandCooldown {
    getCommand(): string;
    getEntityName(): string;
    getEntityValue(): string;
    getEndDate(): Date;
    setEndDate(seconds: number): void;
    isActive(): boolean;
    getCooldownTime(): number;
}