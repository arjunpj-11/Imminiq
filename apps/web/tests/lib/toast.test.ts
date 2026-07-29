import { describe, expect, it } from 'vitest';

import {
  dismissToast,
  subscribeToToasts,
  toast,
  updateToast,
  type IToastRecord,
} from '../../src/lib/toast';

describe('shared toast notifications', () => {
  it('publishes transient action feedback with the expected tone and description', () => {
    const records: IToastRecord[] = [];
    const unsubscribe = subscribeToToasts((event) => {
      if (event.type === 'upsert') records.push(event.toast);
    });

    toast.success('Tracker merged', 'The accepted topics are now in the original tracker.');
    toast.error('Message not sent', 'Please reconnect and try again.');
    unsubscribe();

    expect(records).toMatchObject([
      {
        title: 'Tracker merged',
        description: 'The accepted topics are now in the original tracker.',
        tone: 'success',
        duration: 4200,
      },
      {
        title: 'Message not sent',
        description: 'Please reconnect and try again.',
        tone: 'error',
        duration: 5600,
      },
    ]);
  });

  it('updates and dismisses a persistent notification by id', () => {
    const events: Array<{ type: string; id: number }> = [];
    const unsubscribe = subscribeToToasts((event) => {
      events.push({
        type: event.type,
        id: event.type === 'clear' ? -1 : event.type === 'dismiss' ? event.id : event.toast.id,
      });
    });

    const id = toast.loading('Saving changes');
    updateToast(id, { title: 'Changes saved', tone: 'success' });
    dismissToast(id);
    unsubscribe();

    expect(events).toEqual([
      { type: 'upsert', id },
      { type: 'upsert', id },
      { type: 'dismiss', id },
    ]);
  });
});
