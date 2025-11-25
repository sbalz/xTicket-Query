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

    /* Truncate overflow text with ellipsis */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
        text-decoration: ${({clickable}) => (clickable ? 'underline' : 'none')};
    }
`;

const Table: React.FC<ITableProps> = ({
    groupedData,
    merges = {},
    extIdSource,
}) => {
    const getTicketLink = useCallback(
        (externalId?: string) =>
            extIdSource && externalId
                ? extIdSource.replace(
                      '{{external_id}}',
                      merges[externalId] || externalId,
                  )
                : '#',
        [extIdSource, merges],
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
                            {group.rows.map((row) => (
                                <GardenTable.Row key={row.key}>
                                    <TitleCell>{row.title}</TitleCell>
                                    <ValueCell
                                        clickable={row.key in merges}
                                        title={String(row.value)}
                                    >
                                        {row.key in merges && extIdSource ? (
                                            <a
                                                href={getTicketLink(
                                                    String(row.value),
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
                                        ) : typeof row.value === 'object' ? (
                                            JSON.stringify(row.value)
                                        ) : (
                                            row.value
                                        )}
                                    </ValueCell>
                                </GardenTable.Row>
                            ))}
                        </React.Fragment>
                    ))}
                </GardenTable.Body>
            </GardenTable>
        </TableContainer>
    );
};

export default Table;
