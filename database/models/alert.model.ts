import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface AlertItem extends Document {
  userId: string;
  name: string;
  symbol: string;
  type: string;
  condition: string;
  targetPrice: number;
  frequency: string;
  isActive: boolean;
  triggerCount: number;
  lastTriggeredAt?: Date;
  createdAt: Date;
}

const AlertSchema = new Schema<AlertItem>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, required: true, default: 'Price' }, // e.g. "Price"
    condition: { type: String, required: true, enum: ['greater_than', 'less_than'] },
    targetPrice: { type: Number, required: true },
    frequency: { type: String, required: true, default: 'Once per day' }, // "Once per day", "Once per hour", etc.
    isActive: { type: Boolean, default: true },
    triggerCount: { type: Number, default: 0 },
    lastTriggeredAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const Alert: Model<AlertItem> =
  (models?.Alert as Model<AlertItem>) || model<AlertItem>('Alert', AlertSchema);
