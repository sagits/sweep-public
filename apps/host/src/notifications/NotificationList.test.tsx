import { seededNotifications } from '@sweep/mocks';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { flush } from '@/testing/flush';

import { NotificationList } from './NotificationList';

const [firstNotification] = seededNotifications;
if (!firstNotification) throw new Error('the notification seed is empty');

const read = seededNotifications.map((notification) => ({ ...notification, read: true }));

describe('NotificationList', () => {
  it('renders a row per notification, with its relative stamp', async () => {
    await render(
      <NotificationList notifications={seededNotifications} loading={false} onMarkAllRead={jest.fn()} />,
    );

    for (const notification of seededNotifications) {
      expect(screen.getByTestId(`notifications.row.${notification.id}`)).toBeTruthy();
      expect(screen.getByText(notification.message)).toBeTruthy();
      expect(screen.getByTestId(`notifications.row.${notification.id}.stamp`)).toBeTruthy();
    }
  });

  it('filters the list on the message as the host types', async () => {
    await render(
      <NotificationList notifications={seededNotifications} loading={false} onMarkAllRead={jest.fn()} />,
    );

    fireEvent.changeText(screen.getByTestId('notifications.search'), 'unassigned');
    await flush();

    expect(screen.getByTestId('notifications.row.notification-2')).toBeTruthy();
    expect(screen.queryByTestId('notifications.row.notification-1')).toBeNull();
    expect(screen.queryByTestId('notifications.row.notification-3')).toBeNull();
  });

  it('matches regardless of case, and says so when nothing matches', async () => {
    await render(
      <NotificationList notifications={seededNotifications} loading={false} onMarkAllRead={jest.fn()} />,
    );

    fireEvent.changeText(screen.getByTestId('notifications.search'), 'RAMONA');
    await flush();
    expect(screen.getByTestId('notifications.row.notification-3')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('notifications.search'), 'nothing matches this');
    await flush();
    expect(screen.getByTestId('notifications.empty')).toBeTruthy();
  });

  it('marks the whole list read from its own row', async () => {
    const onMarkAllRead = jest.fn();
    await render(
      <NotificationList
        notifications={seededNotifications}
        loading={false}
        onMarkAllRead={onMarkAllRead}
      />,
    );

    fireEvent.press(screen.getByTestId('notifications.mark-all-read'));
    await flush();

    expect(onMarkAllRead).toHaveBeenCalled();
  });

  it('keeps rendering every row once they are all read', async () => {
    // The mint tint itself is layout, which ADR-0001 keeps out of both test seams — what is
    // worth pinning is that marking read does not drop rows out of the list.
    await render(<NotificationList notifications={read} loading={false} onMarkAllRead={jest.fn()} />);

    expect(screen.getByTestId(`notifications.row.${firstNotification.id}`)).toBeTruthy();
    expect(screen.getAllByTestId(/^notifications\.row\.[^.]+$/)).toHaveLength(read.length);
  });

  it('loads behind skeletons', async () => {
    await render(<NotificationList notifications={[]} loading onMarkAllRead={jest.fn()} />);

    expect(screen.getByTestId('notifications.skeleton')).toBeTruthy();
    expect(screen.queryByTestId('notifications.list')).toBeNull();
  });
});
