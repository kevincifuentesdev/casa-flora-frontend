import type { Product } from "@/features/products/domain/product";

export type DietPreference = "cows" | "trees" | "both";
export type SpiceTolerance = "none" | "mild" | "spicy";
export type FavoriteMoment = "almuerzo" | "tarde" | "postre";
export type PaymentMethodType = "card" | "pse" | "cash";

export interface UserPreferences {
    dietPreference: DietPreference | null;
    spiceTolerance: SpiceTolerance | null;
    favoriteMoment: FavoriteMoment | null;
}

export interface LoyaltySummary {
    points: number;
    nextRewardGoal: number;
    pointsInCurrentCycle: number;
    pointsRemaining: number;
    progressPercent: number;
    rewardName: string;
    availableRewards: number;
}

export interface UserAddressRecord {
    id: string;
    label: string;
    addressLine: string;
    neighborhood: string;
    city: string;
    details: string | null;
    isDefault: boolean;
    createdAt: string;
}

export interface PaymentMethodRecord {
    id: string;
    type: PaymentMethodType;
    brand: string;
    lastFour: string | null;
    holderName: string | null;
    isDefault: boolean;
    createdAt: string;
}

export interface OrderItemRecord {
    id: string;
    productId: string;
    productName: string;
    productDescription: string;
    productImageUrl: string;
    unitPrice: number;
    quantity: number;
}

export interface OrderRecord {
    id: string;
    orderNumber: number;
    userId: string;
    addressLabel: string;
    paymentSummary: string;
    totalAmount: number;
    pointsEarned: number;
    status: "delivered" | "preparing" | "cancelled";
    items: OrderItemRecord[];
    createdAt: string;
    updatedAt: string;
}

export interface SessionUser {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    username: string;
    email: string;
    points: number;
    onboardingCompleted: boolean;
    preferences: UserPreferences;
    loyalty: LoyaltySummary;
    addresses: UserAddressRecord[];
    paymentMethods: PaymentMethodRecord[];
    recommendedProduct: Product | null;
    orders: OrderRecord[];
}

export interface Session {
    user: SessionUser;
}

export type SessionState = Session | null | undefined;

export type AuthMode = "login" | "signup";

export interface LoginDraft {
    identifier: string;
    password: string;
}

export interface SignUpDraft {
    firstName: string;
    lastName: string;
    birthDate: string;
    username: string;
    email: string;
    password: string;
}

export type LoginField = keyof LoginDraft;
export type SignUpField = keyof SignUpDraft;

export type LoginErrors = Partial<Record<LoginField, string>>;
export type SignUpErrors = Partial<Record<SignUpField, string>>;
