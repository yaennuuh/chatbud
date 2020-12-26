export class FluffyPointSystem {
    register(eventTypes) {
        return [eventTypes.CUSTOM];
    }

    execute(event) {
        console.log(event.data);
    }
}