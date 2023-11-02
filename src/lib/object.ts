export function deepClone<T>(obj: T): T {
	if (obj === null) {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime()) as any;
	}

	if (obj instanceof Array) {
		return obj.reduce((arr, item) => {
			arr.push(deepClone(item));
			return arr;
		}, [] as T[]);
	}

	if (typeof obj === 'object') {
		return Object.keys(obj).reduce((newObj, key) => {
			(newObj as Record<string, any>)[key] = deepClone((obj as Record<string, any>)[key]);
			return newObj;
		}, {} as T);
	}

	return obj;
}

export function isObject(item: unknown): boolean {
	return !!item && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject((source as Record<string, any>)[key])) {
				if (!(target as Record<string, any>)[key]) Object.assign(target, { [key]: {} });
				deepMerge((target as Record<string, any>)[key], (source  as Record<string, any>)[key]);
			} else {
				Object.assign(target, { [key]: (source as Record<string, any>)[key] });
			}
		}
	}

	return deepMerge(target, ...sources);
}
