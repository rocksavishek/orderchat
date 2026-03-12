import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Order {
    id: bigint;
    customerName: string;
    paymentStatus: string;
    createdAt: bigint;
    deliveryDate: string;
    deliveryStatus: string;
    quantity: bigint;
    price: number;
    product: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(customerName: string, product: string, quantity: bigint, deliveryDate: string, price: number, paymentStatus: string, deliveryStatus: string): Promise<Order>;
    deleteOrder(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateDeliveryStatus(id: bigint, status: string): Promise<void>;
    updatePaymentStatus(id: bigint, status: string): Promise<void>;
}
