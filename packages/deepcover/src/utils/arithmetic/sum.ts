// Author: https://github.com/JSuder-xx
// Link: https://github.com/type-challenges/type-challenges/issues/506

type Or<left extends boolean, right extends boolean> = left extends true
	? true
	: right extends true
		? true
		: false;

type CoalesceToString<n extends string | number | bigint> = n extends string ? n : `${n}`;

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type SubOneFromDigit<digit extends Digit> = digit extends '1'
	? '0'
	: digit extends '2'
		? '1'
		: digit extends '3'
			? '2'
			: digit extends '4'
				? '3'
				: digit extends '5'
					? '4'
					: digit extends '6'
						? '5'
						: digit extends '7'
							? '6'
							: digit extends '8'
								? '7'
								: digit extends '9'
									? '8'
									: digit extends '10'
										? '9'
										: never;

type AddOneToDigit<digit extends Digit> = digit extends '0'
	? { result: '1'; carry: false }
	: digit extends '1'
		? { result: '2'; carry: false }
		: digit extends '2'
			? { result: '3'; carry: false }
			: digit extends '3'
				? { result: '4'; carry: false }
				: digit extends '4'
					? { result: '5'; carry: false }
					: digit extends '5'
						? { result: '6'; carry: false }
						: digit extends '6'
							? { result: '7'; carry: false }
							: digit extends '7'
								? { result: '8'; carry: false }
								: digit extends '8'
									? { result: '9'; carry: false }
									: digit extends '9'
										? { result: '0'; carry: true }
										: never;

type SingleDigitSumResult<result extends Digit, carry extends boolean> = {
	result: result;
	carry: carry;
};

type SumSingleDigits<
	left extends Digit,
	right extends Digit,
	carryIn extends boolean = false,
	carryOut extends boolean = false,
> = carryIn extends true
	? AddOneToDigit<left> extends SingleDigitSumResult<
			infer leftIncremented,
			infer carryOutFromIncrement
		>
		? SumSingleDigits<leftIncremented, right, false, carryOutFromIncrement>
		: never
	: right extends '0'
		? { result: left; carry: carryOut }
		: AddOneToDigit<left> extends SingleDigitSumResult<
					infer leftIncremented,
					infer carryOutFromIncrement
			  >
			? SumSingleDigits<
					leftIncremented,
					SubOneFromDigit<right>,
					false,
					Or<carryOut, carryOutFromIncrement>
				>
			: never;

type RightMostDigitResult<rest extends string, digit extends Digit> = { rest: rest; digit: digit };

type RightMostDigit<s extends string> = s extends `${infer rest}${Digit}`
	? s extends `${rest}${infer digit}`
		? { rest: rest; digit: digit }
		: never
	: never;

type SumStrings<
	left extends string,
	right extends string,
	accumulatedResultDigits extends string = '',
	carry extends boolean = false,
> = '' extends left
	? // Left is empty
		'' extends right
		? // Right is empty
			carry extends true
			? `1${accumulatedResultDigits}`
			: accumulatedResultDigits
		: // Right has value
			RightMostDigit<right> extends RightMostDigitResult<
					infer remainingRight,
					infer rightDigit
			  >
			? SumSingleDigits<'0', rightDigit, carry> extends SingleDigitSumResult<
					infer resultDigit,
					infer resultCarry
				>
				? SumStrings<
						'',
						remainingRight,
						`${resultDigit}${accumulatedResultDigits}`,
						resultCarry
					>
				: never
			: never
	: // Left has value
		'' extends right
		? // Right has no value
			RightMostDigit<left> extends RightMostDigitResult<infer remainingLeft, infer leftDigit>
			? SumSingleDigits<'0', leftDigit, carry> extends SingleDigitSumResult<
					infer resultDigit,
					infer resultCarry
				>
				? SumStrings<
						remainingLeft,
						'',
						`${resultDigit}${accumulatedResultDigits}`,
						resultCarry
					>
				: never
			: never
		: // Right has value
			RightMostDigit<left> extends RightMostDigitResult<infer remainingLeft, infer leftDigit>
			? RightMostDigit<right> extends RightMostDigitResult<
					infer remainingRight,
					infer rightDigit
				>
				? SumSingleDigits<leftDigit, rightDigit, carry> extends SingleDigitSumResult<
						infer resultDigit,
						infer resultCarry
					>
					? SumStrings<
							remainingLeft,
							remainingRight,
							`${resultDigit}${accumulatedResultDigits}`,
							resultCarry
						>
					: never
				: never
			: never;

export type Sum<left extends string | number | bigint, right extends string | number | bigint> =
	SumStrings<CoalesceToString<left>, CoalesceToString<right>> extends `${infer n extends number}`
		? n
		: never;

export type SumTuple<T extends readonly number[], N extends number = 0> = readonly [] extends T
	? 0
	: T extends readonly [infer Head extends number, ...infer U extends readonly number[]]
		? SumTuple<U, Sum<Head, N>>
		: N;
