import { ProposalWorkspace } from "@/features/proposal-preparation/components/workspace/proposal-workspace";

/**
 * Server Actions invoked from this page inherit its duration budget. A worst-case turn is the
 * agent's 60 s wall-time budget plus two catalog reads; approval is a search, a create and a
 * read-back. Under Fluid compute the platform cap is 300 s, so 120 leaves headroom without
 * letting a stuck run hold a function open. If a build rejects this value the project is not on
 * Fluid compute (see the sprint plan's owner decision card).
 */
export const maxDuration = 120;

export default function Home() {
    return <ProposalWorkspace />;
}
