import { seededSearches } from '@sweep/mocks';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { CleanerSearchCard } from '@/home/CleanerSearchCard';

import { BidCard } from './BidCard';
import { SearchCard, createdLabel } from './SearchCard';
import { WhileYouWaitCard } from './WhileYouWaitCard';

/**
 * RNTL 14 + React 19: a `fireEvent` state update only lands on the next async flush, and two
 * events fired back to back without one wedge the render loop.
 */
const flush = () => new Promise((done) => setTimeout(done, 0));

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
