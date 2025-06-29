import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
  amount: number;
  paymentDate: Date;
  gpsLat?: number;
  gpsLng?: number;
  notes?: string;
  installmentId: mongoose.Types.ObjectId;
  collectorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    gpsLat: {
      type: Number,
      required: false,
    },
    gpsLng: {
      type: Number,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    installmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Installment',
      required: true,
    },
    collectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
CollectionSchema.index({ installmentId: 1, paymentDate: -1 });
CollectionSchema.index({ collectorId: 1, paymentDate: -1 });

export default mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema); 