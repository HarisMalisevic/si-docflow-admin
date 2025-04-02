export type DocumentType = {
    id: string;
    name: string;
    description: string;
    createdBy: string; // Reference to the creator
    createdAt: Date; // Timestamp of creation
};