import * as React from 'react';

export interface IProps extends React.PropsWithChildren {
    fallback?: React.ComponentType<any> | null;
}

function NoSSR({ children, fallback = null }: IProps) {
    const [ mounted, setMounted ] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <>
                { fallback }
            </>
        );
    }

    return (
        <>
            { children }
        </>
    );
};

export default NoSSR;
