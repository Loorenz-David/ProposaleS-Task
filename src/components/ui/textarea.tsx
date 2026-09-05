import type { ComponentPropsWithRef } from "react";

import { cx } from "./cx";
import styles from "./form-control.module.css";

export type TextareaProps = ComponentPropsWithRef<"textarea">;

/**
 * Native `<textarea>` with the foundation styling.
 * The caller owns labeling: pair it with a `<label htmlFor>` or `aria-label`.
 */
export function Textarea({ className, rows = 4, ...props }: TextareaProps) {
    return (
        <textarea
            rows={rows}
            className={cx(styles.control, styles.multiline, className)}
            {...props}
        />
    );
}
