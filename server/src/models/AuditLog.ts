import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  userEmail: string;
  action: string;
  entityType: 'user' | 'project' | 'audio' | 'segment' | 'export' | 'system';
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  details: { type: Object, default: {} },
  ipAddress: { type: String },
  userAgent: { type: String }
}, {
  timestamps: true
});

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
