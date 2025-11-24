import React, {useEffect, useState} from 'react';
import DataGrid from '../Elements/DataGrid';
import client from '../Utils/ZAFClient';
import {logMessage, setAppTitle} from '../Utils/ConsoleLog';
import {mapTicketToPayload} from '../Elements/DataRows';
import type {AppSettings, ITicket} from '../declarations';

export default function App(): JSX.Element {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [ticketPayload, setTicketPayload] = useState<ITicket | null>(null);

    useEffect(() => {
        const initializeApp = async () => {
            if (!client) return console.error('ZAF client not available');

            try {
                const {
                    settings: metaSettings = {},
                    title: appTitle = 'xTicket Query',
                } = (await client.metadata()) ?? {};
                setAppTitle(appTitle);

                const legacyTicketDataFieldId =
                    metaSettings['Legacy Ticket Data Field ID'];
                const legacyTicketMergesFieldId =
                    metaSettings['Legacy Ticket Merges Field ID'];
                const displayDataFieldIds =
                    metaSettings['Display Legacy Data Field IDs'] ?? [];
                const displayMergeFieldIds =
                    metaSettings['Display Legacy Merges Field IDs'] ?? [];

                const allFieldIds = [
                    legacyTicketDataFieldId,
                    legacyTicketMergesFieldId,
                    ...displayDataFieldIds,
                    ...displayMergeFieldIds,
                ].filter(Boolean);

                const ticketId = (await client.context())?.ticketId;
                if (!ticketId)
                    return logMessage(
                        'No ticket in context. Nothing to display.',
                    );

                const ticketData = (
                    await client.request({
                        url: `/api/v2/tickets/${ticketId}.json`,
                        type: 'GET',
                        dataType: 'json',
                    })
                )?.ticket;
                if (!ticketData)
                    throw new Error('Ticket API returned no ticket');

                setTicketPayload(mapTicketToPayload(ticketData, allFieldIds));

                setSettings({
                    legacyTicketDataFieldId: Number(legacyTicketDataFieldId),
                    legacyTicketMergesFieldId: Number(
                        legacyTicketMergesFieldId,
                    ),
                    displayLegacyDataFieldIds: displayDataFieldIds,
                    displayLegacyMergesFieldIds: displayMergeFieldIds,
                    title: appTitle,
                });

                logMessage('App Initialized');
            } catch (error: any) {
                console.error(
                    '❌ Error initializing app:',
                    error?.message ?? error,
                );
            }
        };

        initializeApp();
    }, []);

    if (!settings || !ticketPayload) {
        return (
            <div style={{padding: 12, fontSize: 13}}>
                Loading Legacy Ticket Data…
            </div>
        );
    }

    return <DataGrid settings={settings} ticket={ticketPayload} />;
}
