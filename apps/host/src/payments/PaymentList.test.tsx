import { seededPayments } from '@sweep/mocks';
import { render, screen } from '@testing-library/react-native';

import { PaymentList } from './PaymentList';

describe('PaymentList', () => {
  it('shows cleaner, property, amount and a Paid pill on every row', async () => {
    await render(<PaymentList payments={seededPayments} loading={false} />);

    for (const payment of seededPayments) {
      expect(screen.getByTestId(`payments.row.${payment.id}`)).toBeTruthy();
      expect(screen.getAllByText(payment.cleanerName).length).toBeGreaterThan(0);
      expect(screen.getAllByText(payment.propertyAlias).length).toBeGreaterThan(0);
      // The date-over-time stamp on the right of the row.
      expect(screen.getByTestId(`payments.row.${payment.id}.stamp`)).toBeTruthy();
    }
    expect(screen.getAllByText('$100.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Paid')).toHaveLength(seededPayments.length);
  });

  it('loads behind skeletons', async () => {
    await render(<PaymentList payments={[]} loading />);

    expect(screen.getByTestId('payments.skeleton')).toBeTruthy();
    expect(screen.queryByTestId('payments.list')).toBeNull();
  });

  it('falls back to screenshot 22 folder empty state once the list is cleared', async () => {
    await render(<PaymentList payments={[]} loading={false} />);

    expect(screen.getByTestId('payments.empty-folder')).toBeTruthy();
    expect(screen.getByText("You don't have any payment history yet.")).toBeTruthy();
  });
});
