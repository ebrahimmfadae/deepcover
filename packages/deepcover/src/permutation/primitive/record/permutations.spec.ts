import {
	expectRecord,
	generateRecordFixtures,
} from '#src/permutation/primitive/record/record.fixture';

const fixtures = generateRecordFixtures(undefined, 1);

for (const element0 of fixtures) test(element0.name, () => expectRecord(element0));
