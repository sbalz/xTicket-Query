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
    readonly displayLegacyDataFieldIds: Array<string | number>;
    readonly displayLegacyMergesFieldIds: Array<string | number>;
    readonly title: string;
}

/* ----------------- User ----------------- */
export interface IUser {
    readonly id: number;
    readonly name: string;
    readonly email?: string;
    readonly role: 'admin' | 'end-user' | 'agent';
    readonly locale?: string;
    readonly time_zone?: string;
}

/* ----------------- Ticket ----------------- */
export interface ITicket {
    readonly id: string | number;
    readonly external_id?: string | null;
    readonly url?: string;
    readonly subject: string;
    readonly raw_subject?: string;
    readonly description?: string;
    readonly status?: string;
    readonly type?: string;
    readonly priority?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
    readonly requester_id?: string | number;
    readonly submitter_id?: string | number;
    readonly assignee_id?: string | number | null;
    readonly organization_id?: string | number | null;
    readonly group_id?: string | number;
    readonly collaborator_ids?: number[];
    readonly follower_ids?: number[];
    readonly email_cc_ids?: number[];
    readonly forum_topic_id?: number | null;
    readonly problem_id?: number | null;
    readonly has_incidents?: boolean;
    readonly is_public?: boolean;
    readonly tags?: string[];
    readonly via?: ITicketVia;
    readonly custom_fields?: ICustomField[];
    readonly custom_status_id?: number;
    readonly encoded_id?: string;
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
    readonly data: ITableRow[];
    readonly minWidth?: number;
    readonly extIdSource?: string;
}

/* ----------------- DataGrid Props ----------------- */
export interface IDataGridProps {
    readonly user: IUser;
    readonly settings: AppSettings;
    readonly account: string;
    readonly currentUser?: IUser;
}

/* ----------------- DataTable Props ----------------- */
export interface IDataTableProps {
    readonly user: IUser;
    readonly settings: AppSettings;
    readonly account: string;
    readonly userTags: string[];
    readonly setUserTags: React.Dispatch<React.SetStateAction<string[]>>;
    readonly extIdSource?: string;
    readonly onDataLoaded?: () => void;
}
