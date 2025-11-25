import {parseFieldValue} from '../Elements/DataRows';
import type {AppSettings, ITicket} from '../declarations';

export const getLegacyTicketData = (
    ticket: ITicket,
    settings: AppSettings,
): Record<string, any> => {
    const legacyDataFieldId = Number(settings.legacyTicketDataFieldId);

    const field = ticket.custom_fields?.find(
        (cf) => Number(cf.id) === legacyDataFieldId,
    );
    if (!field) return {};

    const parsed = parseFieldValue(field.value);

    // Merge top-level custom_fields safely
    const cfMap: Record<string, any> = {};
    (ticket.custom_fields ?? []).forEach((cf) => {
        cfMap[String(cf.id)] = cf.value;
    });

    const result = {...parsed, ...cfMap};
    console.log('Parsed Legacy Data:', result);
    return result;
};
