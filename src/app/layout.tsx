import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

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
            <body>{children}</body>
        </html>
    );
}