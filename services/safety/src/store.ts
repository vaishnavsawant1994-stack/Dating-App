import { type CreateSafetyReportInput, type SafetyReportRecord, type SafetyReportStore } from './types.js';

export class DisabledSafetyReportStore implements SafetyReportStore {
  readonly name = 'disabled';

  async isReady(): Promise<boolean> {
    return false;
  }

  async createReport(): Promise<SafetyReportRecord> {
    throw new Error('Safety report persistence is not configured.');
  }
}

export class InMemorySafetyReportStore implements SafetyReportStore {
  readonly name = 'memory-test-only';
  private readonly records = new Map<string, SafetyReportRecord>();

  async isReady(): Promise<boolean> {
    return true;
  }

  async createReport(input: CreateSafetyReportInput): Promise<SafetyReportRecord> {
    if (this.records.has(input.reportId)) {
      throw new Error('Duplicate safety report ID.');
    }
    const record: SafetyReportRecord = { ...input, status: 'received' };
    this.records.set(input.reportId, record);
    return record;
  }

  get(reportId: string): SafetyReportRecord | undefined {
    return this.records.get(reportId);
  }
}
