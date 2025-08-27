export type RequestStatus = 'pending' | 'available' | 'out_of_stock' | 'completed';

export interface RequestItem {
  id: string;
  quantity: number;
  material: string;
  equipment: string;
  equipmentOs: string;
  application: string;
  location: string;
}

export interface PartRequest {
  id: string;
  osNumber?: string;
  costCenter?: string;
  reservation?: string;
  registrationNumber: string;
  requesterName: string;
  requestDate: string; // ISO string
  status: RequestStatus;
  items: RequestItem[];
}
