import React from 'react';
import styled from 'styled-components';
import {Table as GardenTable} from '@zendeskgarden/react-tables';
import type {ITableRow} from '../declarations';
import {LEGACY_FIELD_LABELS} from '../Utils/xTicketLabels';

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
        const resolvedId = merges[externalId] || externalId;
        return extIdSource.replace('{{external_id}}', String(resolvedId));
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
                        data.map((row) => {
                            const isMergeId = row.key in merges;
                            const renderValue = () => {
                                if (
                                    row.value === null ||
                                    row.value === undefined
                                )
                                    return '-';
                                if (isMergeId && extIdSource) {
                                    return (
                                        <a
                                            href={getTicketLink(
                                                String(row.value),
                                            )}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                        >
                                            {String(row.value)}
                                        </a>
                                    );
                                }
                                return typeof row.value === 'object'
                                    ? JSON.stringify(row.value)
                                    : row.value;
                            };

                            return (
                                <GardenTable.Row key={row.key}>
                                    <TitleCell>{row.title}</TitleCell>
                                    <ValueCell clickable={isMergeId}>
                                        {renderValue()}
                                    </ValueCell>
                                </GardenTable.Row>
                            );
                        })
                    )}
                </GardenTable.Body>
            </GardenTable>
        </TableContainer>
    );
};

export default Table;
