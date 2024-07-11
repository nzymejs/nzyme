import { expectToEqualFully } from './matchers/expectToEqualFully.js';
import { expectToEqualPartially } from './matchers/expectToEqualPartially.js';

expect.extend({
    toEqualFully: expectToEqualFully,
    toEqualPartially: expectToEqualPartially,
});
