import {parseFieldValue} from '../Elements/DataRows';
import type {AppSettings, ITicket} from '../declarations';

export const getLegacyMergeData = (
    ticket: ITicket,
    settings: AppSettings,
): Record<string, any> => {
    const legacyMergeFieldId = Number(settings.legacyTicketMergesFieldId);

    if (!ticket.custom_fields?.length) {
        console.warn('Ticket has no custom fields.');
        return {};
    }

    const field = ticket.custom_fields.find(
        (cf) => Number(cf.id) === legacyMergeFieldId,
    );

    if (!field) {
        console.warn(
            `Legacy Merge field not found (ID: ${legacyMergeFieldId})`,
        );
        return {};
    }

    const parsed = parseFieldValue(field.value);
    console.log('Parsed Merge Data:', parsed);
    return parsed;
};
