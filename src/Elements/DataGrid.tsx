import React, {useEffect, useState, useRef} from 'react';
import Table from '../Components/Table';
import {resizeApp, registerComponent} from '../Utils/ResizeApp';
import {
    parseFieldValue,
    buildMergeMap,
    buildGroupedRows,
} from '../Elements/DataRows';
import type {AppSettings, ITicket, IGroupedRows} from '../declarations';

interface DataGridProps {
    settings: AppSettings;
    ticket: ITicket;
    ticketFieldLabels: Record<string, string>;
}

export default function DataGrid({
    settings,
    ticket,
    ticketFieldLabels,
}: DataGridProps) {
    const [groupedRows, setGroupedRows] = useState<IGroupedRows[]>([]);
    const [mergesMap, setMergesMap] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const processTicketData = () => {
            const dataField = ticket.custom_fields?.find(
                (cf) => cf.id === settings.legacyTicketDataFieldId,
            );
            const mergesField = ticket.custom_fields?.find(
                (cf) => cf.id === settings.legacyTicketMergesFieldId,
            );

            const dataObj = parseFieldValue(dataField?.value);
            const mergesObj = parseFieldValue(mergesField?.value);

            setGroupedRows(
                buildGroupedRows(
                    ticket, // current ticket
                    settings.displayLegacyDataFieldIds,
                    dataObj, // legacy ticket data
                    mergesObj, // merge data
                    settings.displayLegacyMergesFieldIds,
                    ticketFieldLabels,
                ),
            );
            setMergesMap(buildMergeMap(ticket.id, dataObj, mergesObj));

            if (containerRef.current) {
                resizeApp(containerRef.current);
                registerComponent(containerRef.current);
            }
        };

        processTicketData();
    }, [settings, ticket, ticketFieldLabels]);

    return (
        <div
            ref={containerRef}
            style={{height: '100%', padding: 8, overflow: 'auto'}}
        >
            <Table
                groupedData={groupedRows}
                merges={mergesMap}
                extIdSource={`/agent/tickets/{{external_id}}`}
            />
        </div>
    );
}
