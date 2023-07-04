import { useState, useRef } from "preact/hooks";

export function useToggle<T>(...array: T[]) {
    if (array.length < 2) {
        throw new Error('Invalid array size, at least 2 items expected.')
    }

    const ref = useRef(array);
    const [toggle, setToggle] = useState<T>(ref.current[0]);

    return [toggle, function (): void {
        ref.current = ref.current.rotate(1);
        setToggle(ref.current[0])
    }] as const;
}