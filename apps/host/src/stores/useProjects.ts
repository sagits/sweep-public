import { fetchProjects } from '@sweep/mocks';
import type { Project } from '@sweep/types';
import { create } from 'zustand';

type ProjectsState = {
  projects: Project[];
  loading: boolean;
  load: () => Promise<void>;
};

export const useProjects = create<ProjectsState>((set) => ({
  projects: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    const projects = await fetchProjects();
    set({ projects, loading: false });
  },
}));
