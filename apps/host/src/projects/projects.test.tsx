import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { seededProjects, seededProperties } from '@sweep/mocks';
import type { NewProject } from '@sweep/types';

import ProjectsScreen from '../../app/(tabs)/projects';
import ProjectDetailScreen from '../../app/project/[id]';
import NewProjectScreen from '../../app/project/new';
import { useProjects } from '@/stores/useProjects';
import { useProperties } from '@/stores/useProperties';
import { NewManualProjectForm } from './NewManualProjectForm';
import { dayKey } from './days';

jest.mock('react-native-safe-area-context', () =>
  // A jest.mock factory is hoisted above the imports, so it has to require.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-native-safe-area-context/jest/mock').default
);

const mockNavigate = jest.fn();
const mockParams: { id?: string } = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({
    navigate: mockNavigate,
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
}));

/**
 * RNTL 14 on React 19: a `fireEvent` state update only lands on the next async flush, and two
 * events fired back to back without one wedge the render loop. Every interaction is followed by
 * a flush, either this one or a `findBy*`/`waitFor`.
 */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const reset = () =>
  useProjects.setState({
    projects: [],
    loading: false,
    loaded: false,
    manualDialogHidden: false,
  });

describe('Projects calendar', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    reset();
  });

  it('mounts into skeleton sections, then lays the seeded projects out on their own days', async () => {
    await render(<ProjectsScreen />);

    expect(screen.getByTestId('projects.skeleton')).toBeTruthy();

    await waitFor(() => expect(screen.queryByTestId('projects.skeleton')).toBeNull(), {
      timeout: 3000,
    });

    for (const project of seededProjects) {
      const row = screen.getByTestId(`projects.row.${project.id}`);
      expect(row).toBeTruthy();
      // …inside the section for the day it starts, and only that one.
      const section = screen.getByTestId(`projects.section.${dayKey(project.startsAt)}`);
      expect(section).toContainElement(row);
    }

    expect(screen.getAllByText(/^Today - /)).toHaveLength(1);
    expect(screen.getAllByText(/^Tomorrow - /)).toHaveLength(1);
  });

  it('carries the header, month navigator and week strip from the reference', async () => {
    useProjects.setState({ loaded: true });
    await render(<ProjectsScreen />);

    expect(screen.getByTestId('projects.title')).toBeTruthy();
    expect(screen.getByTestId('projects.add')).toBeTruthy();
    expect(screen.getByTestId('projects.filter')).toBeTruthy();
    expect(screen.getByTestId('projects.refresh')).toBeTruthy();
    expect(screen.getByTestId('projects.month')).toBeTruthy();
    expect(screen.getByTestId('projects.drag-handle')).toBeTruthy();

    for (const weekday of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      expect(screen.getByText(weekday)).toBeTruthy();
    }
    // Today's square is the selected one.
    expect(screen.getByTestId(`projects.day.${dayKey(new Date())}`)).toBeSelected();
  });

  it('opens a project from its row', async () => {
    await render(<ProjectsScreen />);
    const first = seededProjects[0]!;
    await screen.findByTestId(`projects.row.${first.id}`, undefined, { timeout: 3000 });

    fireEvent.press(screen.getByTestId(`projects.row.${first.id}`));

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/project/[id]',
      params: { id: first.id },
    });
  });

  it('opens the automatic-vs-manual dialog from +, and remembers it was dismissed for good', async () => {
    useProjects.setState({ loaded: true });
    await render(<ProjectsScreen />);

    fireEvent.press(screen.getByTestId('projects.add'));
    await screen.findByTestId('projects.manual-dialog');

    expect(screen.getByText('Automatic vs. Manual Projects')).toBeTruthy();
    expect(screen.getByText("Don't show this message again")).toBeTruthy();

    fireEvent.press(screen.getByTestId('projects.manual-dialog.hide'));
    await flush();
    fireEvent.press(screen.getByTestId('projects.manual-dialog.create'));
    await flush();

    expect(mockNavigate).toHaveBeenCalledWith('/project/new');
    expect(useProjects.getState().manualDialogHidden).toBe(true);

    // Ticked, so the next + skips the dialog entirely.
    mockNavigate.mockClear();
    fireEvent.press(screen.getByTestId('projects.add'));
    await flush();

    expect(screen.queryByTestId('projects.manual-dialog')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/project/new');
  });

  it('closes the dialog on Cancel without hiding it', async () => {
    useProjects.setState({ loaded: true });
    await render(<ProjectsScreen />);

    fireEvent.press(screen.getByTestId('projects.add'));
    await screen.findByTestId('projects.manual-dialog');

    fireEvent.press(screen.getByTestId('projects.manual-dialog.cancel'));
    await waitFor(() => expect(screen.queryByTestId('projects.manual-dialog')).toBeNull());

    expect(useProjects.getState().manualDialogHidden).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('New Manual Project route', () => {
  it('picks from the properties store, including one registered through the Properties tab', async () => {
    useProperties.setState({ properties: seededProperties, loading: false, loaded: true });
    // Exactly what ticket 03's form does when the host saves a fourth property.
    const adding = useProperties.getState().add({
      ...seededProperties[0]!,
      alias: 'Beach house',
    });
    const registered = await adding;

    await render(<NewProjectScreen />);

    fireEvent.press(screen.getByTestId('project-form.property'));
    await screen.findByTestId('project-form.property.options');

    for (const alias of [...seededProperties.map((one) => one.alias), registered.alias]) {
      expect(screen.getByTestId(`project-form.property.option.${alias}`)).toBeTruthy();
    }
  });
});

describe('New Manual Project form', () => {
  it('lists the registered properties in the picker', async () => {
    await render(
      <NewManualProjectForm
        properties={seededProperties}
        onCreate={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    fireEvent.press(screen.getByTestId('project-form.property'));
    await screen.findByTestId('project-form.property.options');

    for (const property of seededProperties) {
      expect(screen.getByTestId(`project-form.property.option.${property.alias}`)).toBeTruthy();
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

describe('Project detail', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    reset();
    mockParams.id = seededProjects[0]!.id;
  });

  it('holds a full-screen spinner under the teal header, then renders every pill and row', async () => {
    await render(<ProjectDetailScreen />);

    expect(screen.getByTestId('project.spinner')).toBeTruthy();
    expect(screen.getByTestId('project.number')).toHaveTextContent(
      `Project #${seededProjects[0]!.id}`
    );

    await waitFor(() => expect(screen.queryByTestId('project.loading')).toBeNull(), {
      timeout: 3000,
    });

    expect(screen.getByTestId('project.property')).toHaveTextContent('Beach apartment');
    expect(screen.getByTestId('project.assignment')).toHaveTextContent('Unassigned Project');
    expect(screen.getByText('Cleaning')).toBeTruthy();
    expect(screen.getByTestId('project.start-time')).toBeTruthy();
    expect(screen.getByTestId('project.end-time')).toBeTruthy();

    for (const pill of ['manual', 'unassigned', 'visible', 'no-teammates']) {
      expect(screen.getByTestId(`project.pill.${pill}`)).toBeTruthy();
    }
    for (const row of [
      'history',
      'address',
      'problems',
      'checklist',
      'inventory',
      'name',
      'notes',
    ]) {
      expect(screen.getByTestId(`project.row.${row}`)).toBeTruthy();
    }

    expect(screen.getByText('Project created')).toBeTruthy();
    expect(screen.getByText(seededProjects[0]!.propertyAddress)).toBeTruthy();
    expect(screen.getByText('0/26 done')).toBeTruthy();
    expect(screen.getByText(`Project: ${seededProjects[0]!.name}`)).toBeTruthy();
  });

  it('drops the unassigned pill once a cleaner is on the project', async () => {
    const assigned = seededProjects[1]!;
    mockParams.id = assigned.id;
    useProjects.setState({ projects: seededProjects, loaded: true });

    await render(<ProjectDetailScreen />);

    expect(screen.getByTestId('project.assignment')).toHaveTextContent('Ramona');
    expect(screen.queryByTestId('project.pill.unassigned')).toBeNull();
    expect(screen.queryByTestId('project.pill.manual')).toBeNull();
  });
});
