import client from '../Utils/ZAFClient';
import {mapTicketToPayload} from '../Elements/DataRows';
import type {ITicket} from '../declarations';

export const getCurrentTicket = async (
    allFieldIds: Array<number | string>,
): Promise<ITicket | null> => {
    try {
        // Get ticket ID from context
        const context = await client?.context();
        const ticketId = context?.ticketId;
        if (!ticketId) {
            console.warn('No ticket in context.');
            return null;
        }

        // Fetch full ticket from Zendesk API
        const response = await client?.request({
            url: `/api/v2/tickets/${ticketId}.json`,
            type: 'GET',
            dataType: 'json',
        });

        const ticket = response.ticket;
        if (!ticket) {
            console.error('Ticket API returned no ticket.');
            return null;
        }

        // Map ticket to payload with relevant fields
        return mapTicketToPayload(ticket, allFieldIds);
    } catch (err) {
        console.error('Error fetching current ticket:', err);
        return null;
    }
};
