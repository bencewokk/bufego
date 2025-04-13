// src/types/index.ts
export interface InventoryItem {
  _id: string;
  name: string;
  available: boolean;
  category: string;
  stockLevel: number;
  lastRestocked?: Date;
  lowStockThreshold: number;
}

export interface Buffet {
  id: string;
  name: string;
  location: string;
  openingHours: string;
  dailyHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  image: string;
  tags: string[];
  email?: string;
  password?: string;
  __v?: number;
  inventory?: InventoryItem[];
}

export interface Order {
  id: string;
  items: string[];
  status: "pending" | "preparing" | "ready" | "completed";
  createdAt: Date;
  pickupCode: string;
  pickupTime: Date;
}



