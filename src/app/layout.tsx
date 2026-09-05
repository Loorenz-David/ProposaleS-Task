import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
    title: {
        default: "Proposal Copilot",
        template: "%s · Proposal Copilot",
    },
    description:
        "An AI-assisted workflow for turning commercial intent into a Proposales proposal ready for human review.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <a href="#main-content" className={styles.skipLink}>
                    Skip to content
                </a>
                <header className={styles.header}>
                    <div className={styles.bounded}>
                        <span className={styles.brand}>Proposal Copilot</span>
                    </div>
                </header>
                <main id="main-content" className={`${styles.main} ${styles.bounded}`}>
                    {children}
                </main>
            </body>
        </html>
    );
}
