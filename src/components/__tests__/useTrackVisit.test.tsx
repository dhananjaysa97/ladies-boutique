import { render, waitFor } from '@testing-library/react';
import { useTrackVisit } from '@/hooks/useTrackeVisit';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

function TestComponent() {
  useTrackVisit();
  return null;
}

const SESSION_KEY = 'leenas-visitor-id';

describe('useTrackVisit', () => {
  beforeEach(() => {
    // Reset mocks and storage
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as any),
    );

    window.localStorage.clear();

    (window as any).crypto = {
      randomUUID: jest.fn(() => 'test-session-id'),
    };
  });

  it('creates a visitor id and posts to /api/track-visit when pathname is available', async () => {
    const { usePathname } = require('next/navigation') as {
      usePathname: jest.Mock;
    };
    usePathname.mockReturnValue('/test-path');

    render(<TestComponent />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Session ID stored
    expect(window.localStorage.getItem(SESSION_KEY)).toBe('test-session-id');

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/track-visit');

    const body = JSON.parse((options as any).body);
    expect(body).toMatchObject({
      path: '/test-path',
      sessionId: 'test-session-id',
    });
    expect((window as any).crypto.randomUUID).toHaveBeenCalledTimes(1);
  });

  it('reuses an existing visitor id without generating a new one', async () => {
    const { usePathname } = require('next/navigation') as {
      usePathname: jest.Mock;
    };
    usePathname.mockReturnValue('/another-path');

    window.localStorage.setItem(SESSION_KEY, 'existing-id');
    (window as any).crypto.randomUUID = jest.fn(() => 'should-not-be-used');

    render(<TestComponent />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Did not overwrite existing id
    expect(window.localStorage.getItem(SESSION_KEY)).toBe('existing-id');
    expect((window as any).crypto.randomUUID).not.toHaveBeenCalled();

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse((options as any).body);
    expect(body.sessionId).toBe('existing-id');
  });

  it('does not post when pathname is falsy', async () => {
    const { usePathname } = require('next/navigation') as {
      usePathname: jest.Mock;
    };
    usePathname.mockReturnValue(null);

    render(<TestComponent />);

    // Wait a tick for useEffect to run
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
