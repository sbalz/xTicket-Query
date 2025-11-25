import React from 'react';

/* ----------------- Zendesk App Client ----------------- */
export interface Client {
    on<T = any>(event: string, callback: (data?: T) => void): void;
    invoke<T = any>(name: string, ...options: any[]): Promise<T>;
    get<T = any>(name: string | string[]): Promise<T>;
    set<T = any>(name: string, value: string | Record<string, any>): Promise<T>;
    request<Input = any, Output = any>(data: Input): Promise<Output>;
    metadata<T = any>(): Promise<Metadata<T>>;
    trigger(event: string, data?: any): void;
    instance(guid: string): Client;
    context<T = any>(): Promise<T>;
}

export interface Metadata<T> {
    readonly appId: number;
    readonly title: string;
    readonly name: string;
    readonly version: string;
    readonly installationId: number;
    readonly settings: T;
}

declare global {
    interface Window {
        ZAFClient?: {init: () => Client};
    }
}

/* ----------------- App Settings ----------------- */
export interface AppSettings {
    readonly legacyTicketDataFieldId: number;
    readonly legacyTicketMergesFieldId: number;
    readonly displayCurrentDataFieldIds?: Array<string | number>;
    readonly displayLegacyDataFieldIds: Array<string | number>;
    readonly displayLegacyMergesFieldIds: Array<string | number>;
    readonly title: string;
}

/* ----------------- Ticket ----------------- */
export interface ITicket {
    readonly id: string | number;
    readonly external_id?: string | null;
    readonly via?: ITicketVia;
    readonly created_at?: string;
    readonly updated_at?: string;
    readonly type?: string;
    readonly subject: string;
    readonly description?: string;
    readonly priority?: string;
    readonly status?: string;
    readonly recipient?: string | null;
    readonly problem_id?: number | null;
    readonly is_public?: boolean;
    readonly tags?: string[];
    readonly custom_fields?: ICustomField[];
    readonly satisfaction_rating?: ISatisfactionRating | 'unoffered';
    readonly followup_ids?: number[];
    readonly support_type?: string;
}

export interface ISatisfactionRating {
    readonly score: 'good' | 'bad' | 'unoffered';
    readonly comment: string | null;
}

export interface ITicketVia {
    readonly channel?: string;
    readonly source?: {
        readonly from: Record<string, any>;
        readonly to: Record<string, any>;
        readonly rel: string | null;
    };
}

export interface ICustomField {
    readonly id: number;
    readonly value: string | number | boolean | null | object;
}

/* ----------------- Grouped Rows ----------------- */
export interface IGroupedRows {
    group: string;
    rows: ITableRow[];
}

/* ----------------- Merge Mapping ----------------- */
export interface IMerge {
    readonly old_ticket_id: string | number;
    readonly new_ticket_id: string | number;
}

/* ----------------- Table Props ----------------- */
export interface ITableRow {
    readonly key: string;
    readonly title: string;
    readonly value: any;
}

export interface ITableProps {
    groupedData: IGroupedRows[];
    merges?: Record<string, string>;
    extIdSource?: string;
}

/* ----------------- DataGrid Props ----------------- */
export interface IDataGridProps {
    readonly settings: AppSettings;
    readonly ticket: ITicket;
    readonly ticketFieldLabels: Record<string, string>;
    readonly legacyData: Record<string, any>;
    readonly mergeData: Record<string, any>;
}

/* ----------------- DataTable Props ----------------- */
export interface IDataTableProps {
    readonly settings: AppSettings;
    readonly account: string;
}
