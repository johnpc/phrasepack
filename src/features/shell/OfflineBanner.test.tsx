import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const online = vi.hoisted(() => ({ value: true }));
vi.mock('../../lib/useOnlineStatus', () => ({ useOnlineStatus: () => online.value }));

import { OfflineBanner } from './OfflineBanner';

describe('OfflineBanner', () => {
  it('renders nothing when online', () => {
    online.value = true;
    const { container } = render(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the banner when offline', () => {
    online.value = false;
    render(<OfflineBanner />);
    expect(screen.getByTestId('offline-banner')).toHaveTextContent('offline');
  });
});
