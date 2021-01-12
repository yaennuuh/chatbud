export interface ITwitchUser {
    getUserId(): string;
    getUsername(): string;
    getFirstSeen(): Date;
    setFirstSeen(firstSeen: Date): void;
    getLastSeen(): Date;
    setLastSeen(lastSeen: Date): void;
}