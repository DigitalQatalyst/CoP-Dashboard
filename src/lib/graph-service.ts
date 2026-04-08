import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { msalConfig, loginRequest, SHAREPOINT_CONFIG } from './graph-config';
import type { Position } from '@/data/positions';

class MSALAuthenticationProvider implements AuthenticationProvider {
  private msalInstance: PublicClientApplication;

  constructor(msalInstance: PublicClientApplication) {
    this.msalInstance = msalInstance;
  }

  async getAccessToken(): Promise<string> {
    const account = this.msalInstance.getActiveAccount();
    if (!account) {
      throw new Error('No active account found');
    }

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      return response.accessToken;
    } catch (error) {
      // If silent token acquisition fails, try interactive
      const response = await this.msalInstance.acquireTokenPopup(loginRequest);
      return response.accessToken;
    }
  }
}

export class GraphService {
  private msalInstance: PublicClientApplication;
  private graphClient: Client | null = null;
  private lastModified: string | null = null;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async initialize(): Promise<void> {
    await this.msalInstance.initialize();
  }

  async handleRedirectResponse() {
    try {
      const response = await this.msalInstance.handleRedirectPromise();
      if (response) {
        this.msalInstance.setActiveAccount(response.account);
        
        // Initialize Graph client after successful login
        const authProvider = new MSALAuthenticationProvider(this.msalInstance);
        this.graphClient = Client.initWithMiddleware({ authProvider });
        
        return response;
      }
      return null;
    } catch (error) {
      console.error('Redirect handling failed:', error);
      throw error;
    }
  }

  async login(): Promise<void> {
    try {
      await this.msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const account = this.msalInstance.getActiveAccount();
    if (account) {
      await this.msalInstance.logoutRedirect({ account });
    }
    this.graphClient = null;
    this.lastModified = null;
  }

  isLoggedIn(): boolean {
    return this.msalInstance.getActiveAccount() !== null;
  }

  getActiveAccount(): AccountInfo | null {
    return this.msalInstance.getActiveAccount();
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.graphClient) return false;

    try {
      // Get file metadata to check last modified time
      const fileInfo = await this.graphClient
        .api(`/sites/${SHAREPOINT_CONFIG.siteUrl}:${SHAREPOINT_CONFIG.sitePath}:/drive/items/${SHAREPOINT_CONFIG.fileId}`)
        .get();

      const currentModified = fileInfo.lastModifiedDateTime;
      
      if (this.lastModified === null) {
        this.lastModified = currentModified;
        return true; // First time, consider it updated
      }

      if (currentModified !== this.lastModified) {
        this.lastModified = currentModified;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  async fetchExcelData(): Promise<Position[]> {
    if (!this.graphClient) {
      throw new Error('Not authenticated. Please login first.');
    }

    try {
      // Get the worksheet data
      const worksheetData = await this.graphClient
        .api(`/sites/${SHAREPOINT_CONFIG.siteUrl}:${SHAREPOINT_CONFIG.sitePath}:/drive/items/${SHAREPOINT_CONFIG.fileId}/workbook/worksheets/${SHAREPOINT_CONFIG.worksheetName}/usedRange`)
        .get();

      if (!worksheetData.values || worksheetData.values.length === 0) {
        return [];
      }

      // Convert Excel data to Position objects
      const [headers, ...rows] = worksheetData.values;
      const positions: Position[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowData: { [key: string]: any } = {};
        
        // Map row values to headers
        headers.forEach((header: string, index: number) => {
          rowData[header] = row[index] || '';
        });

        // Convert to Position object (reuse existing parsing logic)
        const position = this.rowToPosition(rowData, i);
        if (position.position.trim()) {
          positions.push(position);
        }
      }

      return positions;
    } catch (error) {
      console.error('Error fetching Excel data:', error);
      throw error;
    }
  }

  private rowToPosition(row: { [key: string]: any }, index: number): Position {
    // Reuse the parsing logic from import-positions.ts
    const str = (val: unknown): string => val != null ? String(val).trim() : '';
    const num = (val: unknown): number => {
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    };

    const findCol = (candidates: string[]): unknown => {
      for (const c of candidates) {
        const norm = c.toLowerCase().replace(/[\s/]+/g, '_');
        for (const key of Object.keys(row)) {
          if (key.toLowerCase().replace(/[\s/]+/g, '_').includes(norm)) {
            return row[key];
          }
        }
      }
      return undefined;
    };

    return {
      id: num(findCol(['id', '#'])) || index + 1000,
      position: str(findCol(['position', 'role', 'title', 'job_title'])),
      persona: str(findCol(['persona', 'archetype'])),
      behaviouralValues: str(findCol(['behavioural', 'values', 'behaviour'])),
      technicalSkills: str(findCol(['technical', 'skills', 'core_skills'])),
      preferredYrsExp: str(findCol(['yrs', 'experience', 'exp'])),
      buPracticeTower: str(findCol(['bu', 'practice', 'tower'])),
      studio: str(findCol(['studio', 'office'])) || 'NBO',
      hiringStrategy: str(findCol(['hiring', 'strategy'])) || 'Hire',
      actualYTD: num(findCol(['actual_ytd', 'actual_(ytd)', 'ytd_actual'])),
      planFYE: num(findCol(['plan_fye', 'plan_(fye)', 'fye_plan', 'plan'])),
      actualPrior: num(findCol(['actual_prior', 'prior'])),
      planYTD: num(findCol(['plan_ytd', 'plan_(ytd)', 'ytd_plan'])),
      vacancyStatus: this.parseVacancy(findCol(['vacancy', 'status'])),
      pipeline: {
        tg: num(findCol(['tg', 'target'])),
        trial: num(findCol(['trial'])),
        contract: num(findCol(['contract'])),
        onboard: num(findCol(['onboard'])),
        backlogged: num(findCol(['backlog'])),
        total: num(findCol(['pipeline_total', 'total_pipeline'])),
      },
      cardStatus: this.parseCardStatus(findCol(['card', 'card_status'])),
    };
  }

  private parseVacancy(val: unknown): any {
    const s = String(val || '').toLowerCase();
    if (s.includes('all')) return 'Vacant (All)';
    if (s.includes('some')) return 'Vacant (Some)';
    if (s.includes('over')) return 'Over';
    return 'Filled';
  }

  private parseCardStatus(val: unknown): any {
    const s = String(val || '').toLowerCase();
    if (s.includes('hold')) return 'On Hold';
    if (s.includes('close')) return 'Closed';
    return 'Active';
  }

}

export const graphService = new GraphService();
