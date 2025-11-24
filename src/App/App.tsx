import React, {useEffect, useState, useCallback} from 'react';
import DataGrid from '../Elements/DataGrid';
import client from '../Utils/ZAFClient';
import {logMessage, setAppTitle} from '../Utils/ConsoleLog';
import type {AppSettings, ITicket, ICustomField} from '../declarations';

/**
 * Only map the custom fields we need into a minimal ITicket payload
 */
const mapTicketToPayload = (
    ticket: any,
    fieldIds: Array<number | string>,
): ITicket => ({
    id: ticket.id,
    subject: ticket.subject ?? '',
    // keep only custom fields that are relevant (and keep original value)
    custom_fields: (ticket.custom_fields ?? [])
        .filter(
            (cf: any) =>
                fieldIds.includes(cf.id) || fieldIds.includes(String(cf.id)),
        )
        .map((cf: any) => ({
            id: Number(cf.id),
            value: cf.value,
        })) as ICustomField[],
});

export default function App(): JSX.Element {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [ticketPayload, setTicketPayload] = useState<ITicket | null>(null);

    const initializeApp = useCallback(async () => {
        if (!client) {
            console.error(
                'ZAF client not available (window.ZAFClient missing)',
            );
            return;
        }

        try {
            const c = client as any; // use any for ZAF convenience methods

            // 1) metadata & app title
            const meta = await c.metadata();
            const metaSettings = (meta?.settings ?? {}) as Record<string, any>;
            const appTitle = meta?.title ?? 'Legacy Ticket Finder';
            setAppTitle(appTitle);

            // 2) collect field IDs (numbers + possible string IDs)
            const legacyDataFieldId =
                metaSettings['Legacy Ticket Data Field ID'];
            const legacyMergesFieldId =
                metaSettings['Legacy Ticket Merges Field ID'];
            const displayLegacyDataFieldIds =
                metaSettings['Display Legacy Data Field IDs'] ?? [];
            const displayLegacyMergesFieldIds =
                metaSettings['Display Legacy Merges Field IDs'] ?? [];

            const allFieldIds = [
                legacyDataFieldId,
                legacyMergesFieldId,
                ...displayLegacyDataFieldIds,
                ...displayLegacyMergesFieldIds,
            ].filter(Boolean);

            // 3) context -> ticket id
            const ctx = await c.context();
            const ticketId = ctx?.ticketId;
            if (!ticketId) {
                logMessage('No ticket in context. Nothing to display.');
                return;
            }

            // 4) request the full ticket JSON via Zendesk API
            const resp = await c.request({
                url: `/api/v2/tickets/${ticketId}.json`,
                type: 'GET',
                dataType: 'json',
            });
            const ticketData = resp?.ticket;
            if (!ticketData) throw new Error('Ticket API returned no ticket');

            // 5) map payload and set state (only once)
            const payload = mapTicketToPayload(ticketData, allFieldIds);
            setTicketPayload(payload);

            // 6) build typed settings
            const appSettings: AppSettings = {
                legacyTicketDataFieldId: Number(legacyDataFieldId),
                legacyTicketMergesFieldId: Number(legacyMergesFieldId),
                displayLegacyDataFieldIds: displayLegacyDataFieldIds,
                displayLegacyMergesFieldIds: displayLegacyMergesFieldIds,
                title: appTitle,
            };
            setSettings(appSettings);

            // 7) single, clear log snapshot
            logMessage('🎉 App Initialized Successfully — Full Snapshot:');
            logMessage(
                JSON.stringify(
                    {
                        appTitle,
                        appSettings,
                        ticket: {
                            id: ticketData.id,
                            subject: ticketData.subject,
                            // only the custom fields we care about
                            custom_fields: (
                                ticketData.custom_fields ?? []
                            ).filter(
                                (cf: any) =>
                                    allFieldIds.includes(cf.id) ||
                                    allFieldIds.includes(String(cf.id)),
                            ),
                        },
                    },
                    null,
                    2,
                ),
            );
        } catch (err: any) {
            console.error('❌ Error initializing app:', err?.message ?? err);
        }
        // run once only
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
