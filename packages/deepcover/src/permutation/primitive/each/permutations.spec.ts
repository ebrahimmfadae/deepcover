import { eachFixtures, expectEach } from '#src/permutation/primitive/each/each.fixture';

for (const e of eachFixtures) test(e.name, () => expectEach(e.generator, e.input));
