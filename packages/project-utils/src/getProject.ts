import { Project } from '@lerna/project';

type ProjectOptions = {
    cwd?: string;
};

export function getProject(options: ProjectOptions = {}) {
    const cwd = options.cwd || process.cwd();
    return new Project(cwd);
}
