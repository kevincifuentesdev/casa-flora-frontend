export type EnvironmentId = "interior" | "patio";

export type TimeGroupId = "Almuerzo" | "Cena";

export type BookingField = "environment" | "date" | "time" | "diners";

export type EnvironmentOption = {
    value: EnvironmentId;
    label: string;
};

export type TimeSlotGroup = {
    label: TimeGroupId;
    slots: readonly string[];
};

export type BookingDraft = {
    environment: EnvironmentId | null;
    date: string | null;
    time: string | null;
    diners: number;
};

export type BookingErrors = Partial<Record<BookingField, string>>;

export type CalendarCell = {
    key: string;
    day: number;
    muted: boolean;
    isToday: boolean;
    iso?: string;
};

export interface SlotAvailability {
    time: string;
    capacity: number;
    reservedDiners: number;
    remainingDiners: number;
    available: boolean;
}

export type BookingStatus =
    | "confirmed"
    | "seated"
    | "completed"
    | "no_show"
    | "cancelled";

export interface BookingCustomerSummary {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string | null;
    points: number;
    dietPreference: string | null;
    spiceTolerance: string | null;
    favoriteMoment: string | null;
}

export interface BookingRecord {
    id: string;
    userId: string;
    environment: EnvironmentId;
    date: string;
    time: string;
    diners: number;
    status: BookingStatus;
    customer?: BookingCustomerSummary;
    createdAt: string;
    updatedAt: string;
}
