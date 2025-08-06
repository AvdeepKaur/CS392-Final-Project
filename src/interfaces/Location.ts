// src/interfaces/Location.ts
export interface Location {
    _id: string;
    name: string;
    address: string;
    tags: string[];
    floor?: string;
}