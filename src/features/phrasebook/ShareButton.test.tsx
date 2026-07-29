import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { LanguageRecord } from '../../lib/dataClient';

const e = vi.hoisted(() => ({ sharePack: vi.fn(), showToast: vi.fn() }));
vi.mock('./shareEdge', () => ({ sharePack: e.sharePack }));
vi.mock('../shell/toastBus', () => ({ showToast: e.showToast }));

import { ShareButton } from './ShareButton';

const lang = { id: 'lang-es-es', name: 'Spanish (Spain)' } as LanguageRecord;

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shares the pack and toasts on copy', async () => {
    e.sharePack.mockResolvedValue('copied');
    render(<ShareButton language={lang} />);
    screen.getByTestId('share-pack').click();
    await waitFor(() =>
      expect(e.showToast).toHaveBeenCalledWith(expect.stringContaining('copied')),
    );
  });

  it('does not toast when the native sheet handled it', async () => {
    e.sharePack.mockResolvedValue('shared');
    render(<ShareButton language={lang} />);
    screen.getByTestId('share-pack').click();
    await waitFor(() => expect(e.sharePack).toHaveBeenCalled());
    expect(e.showToast).not.toHaveBeenCalled();
  });
});
