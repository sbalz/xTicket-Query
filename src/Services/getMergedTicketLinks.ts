import client from '../Utils/ZAFClient';

/**
 * Search for a ticket by its external_id
 * Returns the new ticket ID if found
 */
export const searchTicketByExternalId = async (
    externalId: string | number,
): Promise<string | null> => {
    try {
        const response = await client?.request({
            url: `/api/v2/search.json?query=type:ticket external_id:${externalId}`,
            type: 'GET',
            dataType: 'json',
        });

        if (response?.results && response.results.length > 0) {
            return String(response.results[0].id);
        }
        return null;
    } catch (error) {
        console.error(
            `Error searching ticket with external_id ${externalId}:`,
            error,
        );
        return null;
    }
};

/**
 * Build a mapping of external IDs to new ticket IDs
 * Resolves merged ticket IDs to their current counterparts
 */
export const buildExternalIdToCurrentIdMap = async (
    externalIds: (string | number)[],
): Promise<Record<string, string>> => {
    const map: Record<string, string> = {};

    // Search in parallel with a reasonable concurrency limit
    const searchPromises = externalIds.map(async (extId) => {
        const newId = await searchTicketByExternalId(extId);
        if (newId) {
            map[String(extId)] = newId;
        }
    });

    await Promise.all(searchPromises);
    return map;
};

/**
 * Extract external IDs from flattened merge data
 * After flattening, the structure uses dot notation:
 * "0.via.source.from.ticket_id" and "0.via.source.from.ticket_ids"
 */
export const extractExternalIdsFromMergeData = (
    mergeData: Record<string, any>,
): (string | number)[] => {
    const externalIds: Set<string | number> = new Set();

    // Check for flattened ticket_id field
    const ticketId = mergeData['0.via.source.from.ticket_id'];
    if (ticketId && ticketId !== null) {
        externalIds.add(ticketId);
    }

    // Check for flattened ticket_ids field (comes as comma-separated string after flattening)
    const ticketIds = mergeData['0.via.source.from.ticket_ids'];
    if (ticketIds) {
        const ids = String(ticketIds)
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
        ids.forEach((id) => externalIds.add(id));
    }

    return Array.from(externalIds);
};
