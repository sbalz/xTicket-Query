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
}

export default function DataGrid({settings, ticket}: DataGridProps) {
    const [groupedRows, setGroupedRows] = useState<IGroupedRows[]>([]);
    const [mergesMap, setMergesMap] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const customFields = ticket.custom_fields ?? [];

        const dataField = customFields.find(
            (cf) => cf.id === settings.legacyTicketDataFieldId,
        );
        const mergesField = customFields.find(
            (cf) => cf.id === settings.legacyTicketMergesFieldId,
        );

        const dataObj = parseFieldValue(dataField?.value ?? {});
        const mergesObj = parseFieldValue(mergesField?.value ?? {});

        setGroupedRows(
            buildGroupedRows(
                dataObj,
                settings.displayLegacyDataFieldIds,
                mergesObj,
                settings.displayLegacyMergesFieldIds,
            ),
        );

        setMergesMap(buildMergeMap(ticket.id, dataObj, mergesObj));

        if (containerRef.current) {
            resizeApp(containerRef.current);
            registerComponent(containerRef.current);
        }
    }, [settings, ticket]);

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
