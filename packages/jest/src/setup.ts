import { expectToEqualPartially } from './matchers/expectToEqualPartially';

expect.extend({
    toEqualPartially: expectToEqualPartially,
});
