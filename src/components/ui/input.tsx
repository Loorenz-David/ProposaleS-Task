import type { ComponentPropsWithRef } from "react";

import { cx } from "./cx";
import styles from "./form-control.module.css";

export type InputProps = ComponentPropsWithRef<"input">;

/**
 * Native `<input>` with the foundation styling.
 * The caller owns labeling: pair it with a `<label htmlFor>` or `aria-label`.
 */
export function Input({ className, ...props }: InputProps) {
    return <input className={cx(styles.control, className)} {...props} />;
}
