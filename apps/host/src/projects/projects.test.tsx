import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { seededProperties } from '@sweep/mocks';
import type { NewProject } from '@sweep/types';

import { flush } from '@/testing/flush';
import { useProperties } from '@/stores/useProperties';

import { ManualProjectDialog } from './ManualProjectDialog';
import { NewManualProjectForm } from './NewManualProjectForm';

describe('New Manual Project form', () => {
  it('lists every registered property in the picker, including one just added', async () => {
    // ADR-0001's TDD seam: adding a property makes it available to the project form's picker.
    useProperties.setState({ properties: seededProperties, loading: false, loaded: true });
    const registered = await useProperties.getState().add({
      ...seededProperties[0]!,
      alias: 'Beach house',
    });

    await render(
      <NewManualProjectForm
        properties={useProperties.getState().properties}
        onCreate={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    fireEvent.press(screen.getByTestId('project-form.property'));
    await screen.findByTestId('project-form.property.options');

    for (const alias of [...seededProperties.map((one) => one.alias), registered.alias]) {
      expect(screen.getByTestId(`project-form.property.option.${alias}`)).toBeTruthy();
    }
  });

  it('carries the four sections the PRD lists', async () => {
    await render(
      <NewManualProjectForm
        properties={seededProperties}
        onCreate={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    for (const section of ['Project and Property', 'Payment', 'Project Details', 'About the Cleaning']) {
      expect(screen.getByText(section)).toBeTruthy();
    }
    expect(screen.getByTestId('project-form.type')).toBeTruthy();
    expect(screen.getByTestId('project-form.name')).toBeTruthy();
    expect(screen.getByTestId('project-form.price.teammate')).toBeSelected();
    expect(screen.getByTestId('project-form.price.custom')).not.toBeSelected();
    expect(screen.getByTestId('project-form.frequency')).toBeTruthy();
    expect(screen.getByTestId('project-form.start-date')).toBeTruthy();
    expect(screen.getByTestId('project-form.start-time')).toBeTruthy();
    expect(screen.getByTestId('project-form.end-date')).toBeTruthy();
    expect(screen.getByTestId('project-form.end-time')).toBeTruthy();
    expect(screen.getByTestId('project-form.guest-same-day')).toBeTruthy();
    expect(screen.getByTestId('project-form.restrict')).toBeTruthy();
    expect(screen.getByTestId('project-form.checklist')).toBeTruthy();
    expect(screen.getByTestId('project-form.visible')).toBeTruthy();
    expect(screen.getByText('Add manual project')).toBeTruthy();
  });

  it('spins the submit button, then hands over the project it built', async () => {
    let release: (() => void) | undefined;
    let input: NewProject | undefined;
    const onCreate = jest.fn((next: NewProject) => {
      input = next;
      return new Promise<void>((done) => {
        release = done;
      });
    });
    await render(
      <NewManualProjectForm
        properties={seededProperties}
        onCreate={onCreate}
        onCancel={jest.fn()}
      />
    );

    const second = seededProperties[1]!;
    fireEvent.press(screen.getByTestId('project-form.property'));
    await flush();
    fireEvent.press(screen.getByTestId(`project-form.property.option.${second.alias}`));
    await flush();

    // A date preset three days out, and a time preset off the same styled list.
    fireEvent.press(screen.getByTestId('project-form.start-date'));
    await flush();
    const dateOption = screen.getAllByTestId(/^project-form\.start-date\.option\./)[3]!;
    const chosenDate = dateOption.props.testID.replace('project-form.start-date.option.', '');
    fireEvent.press(dateOption);
    await flush();

    fireEvent.press(screen.getByTestId('project-form.submit'));
    await flush();

    expect(screen.getByTestId('project-form.submit.spinner')).toBeTruthy();
    expect(onCreate).toHaveBeenCalledTimes(1);

    expect(input).toMatchObject({
      propertyAlias: second.alias,
      cleanerName: null,
      name: 'Manual Project',
      manual: true,
      visible: true,
    });
    // The property has no unit, so the address is carried across unchanged.
    expect(input?.propertyAddress).toBe(second.address);

    const startsAt = new Date(input!.startsAt);
    expect(
      `${startsAt.toLocaleDateString('en-US', { month: 'short' })} ${`${startsAt.getDate()}`.padStart(2, '0')}, ${startsAt.getFullYear()}`
    ).toBe(chosenDate);
    expect(startsAt.getHours()).toBe(11);
    expect(new Date(input!.endsAt).getHours()).toBe(15);

    release?.();
    // Waiting the spinner out keeps the resolution inside act(), and pins that it clears.
    await waitFor(() => expect(screen.queryByTestId('project-form.submit.spinner')).toBeNull());
  });
});

describe('ManualProjectDialog', () => {
  const open = (props: Partial<React.ComponentProps<typeof ManualProjectDialog>> = {}) =>
    render(
      <ManualProjectDialog
        visible
        onCreate={jest.fn()}
        onCancel={jest.fn()}
        onHideForever={jest.fn()}
        testID="projects.manual-dialog"
        {...props}
      />
    );

  it('hides itself for good only when the box is ticked', async () => {
    const onHideForever = jest.fn();
    await open({ onHideForever });

    fireEvent.press(screen.getByTestId('projects.manual-dialog.cancel'));
    await flush();
    expect(onHideForever).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('projects.manual-dialog.hide'));
    await flush();
    fireEvent.press(screen.getByTestId('projects.manual-dialog.create'));
    await flush();

    expect(onHideForever).toHaveBeenCalled();
  });
});
