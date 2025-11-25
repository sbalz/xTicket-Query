import {parseFieldValue} from '../Elements/DataRows';
import type {AppSettings, ITicket} from '../declarations';

export const getLegacyTicketData = (
    ticket: ITicket,
    settings: AppSettings,
): Record<string, any> => {
    const legacyDataFieldId = Number(settings.legacyTicketDataFieldId);

    if (!ticket.custom_fields?.length) {
        console.warn('Ticket has no custom fields.');
        return {};
    }

    const field = ticket.custom_fields.find(
        (cf) => Number(cf.id) === legacyDataFieldId,
    );

    if (!field) {
        console.warn(
            `Legacy Ticket Data field not found (ID: ${legacyDataFieldId})`,
        );
        return {};
    }

    const parsed = parseFieldValue(field.value);
    console.log('Parsed Legacy Data:', parsed);
    return parsed;
};
