class CurrentDateFilter {

    register(): string {
        return "currentdate";
    }

    getReplaceString(event: any): string {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        var todayString = mm + '/' + dd + '/' + yyyy;
        return todayString;
    }
}

module.exports = CurrentDateFilter;