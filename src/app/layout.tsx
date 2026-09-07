import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "@/styles/globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-sans-loaded",
    display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-mono-loaded",
    display: "swap",
});

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
        <html lang="en" className={`${plusJakartaSans.variable} ${ibmPlexMono.variable}`}>
            <body>
                <a
                    className="absolute left-2 top-0 z-50 -translate-y-full rounded-md bg-[var(--color-bg-control-strong)] px-4 py-2 text-[var(--color-fg)] focus:top-2 focus:translate-y-0"
                    href="#main-content"
                >
                    Skip to main content
                </a>
                {children}
            </body>
        </html>
    );
}
