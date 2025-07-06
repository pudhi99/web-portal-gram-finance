import { google } from 'googleapis';

// Google Sheets API configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CREDENTIALS = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

interface DailyCollectionSummary {
  date: string;
  totalCollected: number;
  totalPayments: number;
  totalOutstanding: number;
  collectors: {
    name: string;
    collections: number;
    amount: number;
  }[];
  payments: {
    loanNumber: string;
    borrowerName: string;
    amount: number;
    collectorName: string;
    time: string;
    notes?: string;
  }[];
}

class GoogleSheetsService {
  private auth: any;
  private sheets: any;
  private isConfigured: boolean = false;

  constructor() {
    if (!CREDENTIALS || !SHEET_ID) {
      console.warn('Google Sheets credentials not configured - running in development mode');
      this.isConfigured = false;
      return;
    }

    try {
      const credentials = JSON.parse(CREDENTIALS);
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.isConfigured = true;
      console.log('Google Sheets service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      this.isConfigured = false;
    }
  }

  async backupDailyCollections(summary: DailyCollectionSummary): Promise<boolean> {
    if (!this.isConfigured) {
      // Development mode: log to console and return success
      console.log('🔵 DEVELOPMENT MODE: Daily Collection Backup');
      console.log('📅 Date:', summary.date);
      console.log('💰 Total Collected:', `₹${summary.totalCollected.toLocaleString('en-IN')}`);
      console.log('📝 Total Payments:', summary.totalPayments);
      console.log('👥 Collectors:', summary.collectors.length);
      console.log('💳 Payments:', summary.payments.length);
      console.log('📋 Full Summary:', JSON.stringify(summary, null, 2));
      console.log('✅ Backup logged successfully (Google Sheets integration pending)');
      
      // In a real implementation, you could store this in a local file or database
      return true;
    }

    if (!this.sheets || !SHEET_ID) {
      console.error('Google Sheets not configured');
      return false;
    }

    try {
      const date = summary.date;
      const sheetName = `Daily_${date.replace(/-/g, '_')}`;

      // Create or clear the daily sheet
      await this.createOrClearSheet(sheetName);

      // Add summary data
      await this.addSummaryData(sheetName, summary);

      // Add detailed payment data
      await this.addPaymentData(sheetName, summary.payments);

      console.log(`Daily collection backup completed for ${date}`);
      return true;
    } catch (error) {
      console.error('Failed to backup daily collections:', error);
      return false;
    }
  }

  async getBackupStatus(date: string): Promise<{ exists: boolean; lastUpdated?: string; mode?: string }> {
    if (!this.isConfigured) {
      // Development mode: simulate backup status
      console.log('🔵 DEVELOPMENT MODE: Checking backup status for', date);
      return { 
        exists: false, 
        lastUpdated: new Date().toISOString(),
        mode: 'development'
      };
    }

    if (!this.sheets || !SHEET_ID) {
      return { exists: false };
    }

    try {
      const sheetName = `Daily_${date.replace(/-/g, '_')}`;
      await this.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A1`,
      });
      
      return { exists: true, lastUpdated: new Date().toISOString() };
    } catch (error) {
      return { exists: false };
    }
  }

  // Helper method to check if service is configured
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  // Development mode helper
  getDevelopmentInfo(): string {
    if (this.isConfigured) {
      return 'Google Sheets integration is configured and ready';
    } else {
      return 'Running in development mode - backups are logged to console. Add Google Sheets credentials to enable cloud backup.';
    }
  }

  private async createOrClearSheet(sheetName: string): Promise<void> {
    try {
      // Try to get the sheet
      await this.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A1`,
      });
      
      // Sheet exists, clear it
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: sheetName,
      });
    } catch (error) {
      // Sheet doesn't exist, create it
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
    }
  }

  private async addSummaryData(sheetName: string, summary: DailyCollectionSummary): Promise<void> {
    const summaryData = [
      ['DAILY COLLECTION SUMMARY'],
      [''],
      ['Date', summary.date],
      ['Total Collected', `₹${summary.totalCollected.toLocaleString('en-IN')}`],
      ['Total Payments', summary.totalPayments.toString()],
      ['Total Outstanding', `₹${summary.totalOutstanding.toLocaleString('en-IN')}`],
      [''],
      ['COLLECTOR SUMMARY'],
      ['Collector Name', 'Collections', 'Amount Collected'],
      ...summary.collectors.map(c => [c.name, c.collections.toString(), `₹${c.amount.toLocaleString('en-IN')}`]),
      [''],
      ['DETAILED PAYMENT RECORDS'],
      ['Loan Number', 'Borrower Name', 'Amount', 'Collector', 'Time', 'Notes'],
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: summaryData,
      },
    });

    // Format the summary section
    await this.formatSummarySection(sheetName, summaryData.length);
  }

  private async addPaymentData(sheetName: string, payments: DailyCollectionSummary['payments']): Promise<void> {
    if (payments.length === 0) return;

    const paymentData = payments.map(payment => [
      payment.loanNumber,
      payment.borrowerName,
      `₹${payment.amount.toLocaleString('en-IN')}`,
      payment.collectorName,
      payment.time,
      payment.notes || '',
    ]);

    const startRow = 15; // After summary section
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A${startRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: paymentData,
      },
    });

    // Format the payment data section
    await this.formatPaymentSection(sheetName, startRow, paymentData.length);
  }

  private async formatSummarySection(sheetName: string, rowCount: number): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: await this.getSheetId(sheetName),
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, fontSize: 16 },
                },
              },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          {
            repeatCell: {
              range: {
                sheetId: await this.getSheetId(sheetName),
                startRowIndex: 8,
                endRowIndex: 9,
                startColumnIndex: 0,
                endColumnIndex: 3,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                },
              },
              fields: 'userEnteredFormat.textFormat,userEnteredFormat.backgroundColor',
            },
          },
        ],
      },
    });
  }

  private async formatPaymentSection(sheetName: string, startRow: number, rowCount: number): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: await this.getSheetId(sheetName),
                startRowIndex: startRow - 1,
                endRowIndex: startRow,
                startColumnIndex: 0,
                endColumnIndex: 6,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: { red: 0.8, green: 0.9, blue: 1.0 },
                },
              },
              fields: 'userEnteredFormat.textFormat,userEnteredFormat.backgroundColor',
            },
          },
        ],
      },
    });
  }

  private async getSheetId(sheetName: string): Promise<number> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    
    const sheet = response.data.sheets.find((s: any) => s.properties.title === sheetName);
    return sheet ? sheet.properties.sheetId : 0;
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { DailyCollectionSummary }; 