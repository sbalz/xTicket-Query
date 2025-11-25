import client from '../Utils/ZAFClient';
import {mapTicketToPayload} from '../Elements/DataRows';
import type {ITicket} from '../declarations';

export const getCurrentTicket = async (
    allFieldIds: Array<number | string>,
): Promise<ITicket | null> => {
    try {
        const context = await client?.context();
        const ticketId = context?.ticketId;
        if (!ticketId) {
            console.warn('No ticket in context.');
            return null;
        }

        const response = await client?.request({
            url: `/api/v2/tickets/${ticketId}.json`,
            type: 'GET',
            dataType: 'json',
        });

        const ticket = response.ticket;
        if (!ticket) return null;

        return mapTicketToPayload(ticket, allFieldIds);
    } catch (err) {
        console.error('Error fetching current ticket:', err);
        return null;
    }
};
