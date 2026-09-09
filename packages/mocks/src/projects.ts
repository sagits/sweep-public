import type { Project } from '@sweep/types';

import { resolve } from './resolve';

/**
 * Projects are seeded one per property by the Projects feature. Until then Home resolves to
 * nothing and shows "There are no projects right now.".
 */
export const seededProjects: Project[] = [];

export const fetchProjects = (): Promise<Project[]> => resolve(seededProjects);
