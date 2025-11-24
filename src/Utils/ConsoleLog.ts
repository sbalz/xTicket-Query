let appTitle = '';

export function setAppTitle(title: string) {
    appTitle = title;
}
export function logMessage(msg: string) {
    console.log(`[${appTitle}] ${msg}`);
}
