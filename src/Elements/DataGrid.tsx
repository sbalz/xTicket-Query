import React, {useEffect, useState, useRef} from 'react';
import Table from '../Components/Table';
import {resizeApp} from '../Utils/ResizeApp';
import type {AppSettings, ITableRow, ITicket} from '../declarations';

/**
 * Parse a custom-field value (string JSON or object) into a plain object.
 * Returns {} for anything missing / unparsable.
 */
const parseFieldValue = (v: unknown): any => {
    if (v === undefined || v === null) return {};
    if (typeof v === 'string') {
        try {
            return JSON.parse(v);
        } catch {
            // not JSON, return the raw string as-is inside an object to keep table stable
            return v;
        }
    }
    if (typeof v === 'object') return v;
    return v;
};

interface DataGridProps {
    settings: AppSettings;
    ticket: ITicket;
}

export default function DataGrid({settings, ticket}: DataGridProps) {
    const [rows, setRows] = useState<ITableRow[]>([]);
    const [merges, setMerges] = useState<Record<string, string>>({});
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // safe access: custom_fields might be undefined
        const customFields = ticket.custom_fields ?? [];

        const dataCf = customFields.find(
            (cf) => Number(cf.id) === Number(settings.legacyTicketDataFieldId),
        );
        const mergesCf = customFields.find(
            (cf) =>
                Number(cf.id) === Number(settings.legacyTicketMergesFieldId),
        );

        const dataObj = parseFieldValue(dataCf?.value);
        const mergesObj = parseFieldValue(mergesCf?.value);

        const tableRows: ITableRow[] = [];

        // Display legacy data fields in the order from settings
        for (const f of settings.displayLegacyDataFieldIds) {
            const key = String(f);
            let rawValue = (dataObj && (dataObj as any)[f]) ?? '';
            if (typeof rawValue === 'object' && rawValue !== null) {
                try {
                    rawValue = JSON.stringify(rawValue);
                } catch {
                    rawValue = String(rawValue);
                }
            }
            tableRows.push({key, title: key, value: rawValue ?? ''});
        }

        // Display merges (ticket_id, ticket_ids)
        for (const f of settings.displayLegacyMergesFieldIds) {
            const key = String(f);
            let rawValue = (mergesObj && (mergesObj as any)[f]) ?? '';
            if (typeof rawValue === 'object' && rawValue !== null) {
                try {
                    rawValue = JSON.stringify(rawValue);
                } catch {
                    rawValue = String(rawValue);
                }
            }
            tableRows.push({key, title: key, value: rawValue ?? ''});
        }

        // Build merge map for deeplinks
        const mergeMap: Record<string, string> = {};
        // common shapes:
        // mergesObj.ticket_id (single) or mergesObj.ticket_ids (array)
        if (mergesObj && (mergesObj as any).ticket_id) {
            mergeMap[String((mergesObj as any).ticket_id)] = String(ticket.id);
        }
        if (mergesObj && Array.isArray((mergesObj as any).ticket_ids)) {
            for (const oldId of (mergesObj as any).ticket_ids) {
                mergeMap[String(oldId)] = String(ticket.id);
            }
        }

        // if the legacy data object itself contains an 'id' field (old external id) add a row mapping as well
        // we already included 'id' if it's in displayLegacyDataFieldIds — keep merge map consistent
        if ((dataObj as any)?.id) {
            mergeMap[String((dataObj as any).id)] = String(ticket.id);
        }

        setRows(tableRows);
        setMerges(mergeMap);

        // request a resize (works in the Zendesk iframe)
        resizeApp(rootRef.current ?? undefined);
    }, [settings, ticket]);

    return (
        <div
            ref={rootRef}
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 8,
            }}
        >
            <Table
                data={rows}
                merges={merges}
                extIdSource={`/agent/tickets/{{external_id}}`}
            />
        </div>
    );
}
