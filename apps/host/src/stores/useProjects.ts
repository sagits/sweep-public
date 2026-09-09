import { createProject, fetchProjects } from '@sweep/mocks';
import type { NewProject, Project } from '@sweep/types';
import { create } from 'zustand';

import { once } from './once';

type ProjectsState = {
  projects: Project[];
  loading: boolean;
  /** Set once the seed has arrived, so re-entering the tab never seeds over what was added. */
  loaded: boolean;
  /** The "Don't show this message again" tick on the automatic-vs-manual dialog. */
  manualDialogHidden: boolean;
  load: () => Promise<void>;
  /** The calendar header's refresh icon: re-runs the fetch, skeletons and all. */
  reload: () => Promise<void>;
  add: (input: NewProject) => Promise<Project>;
  hideManualDialog: () => void;
};

export const useProjects = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  loaded: false,
  manualDialogHidden: false,
  load: once(() => get().reload()),
  reload: async () => {
    set({ loading: true });
    const fetched = await fetchProjects();
    // There is no server to refresh from, so re-fetching the seed must not drop what the host
    // added this session: anything the fetch does not know about is kept.
    set((state) => {
      const fetchedIds = new Set(fetched.map((project) => project.id));
      const added = state.projects.filter((project) => !fetchedIds.has(project.id));
      return { projects: [...fetched, ...added], loading: false, loaded: true };
    });
  },
  add: async (input) => {
    const project = await createProject(input);
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },
  hideManualDialog: () => set({ manualDialogHidden: true }),
}));
