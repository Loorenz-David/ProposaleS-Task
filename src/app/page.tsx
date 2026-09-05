import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import styles from "./page.module.css";

export default function Home() {
    return (
        <>
            <div className={styles.intro}>
                <h1>Application foundation</h1>
                <p>
                    This page exercises the shell, the typography hierarchy, and the shared UI
                    primitives. Product features will replace it.
                </p>
                <small>Server-rendered. No client-side state.</small>
            </div>

            <section className={styles.section} aria-labelledby="primitives-heading">
                <h2 id="primitives-heading">Primitives</h2>
                <p>Native controls with the foundation styling. Labels are supplied by the caller.</p>

                <div className={styles.field}>
                    <label htmlFor="sample-input">Text input</label>
                    <Input id="sample-input" name="sample-input" placeholder="Placeholder" />
                </div>
                <div className={styles.field}>
                    <label htmlFor="sample-textarea">Multiline input</label>
                    <Textarea id="sample-textarea" name="sample-textarea" placeholder="Placeholder" />
                </div>

                <div className={styles.actions}>
                    <Button variant="primary">Primary action</Button>
                    <Button>Secondary action</Button>
                    <Button disabled>Disabled</Button>
                </div>
            </section>
        </>
    );
}
