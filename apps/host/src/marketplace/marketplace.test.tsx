import { seededSearches } from '@sweep/mocks';
import type { Bid } from '@sweep/types';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { CleanerSearchCard } from '@/home/CleanerSearchCard';
import { flush } from '@/testing/flush';

import { BidCard } from './BidCard';
import { CleanerProfile, messagePreview } from './CleanerProfile';
import { PhotoGallery } from './PhotoGallery';
import { SearchCard, createdLabel } from './SearchCard';
import { WhileYouWaitCard } from './WhileYouWaitCard';

const [firstSearch] = seededSearches;
if (!firstSearch) throw new Error('the marketplace seed is empty');
const [firstBid] = firstSearch.bids;
if (!firstBid) throw new Error('the first seeded search has no bids');

describe('createdLabel', () => {
  it('reads "a minute ago" for something just posted, and counts up from there', () => {
    const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

    expect(createdLabel(ago(0))).toBe('Created a minute ago');
    expect(createdLabel(ago(20 * 60_000))).toBe('Created 20 minutes ago');
    expect(createdLabel(ago(60 * 60_000))).toBe('Created 1 hour ago');
    expect(createdLabel(ago(50 * 60 * 60_000))).toBe('Created 2 days ago');
  });
});

describe('SearchCard', () => {
  it('opens the bids list and expands the Search Summary in place', async () => {
    const onOpen = jest.fn();
    await render(<SearchCard search={firstSearch} onOpen={onOpen} />);

    expect(screen.getByText(firstSearch.propertyAlias)).toBeTruthy();
    expect(screen.getByText('Created a minute ago')).toBeTruthy();
    expect(screen.queryByTestId(`marketplace.search.${firstSearch.id}.summary.body`)).toBeNull();

    fireEvent.press(screen.getByTestId(`marketplace.search.${firstSearch.id}.summary`));
    await flush();

    expect(screen.getByTestId(`marketplace.search.${firstSearch.id}.summary.body`)).toBeTruthy();
    expect(screen.getByText('Bedrooms')).toBeTruthy();

    fireEvent.press(screen.getByTestId(`marketplace.search.${firstSearch.id}.open`));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe('SearchCard bid count', () => {
  it('counts the bids in the footer, and opens the search from the chip', async () => {
    const onOpen = jest.fn();
    await render(<SearchCard search={firstSearch} onOpen={onOpen} />);

    const testID = `marketplace.search.${firstSearch.id}`;
    expect(screen.getByTestId(`${testID}.bids`)).toBeTruthy();
    expect(screen.getByText(`${firstSearch.bids.length} Bids`)).toBeTruthy();

    fireEvent.press(screen.getByTestId(`${testID}.bids`));
    await flush();
    expect(onOpen).toHaveBeenCalled();
  });

  it('says "Waiting for Bids" until a cleaner bids', async () => {
    const waiting = { ...firstSearch, id: 'search-waiting', bids: [] };
    await render(<SearchCard search={waiting} onOpen={jest.fn()} />);

    expect(screen.getByTestId('marketplace.search.search-waiting.waiting')).toBeTruthy();
    expect(screen.queryByTestId('marketplace.search.search-waiting.bids')).toBeNull();
    expect(screen.getByText('Waiting for Bids')).toBeTruthy();
  });
});

describe('BidCard', () => {
  it('shows the cleaner, the rating, the review count and the price', async () => {
    await render(<BidCard bid={firstBid} />);

    expect(screen.getByText('Ramona')).toBeTruthy();
    expect(screen.getByText('Super Cleaner')).toBeTruthy();
    expect(screen.getByText('is also a Rental Handy Pro')).toBeTruthy();
    expect(screen.getByText('4.8')).toBeTruthy();
    expect(screen.getByText('22 reviews')).toBeTruthy();
    expect(screen.getByText('$100')).toBeTruthy();
    expect(screen.getByText('per project')).toBeTruthy();
    expect(screen.getByText('Chat to confirm availability')).toBeTruthy();
    expect(screen.getByText('Expires in 2 days')).toBeTruthy();
    expect(screen.getByTestId('bid-card.ramona.background-check')).toBeTruthy();
  });

  it('drops the Super Cleaner chip and the Handy Pro line for a cleaner without them', async () => {
    const aurea = firstSearch.bids.find((bid) => bid.cleaner.name === 'Aurea');
    if (!aurea) throw new Error('Aurea does not bid on the first seeded search');

    await render(<BidCard bid={aurea} />);

    expect(screen.queryByText('Super Cleaner')).toBeNull();
    expect(screen.queryByText('is also a Rental Handy Pro')).toBeNull();
    expect(screen.getByText('$150')).toBeTruthy();
  });
});

describe('WhileYouWaitCard', () => {
  it('lists the checklist and dismisses itself', async () => {
    const onDismiss = jest.fn();
    await render(<WhileYouWaitCard onDismiss={onDismiss} />);

    expect(screen.getByText('While you wait')).toBeTruthy();
    for (const label of [
      'Take a tour',
      'Request a Demo',
      'Link your Airbnb/PMS',
      'Add a payment method',
      'Add a checklist to your property',
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }

    fireEvent.press(screen.getByTestId('bids.while-you-wait.dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('CleanerSearchCard', () => {
  it('says "Waiting for Bids" instead of a chip until a cleaner bids', async () => {
    const waiting = { ...firstSearch, id: 'search-waiting', bids: [] };
    await render(
      <CleanerSearchCard
        searches={[waiting]}
        loading={false}
        onSeeAll={jest.fn()}
        onOpenSearch={jest.fn()}
        onFindCleaners={jest.fn()}
      />
    );

    expect(screen.getByTestId('home.cleaner-search.search-waiting.waiting')).toBeTruthy();
    expect(screen.queryByTestId('home.cleaner-search.search-waiting.bids')).toBeNull();
  });

  it('counts the searches and chips each one with its bids', async () => {
    const onOpenSearch = jest.fn();
    await render(
      <CleanerSearchCard
        searches={seededSearches}
        loading={false}
        onSeeAll={jest.fn()}
        onOpenSearch={onOpenSearch}
        onFindCleaners={jest.fn()}
      />
    );

    expect(screen.getByText(`Cleaner Search (${seededSearches.length})`)).toBeTruthy();
    expect(
      screen.getByTestId(`home.cleaner-search.${firstSearch.id}.bids`)
    ).toBeTruthy();
    expect(screen.getByText(`${firstSearch.bids.length} Bids`)).toBeTruthy();

    fireEvent.press(screen.getByTestId(`home.cleaner-search.${firstSearch.id}`));
    expect(onOpenSearch).toHaveBeenCalledWith(firstSearch.id);
  });

  it('holds the count back behind a skeleton while the store is loading', async () => {
    await render(
      <CleanerSearchCard
        searches={[]}
        loading
        onSeeAll={jest.fn()}
        onOpenSearch={jest.fn()}
        onFindCleaners={jest.fn()}
      />
    );

    expect(screen.getByTestId('home.cleaner-search-skeleton')).toBeTruthy();
    expect(screen.getByText('Cleaner Search')).toBeTruthy();
  });
});

describe('CleanerProfile', () => {
  /**
   * The header and the sticky footer both read the safe-area insets. `SafeAreaProvider` renders
   * nothing under jest-expo — it waits on a layout pass that never comes — so the test feeds the
   * context directly.
   */
  const insets = { top: 59, left: 0, right: 0, bottom: 34 };

  const money = (amount: number) =>
    amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const profile = (bid: Bid) =>
    render(
      <SafeAreaInsetsContext.Provider value={insets}>
        <CleanerProfile bid={bid} propertyAlias="Beach apartment" onBack={jest.fn()} />
      </SafeAreaInsetsContext.Provider>
    );

  /**
   * One render per cleaner, as separate tests rather than a loop: RNTL 14 wedges when a tree is
   * unmounted and another rendered in the same test, and every later render comes back empty.
   */
  it.each(firstSearch.bids.map((bid) => [bid.cleaner.name, bid] as const))(
    'renders every section for %s',
    async (_name, bid) => {
      const { cleaner } = bid;
      await profile(bid);

      expect(screen.getByTestId('cleaner.information')).toBeTruthy();
      expect(screen.getByText('Information')).toBeTruthy();
      expect(screen.getByText(`${cleaner.completedProjects}`)).toBeTruthy();
      expect(screen.getByText(cleaner.location)).toBeTruthy();
      expect(screen.getByText(`${cleaner.distanceMiles} miles away`)).toBeTruthy();
      expect(screen.getByText(cleaner.memberSince)).toBeTruthy();

      expect(screen.getByText('Message from Cleaner')).toBeTruthy();
      expect(screen.getByText('Badges')).toBeTruthy();
      expect(screen.getByText('Background Checked')).toBeTruthy();
      expect(screen.getByText('Reviews')).toBeTruthy();
      expect(screen.getByText(`(${cleaner.reviewCount} reviews)`)).toBeTruthy();
      expect(screen.getByText(`Photos of ${cleaner.name}'s work`)).toBeTruthy();
      expect(screen.getAllByTestId(/^cleaner\.photo\.\d+$/)).toHaveLength(cleaner.workPhotos.length);

      // Aurea carries neither the chip nor the Handy Pro rows; the screen renders without them.
      expect(screen.queryByText('Super Cleaner') !== null).toBe(cleaner.superCleaner);
      expect(screen.queryByTestId('cleaner.handy-pro') !== null).toBe(cleaner.rentalHandyPro);
      expect(screen.queryByTestId('cleaner.rental-handy-pro') !== null).toBe(cleaner.rentalHandyPro);

      // Read-only: the three actions render and none of them is wired to anything.
      expect(screen.getByTestId('cleaner.chat')).toBeTruthy();
      expect(screen.getByTestId('cleaner.accept')).toBeTruthy();
      expect(screen.getByTestId('cleaner.reject')).toBeTruthy();
      expect(screen.getByText('Accept Bid and Add to My Team')).toBeTruthy();
      expect(screen.getByText('Reject Bid')).toBeTruthy();
      expect(screen.getByText(money(bid.price))).toBeTruthy();
    }
  );

  it('truncates the message on a word boundary, and only when there is more to show', () => {
    expect(messagePreview('short enough')).toBeNull();
    // 40 characters, so the cut lands inside "quick" and backs up to the space before it.
    expect(messagePreview('the quick brown fox jumps over the lazy dog', 8)).toBe('the… ');
  });

  it('shows and hides the cleaner’s message', async () => {
    const { cleaner } = firstBid;
    const preview = messagePreview(cleaner.message);
    if (!preview) throw new Error('the seeded message is too short to expand');

    await profile(firstBid);

    expect(screen.getByText('Show')).toBeTruthy();
    expect(screen.queryByText('Hide')).toBeNull();

    fireEvent.press(screen.getByTestId('cleaner.message'));
    await flush();

    expect(screen.getByText('Hide')).toBeTruthy();
    expect(screen.queryByText('Show')).toBeNull();
    // The toggle is a nested `Text`, so the paragraph reads as one node ending in "Hide".
    expect(screen.getByText(`${cleaner.message} Hide`)).toBeTruthy();

    fireEvent.press(screen.getByTestId('cleaner.message'));
    await flush();

    expect(screen.getByText('Show')).toBeTruthy();
  });

  it('expands the price card’s More', async () => {
    await profile(firstBid);

    expect(screen.getByText('$100.00')).toBeTruthy();
    expect(screen.getByText('per Project + Fees')).toBeTruthy();
    expect(screen.getByText('Cleaner Bid')).toBeTruthy();
    expect(screen.queryByTestId('cleaner.price.breakdown')).toBeNull();

    fireEvent.press(screen.getByTestId('cleaner.price.more'));
    await flush();

    expect(screen.getByTestId('cleaner.price.breakdown')).toBeTruthy();
    expect(screen.getByText('Added at checkout')).toBeTruthy();
    expect(screen.getByText('Less')).toBeTruthy();
  });

  it('does not carry the "How Adding a Cleaner to My Team Works" row', async () => {
    // Removed on request: that card belongs to the search wizard, not the cleaner's profile.
    await profile(firstBid);

    expect(screen.queryByText('How Adding a Cleaner to My Team Works')).toBeNull();
    expect(screen.queryByTestId('cleaner.info')).toBeNull();
  });
});

describe('PhotoGallery', () => {
  const photos = [1, 2, 3].map(() => ({ uri: 'x' }));

  it('opens at the photo that was tapped and steps forward and back', async () => {
    await render(
      <PhotoGallery photos={photos} initialIndex={1} onClose={jest.fn()} testID="g" />
    );

    expect(screen.getByTestId('g.counter')).toHaveTextContent('2 / 3');

    fireEvent.press(screen.getByTestId('g.next'));
    await flush();
    expect(screen.getByTestId('g.counter')).toHaveTextContent('3 / 3');

    fireEvent.press(screen.getByTestId('g.prev'));
    await flush();
    expect(screen.getByTestId('g.counter')).toHaveTextContent('2 / 3');
  });

  it('hides the arrow at each end rather than leaving it inert', async () => {
    await render(
      <PhotoGallery photos={photos} initialIndex={0} onClose={jest.fn()} testID="g" />
    );

    expect(screen.queryByTestId('g.prev')).toBeNull();
    expect(screen.getByTestId('g.next')).toBeTruthy();

    fireEvent.press(screen.getByTestId('g.next'));
    await flush();
    fireEvent.press(screen.getByTestId('g.next'));
    await flush();

    expect(screen.getByTestId('g.prev')).toBeTruthy();
    expect(screen.queryByTestId('g.next')).toBeNull();
  });

  it('closes', async () => {
    const onClose = jest.fn();
    await render(
      <PhotoGallery photos={photos} initialIndex={0} onClose={onClose} testID="g" />
    );

    fireEvent.press(screen.getByTestId('g.close'));

    expect(onClose).toHaveBeenCalled();
  });
});
