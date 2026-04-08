// SharePoint URL Helper
export function convertSharePointToCSV(sharePointUrl: string): string {
  const fileId = 'IQDwfi4xUXVFSrJ4VywGwe0JAeW8nGE4_rby8J87fKy0rAM';
  
  const formats = [
    `https://arqitek.sharepoint.com/sites/RUNHIRING22/_layouts/15/download.aspx?UniqueId=${fileId}&Translate=false&ApiVersion=2.0`,
    `https://arqitek.sharepoint.com/sites/RUNHIRING22/_layouts/15/WopiFrame.aspx?sourcedoc=${fileId}&action=exportcsv`,
    `https://arqitek-my.sharepoint.com/personal/meshack_kimaiyo_digitalqatalyst_com/_layouts/15/download.aspx?UniqueId=${fileId}`,
  ];
  
  return formats[0];
}

export const SHAREPOINT_CSV_CONFIG = {
  originalUrl: 'https://arqitek.sharepoint.com/:x:/s/RUNHIRING22/IQDwfi4xUXVFSrJ4VywGwe0JAR0-LjrpUa2ynCrOhSGqQaE?e=YnDxof',
  fileId: 'IQDwfi4xUXVFSrJ4VywGwe0JAR0-LjrpUa2ynCrOhSGqQaE',
  csvExportUrl: 'http://localhost:3001/api/sharepoint-data',
  fallbackUrl: '',
};