import React, {useEffect, useState, useCallback} from 'react';
import DataGrid from '../Elements/DataGrid';
import client from '../Utils/ZAFClient';
import {logMessage, setAppTitle} from '../Utils/ConsoleLog';
import {mapTicketToPayload} from '../Elements/DataRows';
import type {AppSettings, ITicket} from '../declarations';

export default function App(): JSX.Element {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [ticketPayload, setTicketPayload] = useState<ITicket | null>(null);

    const initializeApp = useCallback(async () => {
        if (!client) return console.error('ZAF client not available');

        try {
            const meta = await client.metadata();
            const metaSettings = meta?.settings ?? {};
            const appTitle = meta?.title ?? 'xTicket Query';
            setAppTitle(appTitle);

            const legacyTicketDataId =
                metaSettings['Legacy Ticket Data Field ID'];
            const legacyTicketMergesId =
                metaSettings['Legacy Ticket Merges Field ID'];
            const displayDataIds =
                metaSettings['Display Legacy Data Field IDs'] ?? [];
            const displayMergeIds =
                metaSettings['Display Legacy Merges Field IDs'] ?? [];

            const allFieldIds = [
                legacyTicketDataId,
                legacyTicketMergesId,
                ...displayDataIds,
                ...displayMergeIds,
            ].filter(Boolean);

            const context = await client.context();
            const ticketId = context?.ticketId;
            if (!ticketId)
                return logMessage('No ticket in context. Nothing to display.');

            const response = await client.request({
                url: `/api/v2/tickets/${ticketId}.json`,
                type: 'GET',
                dataType: 'json',
            });

            const ticketData = response?.ticket;
            if (!ticketData) throw new Error('Ticket API returned no ticket');

            const payload = mapTicketToPayload(ticketData, allFieldIds);
            setTicketPayload(payload);

            const appSettings: AppSettings = {
                legacyTicketDataFieldId: Number(legacyTicketDataId),
                legacyTicketMergesFieldId: Number(legacyTicketMergesId),
                displayLegacyDataFieldIds: displayDataIds,
                displayLegacyMergesFieldIds: displayMergeIds,
                title: appTitle,
            };
            setSettings(appSettings);

            logMessage('App Initialized');
        } catch (error: any) {
            console.error(
                '❌ Error initializing app:',
                error?.message ?? error,
            );
        }
    }, []);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    if (!settings || !ticketPayload) {
        return (
            <div style={{padding: 12, fontSize: 13}}>
                Loading Legacy Ticket Data…
            </div>
        );
    }

    return <DataGrid settings={settings} ticket={ticketPayload} />;
}
