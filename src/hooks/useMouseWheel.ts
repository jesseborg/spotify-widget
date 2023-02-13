import { DependencyList, MutableRefObject, useEffect, useState } from 'react';

type Options = {
	onChange: (delta: number) => void;
};

export function useMouseWheel<T extends HTMLElement>(
	ref: MutableRefObject<T | null>,
	options?: Options,
	deps?: DependencyList
) {
	const [delta, setDelta] = useState(0);

	useEffect(() => {
		function listener(event: WheelEvent) {
			setDelta(event.deltaY);
			options?.onChange(event.deltaY);
		}

		ref.current?.addEventListener('wheel', listener);

		return () => {
			ref.current?.removeEventListener('wheel', listener);
		};
	}, [ref, deps]);

	return { delta };
}
