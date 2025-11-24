import {Client} from '../declarations';

// Extend the global window interface to include ZAFClient
declare global {
    interface Window {
        ZAFClient?: {
            init: () => Client; // initialization function for the Zendesk app client
        };
    }
}

let client: Client | null = null;

try {
    if (window?.ZAFClient) {
        // Initialize the Zendesk app client if available
        client = window.ZAFClient.init() || null;
    }
} catch (err) {
    // Log any initialization errors
    console.error('ZAFClient init failed', err);
    client = null;
}

// Export the initialized client or null if unavailable
export default client;
