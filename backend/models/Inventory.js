const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: [true, 'Item ID is required'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Medications',
      'Medical Supplies',
      'Equipment',
      'Consumables',
      'Laboratory',
      'Radiology',
      'Surgical',
      'Office Supplies',
      'Maintenance',
    ],
  },
  subCategory: String,
  description: String,
  manufacturer: String,
  brand: String,
  model: String,
  batchNumber: String,
  expiryDate: Date,
  unitOfMeasure: {
    type: String,
    required: [true, 'Unit of measure is required'],
    enum: ['Each', 'Box', 'Pack', 'Bottle', 'Vial', 'Tablet', 'Capsule', 'Milliliter', 'Gram', 'Kilogram'],
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  minimumStock: {
    type: Number,
    min: [0, 'Minimum stock cannot be negative'],
    default: 0,
  },
  maximumStock: {
    type: Number,
    min: [0, 'Maximum stock cannot be negative'],
  },
  reorderPoint: {
    type: Number,
    min: [0, 'Reorder point cannot be negative'],
    default: 0,
  },
  unitCost: {
    type: Number,
    min: [0, 'Unit cost cannot be negative'],
  },
  sellingPrice: {
    type: Number,
    min: [0, 'Selling price cannot be negative'],
  },
  location: {
    warehouse: String,
    aisle: String,
    shelf: String,
    bin: String,
  },
  supplier: {
    name: String,
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Discontinued', 'Out of Stock'],
    default: 'Active',
  },
  requiresPrescription: {
    type: Boolean,
    default: false,
  },
  controlledSubstance: {
    type: Boolean,
    default: false,
  },
  temperatureSensitive: {
    type: Boolean,
    default: false,
  },
  storageConditions: String,
  usageInstructions: String,
  sideEffects: String,
  contraindications: String,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
InventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
InventorySchema.index({ itemId: 1 });
InventorySchema.index({ name: 1 });
InventorySchema.index({ category: 1 });
InventorySchema.index({ expiryDate: 1 });
InventorySchema.index({ currentStock: 1 });

// Virtual for stock status
InventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'Out of Stock';
  if (this.currentStock <= this.reorderPoint) return 'Low Stock';
  if (this.currentStock >= this.maximumStock) return 'Overstocked';
  return 'In Stock';
});

// Virtual for total value
InventorySchema.virtual('totalValue').get(function() {
  return this.currentStock * (this.unitCost || 0);
});

// Ensure virtual fields are serialized
InventorySchema.set('toJSON', { virtuals: true });
InventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', InventorySchema);