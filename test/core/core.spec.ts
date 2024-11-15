/**
 * This module tests standalone permutation generators to ensure they function correctly in isolation.
 * By validating these core generators independently, we can confidently reuse them in broader, large-scale tests,
 * leveraging the library's capabilities to itself.
 */

import { enums } from '#src/permutation/primitive/enums';
import { object } from '#src/permutation/primitive/object';
import { one } from '#src/permutation/primitive/one';
import { inputMessageArg, primitiveLikeInputs } from '#test/core/core.fixture';
import { assertArrayMembersAreUnique } from '#test/utils';
import { inspect } from 'util';

describe('Standalone tests for core functions', () => {
	describe(`Permutation generators with no context and ${inputMessageArg} as input`, () => {
		describe(`Does one() yield every primitive-like while preserving the reference? - including one() and enums() as input`, () => {
			const inputArray = [...primitiveLikeInputs, one('value0'), enums(['value0'])];
			for (const value of inputArray) {
				const messageArg = inspect(value, { colors: true });
				it(`one(${messageArg})`, () => {
					const outputArray = [...one(value)()];
					expect(outputArray.length).eq(1);
					const output = outputArray[0];
					expect(output).eq(value);
				});
			}
		});
		describe(`Does enums() yield every input while preserving the reference? - including one() and enums() as input`, () => {
			const inputArray = [...primitiveLikeInputs, one('value0'), enums(['value0'])];
			describe('Moving slice by window of 1', () => {
				const slicedInput = inputArray.map((_, i) => [inputArray[i]]);
				for (const value of slicedInput) {
					const messageArg = inspect([value[0]], { colors: true });
					it(`enums(${messageArg})`, () => {
						const outputArray = [...enums(value)()];
						expect(outputArray.length).eq(value.length);
						expect(value).include.members(outputArray);
						expect(outputArray).include.members(value);
					});
				}
			});
			describe(`moving slice by window of ${inputArray.length}`, () => {
				const slicedInput = inputArray.map((_, i) => inputArray.slice(0, i + 1));
				for (const value of slicedInput) {
					const messageArg = inspect(value, { colors: true, maxArrayLength: 3 });
					it(`enums(${messageArg})`, () => {
						const outputArray = [...enums(value)()];
						expect(outputArray.length).eq(value.length);
						expect(value).include.members(outputArray);
						expect(outputArray).include.members(value);
					});
				}
			});
		});
		describe('Does object() yield every input while preserving the reference?', () => {
			it('input items wrapped by one()', () => {
				const inputArray = [...primitiveLikeInputs];
				const outputEntries = inputArray.map((v, i) => [`key${i}`, v]);
				const inputEntries = outputEntries.map(([k, v]) => [k, one(v)]);
				const outputArray = [...object(Object.fromEntries(inputEntries))()];
				expect(outputArray.length).eq(1);
				const assertingOutput = Object.fromEntries(outputEntries);
				const output = outputArray[0];
				expect(assertingOutput).deep.eq(output);
			});
			const slideWindow = 6;
			it(`moving slice (window of ${slideWindow}) of input wrapped by enums()`, () => {
				const inputArray = [...primitiveLikeInputs];
				const slicedInput = inputArray.map((_, i) =>
					inputArray.slice(Math.max(0, i + 1 - slideWindow), i + 1),
				);
				const outputEntries = slicedInput
					.map((v, i) => [`key${i}`, v] as const)
					.slice(0, slideWindow);
				const inputEntries = outputEntries.map(([k, v]) => [k, enums(v)]);
				const p = Object.fromEntries(inputEntries);
				const outputArray = [...object(p)()];
				const assertSize = outputEntries.reduce((acc, curr) => acc * curr[1].length, 1);
				expect(outputArray.length).eq(assertSize);
				const assertKeys = outputEntries.map((v) => v[0]);
				const assertValues = Object.fromEntries(outputEntries);
				for (const element of outputArray) {
					const keys = Object.keys(element);
					expect(assertKeys).include.members(keys);
					expect(keys).include.members(assertKeys);
					Object.entries(element).forEach(([k, v]) => expect(assertValues[k]).include(v));
				}
				assertArrayMembersAreUnique(outputArray);
			});
			it.todo('all combinations of enums() and one()');
		});
	});
});
