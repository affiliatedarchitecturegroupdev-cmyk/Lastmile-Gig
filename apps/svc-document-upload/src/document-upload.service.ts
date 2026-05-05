import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Document {
  id: string;
  entityType: 'driver' | 'partner' | 'user';
  entityId: string;
  type: 'id' | 'license' | 'certificate' | 'other';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
}

@Injectable()
export class DocumentUploadService {
  private documents: Map<string, Document> = new Map();

  async upload(data: { entityType: Document['entityType']; entityId: string; type: Document['type']; url: string }): Promise<Document> {
    const doc: Document = { id: uuidv4(), ...data, status: 'pending', uploadedAt: new Date() };
    this.documents.set(doc.id, doc);
    return doc;
  }

  async getDocuments(entityType: Document['entityType'], entityId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d => d.entityType === entityType && d.entityId === entityId);
  }

  async approveDocument(documentId: string): Promise<boolean> {
    const doc = this.documents.get(documentId);
    if (!doc) return false;
    doc.status = 'approved';
    return true;
  }

  async rejectDocument(documentId: string, reason: string): Promise<boolean> {
    const doc = this.documents.get(documentId);
    if (!doc) return false;
    doc.status = 'rejected';
    return true;
  }
}