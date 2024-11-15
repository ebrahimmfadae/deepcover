import { inspect } from 'util';

/**
 * If a test passes for a representation of an infinite set, we assume it holds for all values in that set.
 */
const primitiveLikeRepresentations = {
	strings: ['', 'value0'],
	numbers: [-1, -(1 / 3), -(0.1 + 0.2), -0.1, 0, 0.1, 0.1 + 0.2, 1 / 3, 1],
	bigints: [-123456789n, 0n, 123456789n],
	symbols: [Symbol.for('VALUE')],
	nullish: [null, undefined],
	boolean: [true, false],
	classInstances: [new Date('2024-11-08T00:00:00Z')],
} as const;

export const primitiveLikeInputs = new Set(Object.values(primitiveLikeRepresentations).flat());

export const inputMessageArg = inspect(primitiveLikeInputs.values().toArray(), {
	colors: true,
	maxArrayLength: 3,
});
