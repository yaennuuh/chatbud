import moment from 'moment';
import { ICommandCooldown } from './ICommandCooldown';
export class CommandCooldown implements ICommandCooldown {
    private command: string;
    private entityName: string;
    private entityValue: string;
    private endDate: Date;

    constructor(command: string, entityName: string, entityValue: string, endDate?: Date) {
        this.command = command;
        this.entityName = entityName;
        this.entityValue = entityValue;
        this.endDate = endDate;
    }

    getCommand(): string {
        return this.command;
    }
    getEntityName(): string {
        return this.entityName;
    }
    getEntityValue(): string {
        return this.entityValue;
    }
    getEndDate(): Date {
        return this.endDate;
    }

    setEndDate(seconds: number): void {
        this.endDate = moment().add(seconds, 'seconds').toDate();
    }

    isActive(): boolean {
        return this.endDate && moment(this.endDate).isAfter(moment());
    }

    getCooldownTime(): number {
        return this.isActive() ? moment(this.endDate).diff(moment(), 'seconds') : 0;
    }

}