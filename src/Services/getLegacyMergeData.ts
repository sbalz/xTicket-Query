import {parseFieldValue} from '../Elements/DataRows';
import type {AppSettings, ITicket} from '../declarations';

const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    if (obj == null) return {};
    if (typeof obj !== 'object') return {[prefix]: obj};

    return Object.keys(obj).reduce(
        (acc, key) => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (Array.isArray(value)) {
                acc[newKey] = value
                    .map((v) => (typeof v === 'object' ? JSON.stringify(v) : v))
                    .join(', ');
            } else if (typeof value === 'object' && value !== null) {
                Object.assign(acc, flattenObject(value, newKey));
            } else {
                acc[newKey] = value;
            }

            return acc;
        },
        {} as Record<string, any>,
    );
};

export const getLegacyMergeData = (
    ticket: ITicket,
    settings: AppSettings,
): Record<string, any> => {
    const field = ticket.custom_fields?.find(
        (cf) => cf.id === settings.legacyTicketMergesFieldId,
    );
    if (!field) return {};

    const parsed = parseFieldValue(field.value);

    return flattenObject(parsed);
};
