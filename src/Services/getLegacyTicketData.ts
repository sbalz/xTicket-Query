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
                // Convert array of objects to joined string
                acc[newKey] = value
                    .map((v) => (typeof v === 'object' ? JSON.stringify(v) : v))
                    .join(', ');
            } else if (typeof value === 'object') {
                Object.assign(acc, flattenObject(value, newKey));
            } else {
                acc[newKey] = value;
            }

            return acc;
        },
        {} as Record<string, any>,
    );
};

export const getLegacyTicketData = (
    ticket: ITicket,
    settings: AppSettings,
): Record<string, any> => {
    const field = ticket.custom_fields?.find(
        (cf) => cf.id === settings.legacyTicketDataFieldId,
    );
    if (!field) return {};

    const parsed = parseFieldValue(field.value);

    /**
     * 🔥 IMPORTANT FIX:
     * Legacy payload contains:
     *   fields: [ { id: 8800117621905, value: "stellenanzeigen" }, ... ]
     *
     * Zendesk-style flattening expects:
     *   { 8800117621905: "stellenanzeigen", ... }
     *
     * Without this conversion, your UI CANNOT show any custom field values.
     */
    const convertIdValueArray = (arr: any[]) => {
        arr.forEach((f: any) => {
            if (f && f.id != null) {
                parsed[f.id] = f.value ?? '-';
            }
        });
    };

    if (Array.isArray(parsed.fields)) {
        convertIdValueArray(parsed.fields);
    }

    // Also parse custom_fields if legacy payload contains them as string
    if (parsed.custom_fields && typeof parsed.custom_fields === 'string') {
        try {
            parsed.custom_fields = JSON.parse(`[${parsed.custom_fields}]`);
        } catch {
            // fallback: leave as string
        }
    }

    if (Array.isArray(parsed.custom_fields)) {
        convertIdValueArray(parsed.custom_fields);
    }

    return flattenObject(parsed);
};
