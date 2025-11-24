import React from 'react';
import styled from 'styled-components';
import {Table as GardenTable} from '@zendeskgarden/react-tables';
import type {ITableRow} from '../declarations';

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
    data: ITableRow[];
    merges?: Record<string, string>;
    extIdSource?: string;
}

const Table: React.FC<TableProps> = ({data, merges = {}, extIdSource}) => {
    const getTicketLink = (externalId?: string) => {
        if (!extIdSource || !externalId) return '#';
        return extIdSource.replace(
            '{{external_id}}',
            merges[externalId] || externalId,
        );
    };

    return (
        <TableContainer>
            <GardenTable size='small'>
                <GardenTable.Body>
                    {data.length === 0 ? (
                        <GardenTable.Row>
                            <TitleCell>No data</TitleCell>
                            <ValueCell>-</ValueCell>
                        </GardenTable.Row>
                    ) : (
                        data.map((row) => (
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
                        ))
                    )}
                </GardenTable.Body>
            </GardenTable>
        </TableContainer>
    );
};

export default Table;
