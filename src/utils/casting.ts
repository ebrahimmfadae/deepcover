import type {
	Expandable,
	ExpandableArray,
	ExpandableObject,
} from '#src/router/utils/expandable-check';

export type CastAsArray<T> = T extends ExpandableArray ? T : never;
export type CastAsObject<T> = T extends ExpandableObject ? T : never;
export type CastAsExpandable<T> = T extends Expandable ? T : never;
export type CastAsNumber<T> = T extends number
	? T
	: T extends `${infer P extends number}`
		? P
		: never;
