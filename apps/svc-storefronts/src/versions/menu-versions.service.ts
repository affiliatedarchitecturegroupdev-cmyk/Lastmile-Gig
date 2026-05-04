import { Injectable } from '@nestjs/common';

export interface MenuVersion {
  id: string;
  partnerId: string;
  version: number;
  snapshot: any;
  createdAt: Date;
  createdBy: string;
}

@Injectable()
export class MenuVersionsService {
  private versions: Map<string, MenuVersion[]> = new Map();

  async createVersion(partnerId: string, snapshot: any, createdBy: string): Promise<MenuVersion> {
    const partnerVersions = this.versions.get(partnerId) || [];
    const lastVersion = partnerVersions[partnerVersions.length - 1];
    const version = lastVersion ? lastVersion.version + 1 : 1;

    const menuVersion: MenuVersion = {
      id: crypto.randomUUID(),
      partnerId,
      version,
      snapshot,
      createdAt: new Date(),
      createdBy,
    };

    partnerVersions.push(menuVersion);
    this.versions.set(partnerId, partnerVersions);

    return menuVersion;
  }

  async getVersion(partnerId: string, version: number): Promise<MenuVersion | null> {
    const versions = this.versions.get(partnerId) || [];
    return versions.find(v => v.version === version) || null;
  }

  async getVersions(partnerId: string): Promise<MenuVersion[]> {
    return this.versions.get(partnerId) || [];
  }

  async getLatestVersion(partnerId: string): Promise<MenuVersion | null> {
    const versions = this.versions.get(partnerId) || [];
    return versions[versions.length - 1] || null;
  }

  async revertToVersion(partnerId: string, version: number): Promise<any> {
    const menuVersion = await this.getVersion(partnerId, version);
    if (!menuVersion) throw new Error('Version not found');
    return menuVersion.snapshot;
  }

  async getVersionDiff(partnerId: string, v1: number, v2: number): Promise<{ added: string[]; removed: string[]; modified: string[] }> {
    const version1 = await this.getVersion(partnerId, v1);
    const version2 = await this.getVersion(partnerId, v2);
    
    if (!version1 || !version2) {
      throw new Error('Version not found');
    }

    // Simplified diff
    return { added: [], removed: [], modified: [] };
  }
}