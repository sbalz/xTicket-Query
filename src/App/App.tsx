import React, {useEffect, useState} from 'react';
import DataGrid from '../Elements/DataGrid';
import client from '../Utils/ZAFClient';
import {logMessage, setAppTitle} from '../Utils/ConsoleLog';
import {mapTicketToPayload} from '../Elements/DataRows';
import type {AppSettings, ITicket} from '../declarations';

export default function App(): JSX.Element {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [ticketPayload, setTicketPayload] = useState<ITicket | null>(null);
    const [ticketFieldLabels, setTicketFieldLabels] = useState<
        Record<string, string>
    >({});

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
                const displayCurrentFieldIds =
                    metaSettings['Display Current Ticket Data Field IDs'] ?? [];
                const displayLegacyFieldIds =
                    metaSettings['Display Legacy Data Field IDs'] ?? [];
                const displayMergeFieldIds =
                    metaSettings['Display Legacy Merges Field IDs'] ?? [];

                const allFieldIds = [
                    ...displayCurrentFieldIds,
                    ...displayLegacyFieldIds,
                    ...displayMergeFieldIds,
                    legacyTicketDataFieldId,
                    legacyTicketMergesFieldId,
                ].filter(Boolean);

                // Fetch current ticket
                const currentTicketData = await client.get('ticket');
                const ticket = currentTicketData.ticket;
                if (!ticket) return logMessage('No ticket in context.');

                setTicketPayload(mapTicketToPayload(ticket, allFieldIds));

                // Fetch Ticket Fields API for dynamic labels
                const fieldDefs = await client.request(
                    '/api/v2/ticket_fields.json',
                );
                const labels: Record<string, string> = {};
                fieldDefs.ticket_fields.forEach((f: any) => {
                    labels[`custom_field_${f.id}`] = f.title;
                });
                setTicketFieldLabels(labels);

                // Set settings
                setSettings({
                    legacyTicketDataFieldId: Number(legacyTicketDataFieldId),
                    legacyTicketMergesFieldId: Number(
                        legacyTicketMergesFieldId,
                    ),
                    displayLegacyDataFieldIds: displayLegacyFieldIds,
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

    return (
        <DataGrid
            settings={settings}
            ticket={ticketPayload}
            ticketFieldLabels={ticketFieldLabels}
        />
    );
}
