import { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { clsx } from '../../utils/clsx';

type Props = {
	icon?: ReactNode;
};

export const Button: FC<Props & ButtonHTMLAttributes<HTMLButtonElement>> = ({
	icon,
	className,
	...props
}) => {
	return (
		<button
			className={clsx(
				'z-10 flex h-5 w-5 cursor-default flex-col items-center justify-center fill-theme-300 outline-none transition-colors hover:fill-theme-50',
				className
			)}
			type="button"
			{...props}
		>
			{icon && <span>{icon}</span>}
		</button>
	);
};
