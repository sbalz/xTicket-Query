import {parseFieldValue} from '../Elements/DataRows';
import type {AppSettings, ITicket} from '../declarations';

export const getLegacyMergeData = (
    ticket: ITicket,
    settings: AppSettings,
): Record<string, any> => {
    const legacyMergeFieldId = Number(settings.legacyTicketMergesFieldId);

    const field = ticket.custom_fields?.find(
        (cf) => Number(cf.id) === legacyMergeFieldId,
    );
    if (!field) return {};

    const parsed = parseFieldValue(field.value);

    // Merge top-level custom_fields safely
    const cfMap: Record<string, any> = {};
    (ticket.custom_fields ?? []).forEach((cf) => {
        cfMap[String(cf.id)] = cf.value;
    });

    const result = {...parsed, ...cfMap};
    console.log('Parsed Merge Data:', result);
    return result;
};
