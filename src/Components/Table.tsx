import React from 'react';
import styled from 'styled-components';
import {Table as GardenTable} from '@zendeskgarden/react-tables';
import type {ITableRow} from '../declarations';

const StyledContainer = styled.div`
    overflow: auto;
    flex: 1 1 auto;
`;

const TitleCell = styled(GardenTable.Cell)`
    width: 40%;
    font-weight: 600;
    font-size: 13px;
`;

const ValueCell = styled(GardenTable.Cell)<{clickable?: boolean}>`
    width: 60%;
    font-size: 13px;
    cursor: ${(p) => (p.clickable ? 'pointer' : 'default')};
    color: ${(p) => (p.clickable ? '#1f73b7' : 'inherit')};
    &:hover {
        text-decoration: ${(p) => (p.clickable ? 'underline' : 'none')};
    }
`;

interface TableProps {
    data: ITableRow[];
    merges?: Record<string, string>;
    extIdSource?: string; // e.g. `/agent/tickets/{{external_id}}` or `/tickets/{{external_id}}`
}

const Table: React.FC<TableProps> = ({data, merges = {}, extIdSource}) => {
    const getLink = (externalId?: string) => {
        if (!extIdSource) return '#';
        const newId = externalId ? merges?.[externalId] || externalId : '';
        return extIdSource.replace('{{external_id}}', String(newId));
    };

    return (
        <StyledContainer>
            <GardenTable size='small'>
                <GardenTable.Body>
                    {data.length === 0 ? (
                        <GardenTable.Row>
                            <TitleCell>No data</TitleCell>
                            <ValueCell>-</ValueCell>
                        </GardenTable.Row>
                    ) : (
                        data.map((row) => {
                            // detect legacy external id row (common key 'id' or 'ticket_id')
                            const isExternalIdKey = [
                                'id',
                                'ticket_id',
                                'external_id',
                            ].includes(row.key);

                            const renderValue = () => {
                                // prefer to render as link when extIdSource present and we have a numeric/string id
                                if (
                                    extIdSource &&
                                    isExternalIdKey &&
                                    row.value !== '' &&
                                    row.value !== null &&
                                    row.value !== undefined
                                ) {
                                    return (
                                        <a
                                            href={getLink(String(row.value))}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                        >
                                            {String(row.value)}
                                        </a>
                                    );
                                }
                                // otherwise render raw value
                                return typeof row.value === 'string' ||
                                    typeof row.value === 'number'
                                    ? row.value
                                    : JSON.stringify(row.value);
                            };

                            return (
                                <GardenTable.Row key={row.key}>
                                    <TitleCell>{row.title}</TitleCell>
                                    <ValueCell
                                        clickable={
                                            !!extIdSource && isExternalIdKey
                                        }
                                    >
                                        {renderValue()}
                                    </ValueCell>
                                </GardenTable.Row>
                            );
                        })
                    )}
                </GardenTable.Body>
            </GardenTable>
        </StyledContainer>
    );
};

export default Table;
