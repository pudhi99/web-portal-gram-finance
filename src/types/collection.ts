import { ICollection } from '@/models/Collection';
import { IInstallment } from '@/models/Installment';
import { IUser } from '@/models/User';

export interface PopulatedCollection extends Omit<ICollection, 'installmentId' | 'collectorId'> {
  installmentId: IInstallment;
  collectorId: IUser;
}

export interface CollectionListItem {
  _id: string;
  amount: number;
  paymentDate: Date;
  gpsLat?: number;
  gpsLng?: number;
  notes?: string;
  installmentId: {
    _id: string;
    installmentNumber: number;
    dueDate: Date;
    status: string;
    amount: number;
  };
  collectorId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
} 