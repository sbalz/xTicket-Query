import type {ITicket, ICustomField, ITableRow} from '../declarations';
import {LEGACY_FIELD_LABELS} from '../Utils/xTicketLabels';

export const mapTicketToPayload = (
    ticket: any,
    fieldIds: Array<number | string>,
): ITicket => ({
    id: ticket.id,
    subject: ticket.subject ?? '',
    custom_fields: (ticket.custom_fields ?? [])
        .filter(
            (cf: any) =>
                fieldIds.includes(cf.id) || fieldIds.includes(String(cf.id)),
        )
        .map((cf: any) => ({
            id: Number(cf.id),
            value: cf.value,
        })) as ICustomField[],
});

export const parseFieldValue = (value: unknown): Record<string, any> => {
    if (value == null) return {};
    if (typeof value === 'string') {
        try {
            return JSON.parse(value) ?? {};
        } catch {
            return {unknown: value};
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
): ITableRow[] => {
    return fieldIds.map((field) => ({
        key: String(field),
        title: LEGACY_FIELD_LABELS[field] ?? String(field),
        value: obj?.[field] ?? obj?.[String(field)] ?? '-',
    }));
};
