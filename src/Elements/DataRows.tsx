import type {
    ITicket,
    ICustomField,
    ITableRow,
    IGroupedRows,
} from '../declarations';
import {LEGACY_FIELD_LABELS} from '../Utils/xTicketLabels';
import {LEGACY_MERGE_FIELD_LABELS} from '../Utils/xMergeLabels';

export const mapTicketToPayload = (
    ticket: Partial<ITicket> & {custom_fields?: ICustomField[]},
    fieldIds: Array<number | string>,
): ITicket => {
    return {
        id: ticket.id ?? 0,
        subject: ticket.subject ?? '',
        created_at: ticket.created_at ?? '',
        updated_at: ticket.updated_at ?? '',
        custom_fields: (ticket.custom_fields ?? []).map((cf) => ({
            id: Number(cf.id),
            value: cf.value,
        })),
    };
};

export const parseFieldValue = (value: unknown): Record<string, any> => {
    if (value == null) return {};
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object'
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
    labels: Record<string, string>,
): ITableRow[] =>
    fieldIds.map((field) => {
        const rawValue = obj?.[field] ?? obj?.[String(field)] ?? '-';
        let value: string;
        if (rawValue == null) value = '-';
        else if (typeof rawValue === 'object') {
            value = Array.isArray(rawValue)
                ? rawValue
                      .map((v) =>
                          typeof v === 'object' ? JSON.stringify(v) : String(v),
                      )
                      .join(', ')
                : JSON.stringify(rawValue);
        } else value = String(rawValue);

        return {
            key: String(field),
            title: labels[field] ?? LEGACY_FIELD_LABELS[field] ?? String(field),
            value,
        };
    });

export const buildCurrentTicketRows = (
    ticket: ITicket,
    displayFieldIds: Array<string | number>,
    ticketFieldLabels: Record<string, string>,
): ITableRow[] => {
    const flatTicket: Record<string, any> = {
        id: ticket.id,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        subject: ticket.subject,
    };

    // Add custom fields to flat structure
    ticket.custom_fields?.forEach((cf) => {
        flatTicket[cf.id] = cf.value;
        flatTicket[String(cf.id)] = cf.value;
    });

    // If displayFieldIds is empty, show all fields
    const fieldsToDisplay =
        displayFieldIds.length > 0 ? displayFieldIds : Object.keys(flatTicket);

    return buildTableRows(flatTicket, fieldsToDisplay, ticketFieldLabels);
};

export const buildGroupedRows = (
    currentTicket: ITicket,
    legacyFieldIds: Array<string | number>,
    legacyDataObj: Record<string, any>,
    mergeDataObj: Record<string, any>,
    mergeFieldIds: Array<string | number>,
    ticketFieldLabels: Record<string, string>,
    displayCurrentFieldIds: Array<string | number> = [],
): IGroupedRows[] => [
    {
        group: 'Current Ticket Data',
        rows: buildCurrentTicketRows(
            currentTicket,
            displayCurrentFieldIds,
            ticketFieldLabels,
        ),
    },
    {
        group: 'Legacy Ticket Data',
        rows: buildTableRows(
            legacyDataObj,
            legacyFieldIds.length ? legacyFieldIds : Object.keys(legacyDataObj),
            LEGACY_FIELD_LABELS,
        ),
    },
    {
        group: 'Merge Data',
        rows: buildTableRows(
            mergeDataObj,
            mergeFieldIds.length ? mergeFieldIds : Object.keys(mergeDataObj),
            LEGACY_MERGE_FIELD_LABELS,
        ),
    },
];
