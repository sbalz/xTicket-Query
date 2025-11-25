import React, {useEffect, useState} from 'react';
import DataGrid from '../Elements/DataGrid';
import client from '../Utils/ZAFClient';
import {logMessage, setAppTitle} from '../Utils/ConsoleLog';
import type {AppSettings, ITicket} from '../declarations';
import {getCurrentTicket} from '../Services/getCurrentTicket';
import {getLegacyTicketData} from '../Services/getLegacyTicketData';
import {getLegacyMergeData} from '../Services/getLegacyMergeData';

export default function App(): JSX.Element {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [ticketPayload, setTicketPayload] = useState<ITicket | null>(null);
    const [ticketFieldLabels, setTicketFieldLabels] = useState<
        Record<string, string>
    >({});
    const [legacyData, setLegacyData] = useState<Record<string, any>>({});
    const [mergeData, setMergeData] = useState<Record<string, any>>({});

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

                // Fetch current ticket with custom fields
                const ticket = await getCurrentTicket(allFieldIds);
                console.log('🚀 Current Ticket:', ticket);
                if (!ticket) return logMessage('No ticket in context.');
                setTicketPayload(ticket);

                // Extract legacy & merge data
                const legacy = getLegacyTicketData(ticket, {
                    legacyTicketDataFieldId,
                    legacyTicketMergesFieldId,
                    displayLegacyDataFieldIds: displayLegacyFieldIds,
                    displayLegacyMergesFieldIds: displayMergeFieldIds,
                    title: appTitle,
                });

                const merge = getLegacyMergeData(ticket, {
                    legacyTicketDataFieldId,
                    legacyTicketMergesFieldId,
                    displayLegacyDataFieldIds: displayLegacyFieldIds,
                    displayLegacyMergesFieldIds: displayMergeFieldIds,
                    title: appTitle,
                });

                console.log('🚀 Legacy Data:', legacy);
                console.log('🚀 Merge Data:', merge);

                setLegacyData(legacy);
                setMergeData(merge);

                // Ticket field labels
                const fieldDefs = await client.request(
                    '/api/v2/ticket_fields.json',
                );
                const labels: Record<string, string> = {};
                fieldDefs.ticket_fields.forEach((f: any) => {
                    labels[`custom_field_${f.id}`] = f.title;
                });
                setTicketFieldLabels(labels);

                setSettings({
                    legacyTicketDataFieldId: Number(legacyTicketDataFieldId),
                    legacyTicketMergesFieldId: Number(
                        legacyTicketMergesFieldId,
                    ),
                    displayCurrentDataFieldIds: displayCurrentFieldIds,
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

    if (!settings || !ticketPayload || !Object.keys(legacyData).length) {
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
            legacyData={legacyData}
            mergeData={mergeData}
        />
    );
}
