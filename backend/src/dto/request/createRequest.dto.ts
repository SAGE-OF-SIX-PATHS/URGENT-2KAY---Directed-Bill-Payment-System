export interface CreateRequestDto {
    name: string;
    notes?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    supporterId?: string;
    billIds: string[]; 
  }
  