import { Configuration } from '@azure/msal-browser';

const nextPublicEnv = {
  clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
  tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID,
  redirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI,
  sharepointSiteUrl: process.env.NEXT_PUBLIC_SHAREPOINT_SITE_URL,
  sharepointSitePath: process.env.NEXT_PUBLIC_SHAREPOINT_SITE_PATH,
  sharepointFileId: process.env.NEXT_PUBLIC_SHAREPOINT_FILE_ID,
  sharepointWorksheetName: process.env.NEXT_PUBLIC_SHAREPOINT_WORKSHEET_NAME,
};

export const msalConfig: Configuration = {
  auth: {
    clientId: nextPublicEnv.clientId || '94e7eee3-9a67-4cdb-8200-bae5a767b54b',
    authority: `https://login.microsoftonline.com/${nextPublicEnv.tenantId || 'fac25f94-6558-46ab-a790-6d7ff01c12d4'}`,
    redirectUri: nextPublicEnv.redirectUri || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const loginRequest = {
  scopes: ['Files.Read', 'Sites.Read.All', 'User.Read'],
};

// Extract SharePoint site and file info from your URL
export const SHAREPOINT_CONFIG = {
  siteUrl: nextPublicEnv.sharepointSiteUrl || 'arqitek.sharepoint.com',
  sitePath: nextPublicEnv.sharepointSitePath || '/sites/RUNHIRING22',
  fileId: nextPublicEnv.sharepointFileId || 'IQDwfi4xUXVFSrJ4VywGwe0JAeW8nGE4_rby8J87fKy0rAM',
  worksheetName: nextPublicEnv.sharepointWorksheetName || 'Sheet1',
};
