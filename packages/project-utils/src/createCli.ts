import { $ } from 'execa';

export type CreateCliOptions = {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
};

export function createCli(options: CreateCliOptions = {}) {
    return $({
        cwd: options.cwd || process.cwd(),
        stdout: 'inherit',
        stderr: 'inherit',
        env: options.env || process.env,
        shell: true,
    });
}
