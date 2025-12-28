
export enum PaymentStatus {
  BLANK = '',
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export interface ApartmentData {
  flatNumber: string;
  maintenance: PaymentStatus;
  waterBill: PaymentStatus;
  name: string;
  comments: string;
  receipt?: File; // For in-session use
  receiptName?: string; // For persistence in localStorage
}
