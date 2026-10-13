import { describe, expect, it } from 'vitest';
import { InMemorySafetyReportStore } from '../src/store.js';

describe('InMemorySafetyReportStore', () => {
  it('stores the derived reporter identity and refuses duplicate report IDs', async () => {
    const store = new InMemorySafetyReportStore();
    const input = {
      reportId: 'report-1',
      reporterUserId: 'user-1',
      targetType: 'user',
      targetId: 'target-1',
      category: 'spam',
      relatedEntityRefs: [],
      createdAt: '2026-10-14T00:00:00.000Z',
    } as const;
    await expect(store.createReport(input)).resolves.toMatchObject({ status: 'received', reporterUserId: 'user-1' });
    await expect(store.createReport(input)).rejects.toThrow(/duplicate/i);
  });
});
