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
  email: string;
  location: string;
  openingHours: string;
  image: string;
  tags?: string[];
  currentCapacity: number;
  maxCapacity: number;
}

export interface Order {
  id: string;
  items: string[];
  status: "pending" | "preparing" | "ready" | "completed";
  createdAt: Date;
  pickupCode: string;
  pickupTime: Date;
}
