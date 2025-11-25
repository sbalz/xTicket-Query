import type {
    ITicket,
    ICustomField,
    ITableRow,
    IGroupedRows,
} from '../declarations';
import {LEGACY_FIELD_LABELS} from '../Mappings/xTicketLabels';
import {LEGACY_MERGE_FIELD_LABELS} from '../Mappings/xMergeLabels';
import {formatDate} from '../Utils/DateFormat';

/**
 * Map ticket into minimal payload structure
 */
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

/**
 * Parse any field value into object
 */
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

/**
 * Build mapping of ticket/merge IDs for links
 */
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

/**
 * Build rows for a table group
 */
export const buildTableRows = (
    obj: Record<string, any>,
    fieldIds: Array<string | number>,
    labels: Record<string, string>,
): ITableRow[] =>
    fieldIds.map((field) => {
        const rawValue = obj?.[field] ?? obj?.[String(field)] ?? '-';
        let value: string;

        if (rawValue == null) {
            value = '-';
        } else if (
            typeof rawValue === 'string' &&
            rawValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
        ) {
            value = formatDate(rawValue); // format date
        } else if (typeof rawValue === 'object') {
            value = Array.isArray(rawValue)
                ? rawValue
                      .map((v) =>
                          typeof v === 'object' ? JSON.stringify(v) : String(v),
                      )
                      .join(', ')
                : JSON.stringify(rawValue);
        } else {
            value = String(rawValue);
        }

        return {
            key: String(field),
            title: labels[field] ?? LEGACY_FIELD_LABELS[field] ?? String(field),
            value,
        };
    });

/**
 * Build rows for the current ticket
 */
export const buildCurrentTicketRows = (
    ticket: ITicket,
    displayFieldIds: Array<string | number>,
    ticketFieldLabels: Record<string, string>,
): ITableRow[] => {
    let satisfactionScore = 'unoffered';
    let satisfactionComment = '';

    if (
        ticket.satisfaction_rating &&
        typeof ticket.satisfaction_rating !== 'string'
    ) {
        satisfactionScore = ticket.satisfaction_rating.score;
        satisfactionComment = ticket.satisfaction_rating.comment ?? '';
    }

    const flatTicket: Record<string, any> = {
        id: ticket.id,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        subject: ticket.subject,
        satisfaction_score: satisfactionScore,
        satisfaction_comment: satisfactionComment,
    };

    // Add custom fields
    ticket.custom_fields?.forEach((cf) => {
        flatTicket[cf.id] = cf.value;
        flatTicket[String(cf.id)] = cf.value;
    });

    const fieldsToDisplay =
        displayFieldIds.length > 0 ? displayFieldIds : Object.keys(flatTicket);

    return buildTableRows(flatTicket, fieldsToDisplay, ticketFieldLabels);
};

/**
 * Build grouped rows for the DataGrid
 */
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
