import React, {useEffect, useState, useRef} from 'react';
import Table from '../Components/Table';
import {resizeApp, registerComponent} from '../Utils/ResizeApp';
import {buildMergeMap, buildGroupedRows} from './DataRows';
import {
    buildExternalIdToCurrentIdMap,
    extractExternalIdsFromMergeData,
} from '../Services/getMergedTicketLinks';
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
    const [externalIdMap, setExternalIdMap] = useState<Record<string, string>>(
        {},
    );
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const processTicketData = async () => {
            setLoading(true);

            // Build the merge map
            const mergeMapping = buildMergeMap(
                ticket.id,
                legacyData,
                mergeData,
            );
            setMergesMap(mergeMapping);

            // Extract external IDs from merge data and build lookup
            const externalIds = extractExternalIdsFromMergeData(mergeData);
            if (externalIds.length > 0) {
                console.log(
                    '🔍 Searching for merged tickets with external IDs:',
                    externalIds,
                );
                const extIdMap =
                    await buildExternalIdToCurrentIdMap(externalIds);
                console.log('✅ External ID to Current ID mapping:', extIdMap);
                setExternalIdMap(extIdMap);
            }

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

            if (containerRef.current) {
                resizeApp(containerRef.current);
                registerComponent(containerRef.current);
            }

            setLoading(false);
        };

        processTicketData();
    }, [settings, ticket, ticketFieldLabels, legacyData, mergeData]);

    return (
        <div ref={containerRef}>
            {loading && (
                <div style={{padding: 12, fontSize: 13}}>
                    Loading merge data…
                </div>
            )}
            <Table
                groupedData={groupedRows}
                merges={mergesMap}
                externalIdMap={externalIdMap}
            />
        </div>
    );
}
