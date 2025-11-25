import React, {useEffect, useState, useRef} from 'react';
import Table from '../Components/Table';
import {resizeApp, registerComponent} from '../Utils/ResizeApp';
import {buildMergeMap, buildGroupedRows} from '../Elements/DataRows';
import type {
    AppSettings,
    ITicket,
    IDataGridProps,
    IGroupedRows,
} from '../declarations';

export default function DataGrid({
    settings,
    ticket,
    ticketFieldLabels,
    legacyData,
    mergeData,
}: IDataGridProps) {
    const [groupedRows, setGroupedRows] = useState<IGroupedRows[]>([]);
    const [mergesMap, setMergesMap] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const processTicketData = () => {
            setGroupedRows(
                buildGroupedRows(
                    ticket,
                    settings.displayLegacyDataFieldIds,
                    legacyData,
                    mergeData,
                    settings.displayLegacyMergesFieldIds,
                    ticketFieldLabels,
                    settings.displayCurrentDataFieldIds,
                ),
            );
            setMergesMap(buildMergeMap(ticket.id, legacyData, mergeData));

            if (containerRef.current) {
                resizeApp(containerRef.current);
                registerComponent(containerRef.current);
            }
        };

        processTicketData();
    }, [settings, ticket, ticketFieldLabels, legacyData, mergeData]);

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
