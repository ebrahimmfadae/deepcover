import { compare } from '#src/utils/compare/compare';

describe('Test Compare', () => {
	it('should compare two empty objects', () => {
		const result = compare({}, {});
		expect(result).toStrictEqual([]);
	});
	it('should compare two one fielded unchanged objects', () => {
		const result = compare({ name: 'bruce' }, { name: 'bruce' });
		expect(result).toStrictEqual([
			{
				key: 'name',
				state: 'unchanged',
				value: 'bruce',
			},
		]);
	});
	it('should compare two one fielded unchanged objects with arrays', () => {
		const result = compare({ names: ['bruce'] }, { names: ['bruce'] });
		expect(result).toStrictEqual([
			{
				key: 'names.0',
				state: 'unchanged',
				value: 'bruce',
			},
		]);
	});
	it('should compare two one fielded objects', () => {
		const result = compare({ name: 'bruce' }, { name: 'henry' });
		expect(result).toStrictEqual([
			{
				key: 'name',
				state: 'changed',
				value: 'bruce',
				changedTo: 'henry',
			},
		]);
	});
	it('should compare two one fielded objects with `.` in key name', () => {
		// TODO: Find a solution. It will cause the output irreversible
		const result = compare({ 'first.name': 'bruce' }, { 'first.name': 'henry' });
		expect(result).toStrictEqual([
			{
				key: 'first.name',
				state: 'changed',
				value: 'bruce',
				changedTo: 'henry',
			},
		]);
	});
	it('should compare two one fielded objects when second is set to undefined', () => {
		const result = compare({ name: 'bruce' }, { name: undefined });
		expect(result).toStrictEqual([
			{
				key: 'name',
				state: 'changed',
				value: 'bruce',
				changedTo: undefined,
			},
		]);
	});
	it('should compare two one fielded objects when second is set to null', () => {
		const result = compare({ name: 'bruce' }, { name: null });
		expect(result).toStrictEqual([
			{
				key: 'name',
				state: 'changed',
				value: 'bruce',
				changedTo: null,
			},
		]);
	});
	it('should compare two one fielded objects that object is turned to array', () => {
		const result = compare({ name: 'bruce' }, { name: ['henry'] });
		expect(result).toStrictEqual([
			{
				key: 'name',
				state: 'changed',
				value: 'bruce',
				changedTo: ['henry'],
			},
		]);
	});
	it('should compare two one fielded objects that array is turned to object', () => {
		const result = compare({ name: ['bruce'] }, { name: 'henry' });
		expect(result).toStrictEqual([
			{
				key: 'name',
				state: 'changed',
				value: ['bruce'],
				changedTo: 'henry',
			},
		]);
	});
	it('should compare two one fielded objects that an object array is turned to object', () => {
		const result = compare({ names: [{ firstName: 'bruce' }] }, { names: 'henry' });
		expect(result).toStrictEqual([
			{
				key: 'names',
				state: 'changed',
				value: [{ firstName: 'bruce' }],
				changedTo: 'henry',
			},
		]);
	});
	it('should compare two one fielded objects that an object array is removed', () => {
		const result = compare({ names: [{ firstName: 'bruce' }] }, {});
		expect(result).toStrictEqual([
			{
				key: 'names',
				state: 'deleted',
				value: [{ firstName: 'bruce' }],
			},
		]);
	});
	it('should compare two nested objects', () => {
		const result = compare({ name: { firstName: 'bruce' } }, { name: { firstName: 'henry' } });
		expect(result).toStrictEqual([
			{
				key: 'name.firstName',
				state: 'changed',
				value: 'bruce',
				changedTo: 'henry',
			},
		]);
	});
	it('should compare two objects containing primitive arrays', () => {
		const result = compare({ names: ['bruce'] }, { names: ['henry'] });
		expect(result).toStrictEqual([
			{
				key: 'names.0',
				state: 'changed',
				value: 'bruce',
				changedTo: 'henry',
			},
		]);
	});
	it('should compare two objects containing object arrays', () => {
		const result = compare(
			{ names: [{ firstName: 'bruce' }] },
			{ names: [{ firstName: 'henry' }] },
		);
		expect(result).toStrictEqual([
			{
				key: 'names.0.firstName',
				state: 'changed',
				value: 'bruce',
				changedTo: 'henry',
			},
		]);
	});
	it('should compare two objects removing an array item', () => {
		const result = compare({ names: ['bruce'] }, { names: [] });
		expect(result).toStrictEqual([
			{
				key: 'names.0',
				state: 'deleted',
				value: 'bruce',
			},
		]);
	});
	it('should compare two objects containing object creation in array', () => {
		const result = compare({ names: ['bruce'] }, { names: ['henry', 'alfred'] });
		expect(result).toStrictEqual([
			{
				key: 'names.0',
				state: 'changed',
				value: 'bruce',
				changedTo: 'henry',
			},
			{
				key: 'names.1',
				state: 'created',
				value: 'alfred',
			},
		]);
	});
	it('should compare two different date objects', () => {
		const firstDate = new Date('2024-01-10T00:00:00.000Z');
		const secondDate = new Date('2024-02-10T00:00:00.000Z');
		const result = compare({ birthDay: firstDate }, { birthDay: secondDate });
		expect(result).toStrictEqual([
			{
				key: 'birthDay',
				state: 'changed',
				value: firstDate,
				changedTo: secondDate,
			},
		]);
	});
	it('should compare two similar date objects', () => {
		const firstDate = new Date('2024-01-10T00:00:00.000Z');
		const secondDate = firstDate;
		const result = compare({ birthDay: firstDate }, { birthDay: secondDate });
		expect(result).toStrictEqual([
			{
				key: 'birthDay',
				state: 'unchanged',
				value: firstDate,
			},
		]);
	});
});
