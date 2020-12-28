class UsernameFilter {

    register(): string {
        return "username";
    }

    getReplaceString(event: any): string {
        return 'barrex';
    }
}

module.exports = UsernameFilter;