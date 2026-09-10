import { seededSearches } from '@sweep/mocks';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { flush } from '@/testing/flush';

import { MessageList } from './MessageList';

const bids = seededSearches.flatMap((search) => search.bids);
const [firstBid] = bids;
if (!firstBid) throw new Error('the marketplace seed has no bids');

describe('MessageList', () => {
  it('shows one row per bid across every open search', async () => {
    await render(<MessageList searches={seededSearches} loading={false} onOpen={jest.fn()} />);

    expect(screen.getAllByTestId(/^messages\.row\./)).toHaveLength(bids.length);
    for (const bid of bids) {
      expect(screen.getByTestId(`messages.row.${bid.id}`)).toBeTruthy();
    }
    expect(screen.getAllByText('Bid Pending')).toHaveLength(bids.length);
    expect(screen.getAllByText('No messages yet.')).toHaveLength(bids.length);
    expect(screen.getAllByText(firstBid.cleaner.name).length).toBeGreaterThan(0);
  });

  it('opens the chat for the bid whose row was pressed', async () => {
    const onOpen = jest.fn();
    await render(<MessageList searches={seededSearches} loading={false} onOpen={onOpen} />);

    fireEvent.press(screen.getByTestId(`messages.row.${firstBid.id}`));
    await flush();

    expect(onOpen).toHaveBeenCalledWith(firstBid.id);
  });

  it("falls back to the Marketplace's empty state when nothing has been bid on", async () => {
    await render(<MessageList searches={[]} loading={false} onOpen={jest.fn()} />);

    expect(screen.getByTestId('marketplace.empty')).toBeTruthy();
    expect(screen.queryByTestId(/^messages\.row\./)).toBeNull();
    // Messages pins its own "Find a Cleaner in the Marketplace"; the borrowed empty state must
    // not ship a second, undeclared navigation next to it.
    expect(screen.queryByTestId('marketplace.find-cleaner')).toBeNull();
  });

  it('holds the empty state back behind skeletons until the searches arrive', async () => {
    // An empty store is "not yet", not "no bids" — without this the Marketplace empty state
    // flashes over the rows on every cold open.
    await render(<MessageList searches={[]} loading onOpen={jest.fn()} />);

    expect(screen.getByTestId('messages.skeleton')).toBeTruthy();
    expect(screen.queryByTestId('marketplace.empty')).toBeNull();
    expect(screen.queryByTestId('messages.list')).toBeNull();
  });
});
