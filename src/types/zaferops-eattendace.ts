export type TicketStatus = 'GENERATED' | 'PAID' | 'USED' | 'REVOKED';

export interface Passport {
    pin_code: string;
    keyword_hash: string;
    recovery_hash: string;
    name_mask: string;
    last_active_at: string;
    created_at: string;
}

export interface Ticket {
    id: string;
    event_id: string;
    pin_code: string;
    qr_hash: string;
    keyword_hash: string;
    status: TicketStatus;
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    id: string;
    event_id: string;
    passport_pin: string;
    session_name?: string | null;
    scanned_at: string;
}

export interface Certificate {
    hash: string;
    passport_pin: string;
    event_count: number;
    created_at: string;
}

export interface TicketSession {
    id: string;
    event_id: string;
    creation_token: string;
    expires_at: string;
    is_used: boolean;
    created_at: string;
}