import { toast, type ExternalToast } from 'sonner';
import { deleteWithUndo } from './deleteWithUndo';

jest.mock('sonner', () => ({
  toast: Object.assign(
    jest.fn(() => 'delete-toast'),
    {
      dismiss: jest.fn(),
      error: jest.fn(),
    }
  ),
}));

describe('deleteWithUndo', () => {
  const url = '/api/admin/people/user:officer-id';
  const restore = jest.fn();
  const fetchMock = jest.mocked(fetch);

  const toastOptions = () => jest.mocked(toast).mock.calls[0][1]!;
  const undo = (options: ExternalToast) => {
    const action = options.action;
    if (!action || typeof action !== 'object' || !('onClick' in action)) {
      throw new Error('Missing Undo action');
    }
    action.onClick({} as React.MouseEvent<HTMLButtonElement>);
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    fetchMock.mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('commits after five seconds without relying on toast callbacks', () => {
    deleteWithUndo(url, 'Officer', restore);
    expect(fetchMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(5000);

    expect(fetchMock).toHaveBeenCalledWith(url, {
      method: 'DELETE',
      keepalive: true,
    });
    expect(toast.dismiss).toHaveBeenCalledWith('delete-toast');
  });

  it('commits pending deletes when refreshing or leaving the page', () => {
    deleteWithUndo(url, 'Officer', restore);
    window.dispatchEvent(new Event('pagehide'));
    jest.advanceTimersByTime(5000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(url, {
      method: 'DELETE',
      keepalive: true,
    });
  });

  it('Undo cancels both the timer and page-exit commit', () => {
    deleteWithUndo(url, 'Officer', restore);
    undo(toastOptions());
    window.dispatchEvent(new Event('pagehide'));
    jest.advanceTimersByTime(5000);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(restore).toHaveBeenCalledTimes(1);
  });

  it('commits only once even if multiple close events fire', async () => {
    deleteWithUndo(url, 'Officer', restore);
    const options = toastOptions();
    await options.onDismiss?.({ id: 'delete-toast' });
    await options.onAutoClose?.({ id: 'delete-toast' });
    undo(options);
    window.dispatchEvent(new Event('pagehide'));
    jest.advanceTimersByTime(5000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(restore).not.toHaveBeenCalled();
  });

  it('keeps separate deletions independent when one is undone', () => {
    deleteWithUndo(url, 'Officer', restore);
    const firstOptions = toastOptions();
    deleteWithUndo(
      '/api/admin/people/alumni:second-id',
      'Second officer',
      restore
    );
    undo(firstOptions);
    window.dispatchEvent(new Event('pagehide'));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/people/alumni:second-id',
      { method: 'DELETE', keepalive: true }
    );
  });

  it.each(['server', 'network'])('restores on a %s failure', async failure => {
    if (failure === 'server') {
      fetchMock.mockResolvedValueOnce({ ok: false } as Response);
    } else {
      fetchMock.mockRejectedValueOnce(new Error('Offline'));
    }

    deleteWithUndo(url, 'Officer', restore);
    await toastOptions().onDismiss?.({ id: 'delete-toast' });

    expect(restore).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Failed to delete — restoring');
  });
});
