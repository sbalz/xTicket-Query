let appTitle = ''; // store the current application title

// Set the application title for log messages
export function setAppTitle(title: string) {
    appTitle = title;
}

// Log a message prefixed with the application title
export function logMessage(msg: string) {
    console.log(`[${appTitle}] ${msg}`);
}
