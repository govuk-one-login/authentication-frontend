export function addUser(
    emailAddress: string,
    password: string): boolean {
    return false;
}

export function useEmailExists(emailAddress: string): boolean {
    return emailAddress === 'test@test.com' ? true : false;
}