import type { ComponentPropsWithRef } from "react";

import styles from "./button.module.css";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
    /** Visual emphasis. `primary` is for the single main action in a view. */
    variant?: ButtonVariant;
};

/**
 * Native `<button>` with the foundation styling.
 * Defaults to `type="button"` so a button inside a form never submits by accident.
 */
export function Button({
    variant = "secondary",
    type = "button",
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cx(styles.button, styles[variant], className)}
            {...props}
        />
    );
}
