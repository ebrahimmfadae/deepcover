import { expandableCheck, isExpandable, isNotExpandable, isPOJO } from '#src/utils/type-check';

describe('isPOJO', () => {
	it('1', () => {
		const input = { a: 1, b: 2 } as const;
		type A = {
			readonly a: 1;
			readonly b: 2;
		};
		if (isPOJO(input)) expectTypeOf(input).toEqualTypeOf<A>();
	});
	it('1', () => {
		const input = [1, 2] as const;
		if (isPOJO(input)) expectTypeOf(input).toBeNever();
	});
	it('1', () => {
		const input = 5;
		if (isPOJO(input)) expectTypeOf(input).toBeNever();
	});
	it('1', () => {
		const input = { a: 1, b: 2 } as
			| {
					readonly a: 1;
					readonly b: 2;
			  }
			| 5
			| { b: 3 }
			| [1];
		type A =
			| {
					readonly a: 1;
					readonly b: 2;
			  }
			| { b: 3 };
		if (isPOJO(input)) expectTypeOf(input).toEqualTypeOf<A>();
	});
});

describe('isExpandable', () => {
	it('1', () => {
		const input = { a: 1, b: 2 } as const;
		type A = {
			readonly a: 1;
			readonly b: 2;
		};
		if (isExpandable(input)) expectTypeOf(input).toEqualTypeOf<A>();
	});
	it('1', () => {
		const input = [1, 2] as const;
		if (isExpandable(input)) expectTypeOf(input).toEqualTypeOf<readonly [1, 2]>();
	});
	it('1', () => {
		const input = 5;
		if (isExpandable(input)) expectTypeOf(input).toBeNever();
	});
	it('1', () => {
		const input = [1, 23] as
			| {
					readonly a: 1;
					readonly b: 2;
			  }
			| 5
			| { b: 3 }
			| [1]
			| [1, 23]
			| (1 | 2)[];
		type A =
			| [1]
			| [1, 23]
			| (1 | 2)[]
			| {
					readonly a: 1;
					readonly b: 2;
			  }
			| {
					b: 3;
			  };
		if (isExpandable(input)) expectTypeOf(input).toEqualTypeOf<A>();
	});
});

describe('isNotExpandable', () => {
	it('1', () => {
		const input = { a: 1, b: 2 } as const;
		if (isNotExpandable(input)) expectTypeOf(input).toBeNever();
	});
	it('1', () => {
		const input = [1, 2] as const;
		if (isNotExpandable(input)) expectTypeOf(input).toBeNever();
	});
	it('1', () => {
		const input = 5;
		if (isNotExpandable(input)) expectTypeOf(input).toEqualTypeOf<5>();
	});
	it('1', () => {
		const input = [1, 23] as
			| {
					readonly a: 1;
					readonly b: 2;
			  }
			| 5
			| { b: 3 }
			| [1]
			| [1, 23]
			| (1 | 2)[];
		if (isNotExpandable(input)) expectTypeOf(input).toEqualTypeOf<5>();
	});
});

describe('expandableCheck', () => {
	it('1', () => {
		const input = { a: 1, b: 2 } as const;
		const output = expandableCheck(input);
		expectTypeOf(output).toEqualTypeOf<{
			readonly expandable: true;
			readonly value: {
				readonly a: 1;
				readonly b: 2;
			};
		}>();
	});
	it('1', () => {
		const input = [1, 2] as const;
		const output = expandableCheck(input);
		expectTypeOf(output).toEqualTypeOf<{
			readonly expandable: true;
			readonly value: readonly [1, 2];
		}>();
	});
	it('1', () => {
		const input = 5;
		const output = expandableCheck(input);
		expectTypeOf(output).toEqualTypeOf<{
			readonly expandable: false;
			readonly value: 5;
		}>();
	});
	it('1', () => {
		const input = [1, 23] as
			| {
					readonly a: 1;
					readonly b: 2;
			  }
			| 5
			| { b: 3 }
			| [1]
			| [1, 23]
			| (1 | 2)[];
		const output = expandableCheck(input);
		type A =
			| {
					readonly expandable: false;
					readonly value: 5;
			  }
			| {
					readonly expandable: true;
					readonly value: [1];
			  }
			| {
					readonly expandable: true;
					readonly value: [1, 23];
			  }
			| {
					readonly expandable: true;
					readonly value: (1 | 2)[];
			  }
			| {
					readonly expandable: true;
					readonly value: {
						readonly a: 1;
						readonly b: 2;
					};
			  }
			| {
					readonly expandable: true;
					readonly value: {
						b: 3;
					};
			  };
		expectTypeOf(output).toEqualTypeOf<A>();
	});
});
