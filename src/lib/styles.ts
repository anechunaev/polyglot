function isObject(item: unknown): boolean {
	return !!item && typeof item === 'object' && !Array.isArray(item);
}
export function mergeObjectStyles<T extends object>(target: T, ...sources: Partial<T>[]): T {
	if (!sources.length) return target;
	const source  = sources.shift() as Record<string, any>;

	if (isObject(target) && isObject(source)) {
		const objectTarget = target as Record<string, any>;
		// eslint-disable-next-line no-restricted-syntax
		for (const key in source) {
			if (isObject((source as Record<string, any>)[key])) {
				if (!objectTarget[key]) Object.assign(objectTarget, { [key]: {} });
				mergeObjectStyles(objectTarget[key], source[key]);
			} else {
				objectTarget[key] += ` ${source[key]}`;
			}
		}
	}

	return mergeObjectStyles(target, ...sources);
}
