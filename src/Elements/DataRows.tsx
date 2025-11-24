import type {ITicket, ICustomField, ITableRow} from '../declarations';
import {LEGACY_FIELD_LABELS} from '../Utils/xTicketLabels';

export const mapTicketToPayload = (
    ticket: Partial<ITicket> & {custom_fields?: ICustomField[]},
    fieldIds: Array<number | string>,
): ITicket => ({
    id: ticket.id!,
    subject: ticket.subject ?? '',
    custom_fields: (ticket.custom_fields ?? [])
        .filter(
            (cf) =>
                fieldIds.includes(cf.id) || fieldIds.includes(String(cf.id)),
        )
        .map((cf) => ({id: Number(cf.id), value: cf.value})),
});

export const parseFieldValue = (value: unknown): Record<string, any> => {
    if (value == null) return {};
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return typeof parsed === 'object' && parsed !== null
                ? parsed
                : {value: parsed};
        } catch {
            return {value};
        }
    }
    if (Array.isArray(value)) return {array: value};
    return typeof value === 'object' ? (value as Record<string, any>) : {value};
};

export const buildMergeMap = (
    ticketId: string | number,
    dataObj: Record<string, any>,
    mergesObj: Record<string, any>,
): Record<string, string> => {
    const map: Record<string, string> = {};
    if (mergesObj?.ticket_id)
        map[String(mergesObj.ticket_id)] = String(ticketId);
    if (Array.isArray(mergesObj?.ticket_ids))
        mergesObj.ticket_ids.forEach(
            (id) => (map[String(id)] = String(ticketId)),
        );
    if (dataObj?.id) map[String(dataObj.id)] = String(ticketId);
    return map;
};

export const buildTableRows = (
    obj: Record<string, any>,
    fieldIds: Array<string | number>,
): ITableRow[] =>
    fieldIds.map((field) => {
        const rawValue = obj?.[field] ?? obj?.[String(field)] ?? '-';
        let value: string;
        if (rawValue === null || rawValue === undefined) value = '-';
        else if (typeof rawValue === 'object')
            value = Array.isArray(rawValue)
                ? rawValue
                      .map((v) =>
                          typeof v === 'object' ? JSON.stringify(v) : String(v),
                      )
                      .join(', ')
                : JSON.stringify(rawValue);
        else value = String(rawValue);
        return {
            key: String(field),
            title: LEGACY_FIELD_LABELS[field] ?? String(field),
            value,
        };
    });
