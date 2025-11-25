import React, {useCallback} from 'react';
import styled from 'styled-components';
import {Table as GardenTable} from '@zendeskgarden/react-tables';
import type {IGroupedRows, ITableProps} from '../declarations';

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
    color: ${({clickable}) => (clickable ? '#1f73b7' : 'inherit')};
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
    gap: 4px;

    a {
        color: #1f73b7;
        text-decoration: none;
        word-break: break-all;

        &:hover {
            text-decoration: underline;
        }
    }
`;

const Table: React.FC<ITableProps> = ({
    groupedData,
    merges = {},
    externalIdMap = {},
    extIdSource,
}) => {
    const getTicketLink = useCallback(
        (ticketId?: string | number) =>
            extIdSource && ticketId
                ? extIdSource.replace('{{ticket_id}}', String(ticketId))
                : '#',
        [extIdSource],
    );

    /**
     * Render merged ticket links
     * Parse comma-separated ticket IDs and resolve them to current IDs
     */
    const renderMergeLinks = useCallback(
        (value: any): JSX.Element => {
            if (!value) return <>-</>;

            const ticketIds = String(value)
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean);

            if (ticketIds.length === 0) return <>-</>;

            return (
                <MergeLinksContainer>
                    {ticketIds.map((extId, idx) => {
                        const currentId =
                            externalIdMap[extId] ||
                            externalIdMap[String(extId)];
                        const displayId = currentId || extId;
                        const href = getTicketLink(displayId);

                        return (
                            <a
                                key={`${extId}-${idx}`}
                                href={href}
                                target='_blank'
                                rel='noopener noreferrer'
                                title={`Ticket #${displayId}${
                                    currentId
                                        ? ' (resolved from #' + extId + ')'
                                        : ''
                                }`}
                            >
                                #{displayId}
                            </a>
                        );
                    })}
                </MergeLinksContainer>
            );
        },
        [externalIdMap, getTicketLink],
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
                                const isMergeIdField = [
                                    '0.via.source.from.ticket_id',
                                    '0.via.source.from.ticket_ids',
                                ].includes(row.key);

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
                                            ) : isMergeField && extIdSource ? (
                                                <a
                                                    href={getTicketLink(
                                                        merges[row.key],
                                                    )}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
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
