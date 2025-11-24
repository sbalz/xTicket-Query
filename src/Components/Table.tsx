import React, {useCallback} from 'react';
import styled from 'styled-components';
import {Table as GardenTable} from '@zendeskgarden/react-tables';
import type {IGroupedRows} from '../declarations';

const TableContainer = styled.div`
    width: 100%;
    overflow-x: auto;
    margin-bottom: 8px;
`;

const TitleCell = styled(GardenTable.Cell)`
    width: 40%;
    font-weight: 600;
    font-size: 13px;
`;

const ValueCell = styled(GardenTable.Cell)<{clickable?: boolean}>`
    width: 60%;
    font-size: 13px;
    cursor: ${({clickable}) => (clickable ? 'pointer' : 'default')};
    color: ${({clickable}) => (clickable ? '#1f73b7' : 'inherit')};
    &:hover {
        text-decoration: ${({clickable}) => (clickable ? 'underline' : 'none')};
    }
`;

interface TableProps {
    groupedData: IGroupedRows[];
    merges?: Record<string, string>;
    extIdSource?: string;
}

const Table: React.FC<TableProps> = ({
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
                                <GardenTable.Cell colSpan={2}>
                                    <b>{group.group}</b>
                                </GardenTable.Cell>
                            </GardenTable.GroupRow>
                            {group.rows.map((row) => (
                                <GardenTable.Row key={row.key}>
                                    <TitleCell>{row.title}</TitleCell>
                                    <ValueCell clickable={row.key in merges}>
                                        {row.key in merges && extIdSource ? (
                                            <a
                                                href={getTicketLink(
                                                    String(row.value),
                                                )}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                            >
                                                {row.value}
                                            </a>
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
