import React, {useEffect, useState, useRef} from 'react';
import Table from '../Components/Table';
import {resizeApp, registerComponent} from '../Utils/ResizeApp';
import {
    parseFieldValue,
    buildMergeMap,
    buildTableRows,
} from '../Elements/DataRows';
import type {AppSettings, ITicket, ITableRow} from '../declarations';

interface DataGridProps {
    settings: AppSettings;
    ticket: ITicket;
}

export default function DataGrid({settings, ticket}: DataGridProps) {
    const [dataRows, setDataRows] = useState<ITableRow[]>([]);
    const [mergeRows, setMergeRows] = useState<ITableRow[]>([]);
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

        const dataObj = parseFieldValue(dataField?.value);
        const mergesObj = parseFieldValue(mergesField?.value ?? {});

        const builtDataRows = buildTableRows(
            dataObj,
            settings.displayLegacyDataFieldIds,
        );
        const builtMergeRows = buildTableRows(
            mergesObj,
            settings.displayLegacyMergesFieldIds,
        );
        const map = buildMergeMap(ticket.id, dataObj, mergesObj);

        setDataRows(builtDataRows);
        setMergeRows(builtMergeRows);
        setMergesMap(map);

        // Resize after content is rendered
        requestAnimationFrame(() => {
            if (containerRef.current) {
                resizeApp(containerRef.current);
                registerComponent(containerRef.current);
            }
        });
    }, [settings, ticket]);

    return (
        <div
            ref={containerRef}
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 8,
                overflow: 'auto',
            }}
        >
            <h4>Ticket Data</h4>
            <Table data={dataRows} />

            <hr style={{margin: '12px 0'}} />

            <h4>Merge Data</h4>
            <Table
                data={mergeRows}
                merges={mergesMap}
                extIdSource={`/agent/tickets/{{external_id}}`}
            />
        </div>
    );
}
