// types.ts
export interface InventoryItem {
    _id?: string;
    name: string;
    available: boolean;
    category: string;
  }
  
  export interface Buffet {
    id: string;
    name: string;
    email: string;
    location: string;
    openingHours: string;
    image: string;
    tags?: string[];
    inventory?: InventoryItem[];
  }