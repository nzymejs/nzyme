import { defineConfig } from './defineConfig';

export function typescriptConfig() {
    return defineConfig({
        preset: 'ts-jest/presets/default-esm', // or other ESM presets
        moduleNameMapper: {
            '^(\\.{1,2}/.*)\\.js$': '$1',
        },
        transform: {
            '^.+\\.tsx?$': [
                'ts-jest',
                {
                    useESM: true,
                    tsconfig: '<rootDir>/tsconfig.tests.json',
                },
            ],
        },
        roots: ['<rootDir>'],
        modulePaths: ['<rootDir>'],
        moduleFileExtensions: ['ts', 'tsx', 'js'],
        extensionsToTreatAsEsm: ['.ts'],
        collectCoverageFrom: ['./dist/**/*.js'],
        setupFilesAfterEnv: [require.resolve('./setup.js')],
    });
}
