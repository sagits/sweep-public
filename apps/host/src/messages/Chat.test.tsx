import { seededSearches } from '@sweep/mocks';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { flush } from '@/testing/flush';

import { BidStrip, ChatBody, ChatHeader } from './Chat';

const [firstSearch] = seededSearches;
if (!firstSearch) throw new Error('the marketplace seed is empty');
const [firstBid] = firstSearch.bids;
if (!firstBid) throw new Error('the first seeded search has no bids');

const insets = { top: 47, bottom: 34, left: 0, right: 0 };

const withInsets = (node: React.ReactElement) => (
  <SafeAreaInsetsContext.Provider value={insets}>{node}</SafeAreaInsetsContext.Provider>
);

describe('ChatHeader', () => {
  it('names the cleaner over when they were last seen, and goes back', async () => {
    const onBack = jest.fn();
    await render(withInsets(<ChatHeader cleaner={firstBid.cleaner} onBack={onBack} />));

    expect(screen.getByText('Ramona')).toBeTruthy();
    expect(screen.getByText('Last seen Yesterday, 11:36 PM')).toBeTruthy();

    fireEvent.press(screen.getByTestId('chat.header.back'));
    await flush();
    expect(onBack).toHaveBeenCalled();
  });
});

describe('BidStrip', () => {
  it('shows the property, the price with cents and the expiry, and opens the bid details', async () => {
    const onDetails = jest.fn();
    await render(
      withInsets(
        <BidStrip bid={firstBid} propertyAlias={firstSearch.propertyAlias} onDetails={onDetails} />,
      ),
    );

    expect(screen.getByText(firstSearch.propertyAlias)).toBeTruthy();
    expect(screen.getByText('$100.00 per project')).toBeTruthy();
    expect(screen.getByText('Bid expires in:')).toBeTruthy();
    expect(screen.getByTestId('chat.expiry')).toHaveTextContent(
      `${firstBid.expiresInDays} days`,
    );

    fireEvent.press(screen.getByTestId('chat.bid-details'));
    await flush();
    expect(onDetails).toHaveBeenCalled();
  });
});

describe('ChatBody', () => {
  it('opens on the chat rules, with no composer yet', async () => {
    await render(withInsets(<ChatBody />));

    expect(screen.getByText('How to use our chat')).toBeTruthy();
    expect(screen.getByText('Ask questions')).toBeTruthy();
    expect(screen.getByText("Don't share contact information")).toBeTruthy();
    expect(screen.getByText("Accept the cleaner's bid")).toBeTruthy();
    expect(
      screen.getByText(
        'This chat is monitored by our Customer Support team for quality assurance.',
      ),
    ).toBeTruthy();
    expect(screen.queryByTestId('chat.composer')).toBeNull();
  });

  it('swaps the rules for the account-setup card and a disabled composer on "I agree"', async () => {
    await render(withInsets(<ChatBody />));

    fireEvent.press(screen.getByTestId('chat.agree'));
    await flush();

    expect(screen.queryByText('How to use our chat')).toBeNull();
    expect(screen.queryByTestId('chat.agree')).toBeNull();
    expect(screen.getByText('Finish setting up your account')).toBeTruthy();
    expect(screen.getByTestId('chat.setup-account')).toBeTruthy();

    const composer = screen.getByTestId('chat.composer');
    expect(composer).toHaveProp('editable', false);
    expect(composer).toHaveProp(
      'placeholder',
      'Please finish setting up your account to chat with this cleaner',
    );
  });
});
