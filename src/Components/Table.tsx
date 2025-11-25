import React, {useCallback} from 'react';
import styled from 'styled-components';
import {Table as GardenTable} from '@zendeskgarden/react-tables';
import type {IGroupedRows, ITableProps} from '../declarations';
import client from '../Utils/ZAFClient';

const TableContainer = styled.div`
    width: 100%;
    overflow-x: hidden;
`;

const GroupRowCell = styled(GardenTable.Cell)`
    font-size: 14px;
    font-weight: 600;
`;

const TitleCell = styled(GardenTable.Cell)`
    width: 40%;
    font-size: 13px;
    font-weight: 500;
`;

const ValueCell = styled(GardenTable.Cell)<{clickable?: boolean}>`
    width: 60%;
    font-size: 13px;
    cursor: ${({clickable}) => (clickable ? 'pointer' : 'default')};

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
        text-decoration: ${({clickable}) => (clickable ? 'underline' : 'none')};
    }
`;

const MergeLinksContainer = styled.span`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    a {
        color: #1f73b7;
        text-decoration: none;
        word-break: break-all;
        font-weight: 500;

        &:hover {
            text-decoration: underline;
        }
    }
`;

const Table: React.FC<ITableProps> = ({
    groupedData,
    merges = {},
    externalIdMap = {},
}) => {
    /**
     * Render merged ticket links
     * Parse comma-separated ticket IDs and resolve them to current IDs
     * Uses routeTo to navigate to tickets in the agent interface
     */
    const renderMergeLinks = useCallback(
        (value: any): JSX.Element => {
            if (!value) return <>-</>;

            const ticketIds = String(value)
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean);

            if (ticketIds.length === 0) return <>-</>;

            const handleTicketClick = (extId: string) => {
                const currentId =
                    externalIdMap[extId] || externalIdMap[String(extId)];
                if (currentId) {
                    client?.invoke('routeTo', 'ticket', currentId);
                }
            };

            return (
                <MergeLinksContainer>
                    {ticketIds.map((extId, idx) => {
                        const currentId =
                            externalIdMap[extId] ||
                            externalIdMap[String(extId)];
                        const displayId = currentId || extId;
                        const isResolved = !!currentId;

                        return (
                            <a
                                key={`${extId}-${idx}`}
                                href='#'
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (isResolved) {
                                        handleTicketClick(extId);
                                    }
                                }}
                                style={{
                                    cursor: isResolved ? 'pointer' : 'default',
                                    opacity: isResolved ? 1 : 0.6,
                                }}
                                title={`Ticket #${displayId}${
                                    currentId
                                        ? ` (merged from #${extId})`
                                        : ' (not yet resolved)'
                                }`}
                            >
                                #{displayId}
                            </a>
                        );
                    })}
                </MergeLinksContainer>
            );
        },
        [externalIdMap],
    );

    if (!groupedData.length) {
        return (
            <TableContainer>
                <GardenTable size='small'>
                    <GardenTable.Body>
                        <GardenTable.Row>
                            <TitleCell>No data</TitleCell>
                            <ValueCell>-</ValueCell>
                        </GardenTable.Row>
                    </GardenTable.Body>
                </GardenTable>
            </TableContainer>
        );
    }

    return (
        <TableContainer>
            <GardenTable size='small'>
                <GardenTable.Body>
                    {groupedData.map((group) => (
                        <React.Fragment key={group.group}>
                            <GardenTable.GroupRow>
                                <GroupRowCell colSpan={2}>
                                    {group.group}
                                </GroupRowCell>
                            </GardenTable.GroupRow>
                            {group.rows.map((row) => {
                                const isMergeField = row.key in merges;
                                // Check if this is a merge ticket ID field that needs link resolution
                                const isMergeIdField =
                                    row.key === '0.via.source.from.ticket_id' ||
                                    row.key === '0.via.source.from.ticket_ids';

                                return (
                                    <GardenTable.Row key={row.key}>
                                        <TitleCell>{row.title}</TitleCell>
                                        <ValueCell
                                            clickable={
                                                isMergeField || isMergeIdField
                                            }
                                        >
                                            {isMergeIdField ? (
                                                renderMergeLinks(row.value)
                                            ) : isMergeField ? (
                                                <a
                                                    href='#'
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const ticketId =
                                                            merges[row.key];
                                                        if (ticketId) {
                                                            client?.invoke(
                                                                'routeTo',
                                                                'ticket',
                                                                ticketId,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {row.value ?? '-'}
                                                </a>
                                            ) : row.value === null ||
                                              row.value === undefined ||
                                              row.value === '' ? (
                                                '-'
                                            ) : typeof row.value ===
                                              'object' ? (
                                                JSON.stringify(row.value)
                                            ) : (
                                                row.value
                                            )}
                                        </ValueCell>
                                    </GardenTable.Row>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </GardenTable.Body>
            </GardenTable>
        </TableContainer>
    );
};

export default Table;
