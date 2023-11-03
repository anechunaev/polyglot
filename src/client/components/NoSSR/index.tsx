import * as React from 'react';

export interface IProps extends React.PropsWithChildren {
	fallback?: React.ComponentType<any> | null;
}

function NoSSR({ children, fallback = null }: IProps) {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => setMounted(true), []);

	if (!mounted) {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return <>{fallback}</>;
	}

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
}

NoSSR.defaultProps = {
	fallback: null,
};

export default NoSSR;
