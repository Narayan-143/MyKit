import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItemDocument extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  image: string;
  available: boolean;
  featured: boolean;
  preparationTime: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    available: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    preparationTime: { type: String, default: "15-20 mins" },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
  },
  {
    timestamps: true,
  }
);

// Add text index for fast text search and compound index for category queries
MenuItemSchema.index({ name: "text", description: "text" });
MenuItemSchema.index({ category: 1, available: 1 });

const MenuItem: Model<IMenuItemDocument> =
  mongoose.models.MenuItem ||
  mongoose.model<IMenuItemDocument>("MenuItem", MenuItemSchema);

export default MenuItem;
