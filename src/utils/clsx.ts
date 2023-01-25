export const clsx = (...classes: (string | undefined | { [key: string]: any })[]) => {
	return classes
		.map((classObj) => {
			if (typeof classObj === 'string') {
				return classObj;
			}

			if (typeof classObj === 'object') {
				return Object.keys(classObj)
					.filter((key) => classObj[key])
					.join(' ');
			}

			return '';
		})
		.filter(Boolean)
		.join(' ');
};
