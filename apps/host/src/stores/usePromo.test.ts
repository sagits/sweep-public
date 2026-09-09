import { usePromo } from './usePromo';

describe('usePromo', () => {
  beforeEach(() => usePromo.setState({ dismissed: false }));

  it('starts visible', () => {
    expect(usePromo.getState().dismissed).toBe(false);
  });

  it('stays dismissed once the "Don\'t show this anymore" box is ticked', () => {
    usePromo.getState().dismiss();

    expect(usePromo.getState().dismissed).toBe(true);

    // Nothing un-dismisses it for the rest of the session.
    usePromo.getState().dismiss();
    expect(usePromo.getState().dismissed).toBe(true);
  });
});
