import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  PAYMENT_DUE = 'PAYMENT_DUE',
  PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  LOAN_APPROVED = 'LOAN_APPROVED',
  LOAN_REJECTED = 'LOAN_REJECTED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ',
}

export interface INotification extends Document {
  type: NotificationType;
  title: string;
  message: string;
  recipient: string; // phone number or email
  status: NotificationStatus;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
    },
    sentAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ recipient: 1, status: 1 });
NotificationSchema.index({ type: 1, status: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema); 