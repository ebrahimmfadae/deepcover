export function assertArrayMembersAreUnique(array: unknown[]) {
	for (let i = 0; i < array.length; i++) {
		const v0 = array[i];
		for (let j = i + 1; j < array.length; j++) {
			const v1 = array[j];
			expect(v0).not.deep.eq(v1);
		}
	}
}
