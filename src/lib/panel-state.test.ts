import { EMPTY_PANEL, closePanel, openPanel, panelItem } from './panel-state';

describe('PanelState', () => {
  it('keeps the item after closing for the exit animation', () => {
    const open = openPanel('a');
    const closed = closePanel(open);
    expect(closed).toEqual({ status: 'closed', item: 'a' });
    expect(panelItem(closed)).toBe('a');
  });

  it('ignores close when not open', () => {
    expect(closePanel(EMPTY_PANEL)).toBe(EMPTY_PANEL);
    const closed = closePanel(openPanel('a'));
    expect(closePanel(closed)).toBe(closed);
    expect(panelItem(EMPTY_PANEL)).toBeNull();
  });

  it('replaces the item when reopened', () => {
    expect(openPanel('b')).toEqual({ status: 'open', item: 'b' });
  });
});
