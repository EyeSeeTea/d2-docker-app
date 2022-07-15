import React from "react";

/*  Merge the features of React.useCallback and React.useEffect to run a single, non-concurrent,
    cancellable effect. If a new effect is requested when the previous one has not finished yet,
    that old effect will be cancelled.
*/

// Use a wrap value so identical arguments still run a new effect
type ArgsValue<Args extends any[]> = { value: Args };
type Effect = void;
type EffectFn<Args extends any[]> = (...args: Args) => Effect;
export type Cancel = { (): void };

export const noCancel: Cancel = () => {};

export function useCallbackEffect<Args extends any[]>(callback: (...args: Args) => Cancel | undefined): EffectFn<Args> {
    const cancelRef = React.useRef<Cancel>(noCancel);

    const [args, setArgs] = React.useState<ArgsValue<Args>>();

    const runEffect = React.useCallback<EffectFn<Args>>(
        (...args) => {
            cancelRef.current(); // Cancel current effect
            return setArgs({ value: args });
        },
        [setArgs]
    );

    React.useEffect(() => {
        if (args) {
            const cancelFn = callback(...args.value);
            cancelRef.current = cancelFn || noCancel;
            if (!cancelFn) setArgs(undefined);
            return cancelFn;
        }
    }, [callback, args]);

    return runEffect;
}
