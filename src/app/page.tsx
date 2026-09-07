import { IntroProvider } from "@/features/proposal-preparation/components/onboarding/intro-context";
import { ProposalCopilotIntro } from "@/features/proposal-preparation/components/onboarding/proposal-copilot-intro";
import { ProposalWorkspace } from "@/features/proposal-preparation/components/workspace/proposal-workspace";

/**
 * Server Actions invoked from this page inherit its duration budget. A worst-case turn is the
 * agent's 240 s wall-time budget plus catalog reads; approval is a search, a create and a
 * read-back. Under Fluid compute the platform cap is 300 s, which leaves bounded headroom for
 * work outside the agent loop. If a build rejects this value the project is not on Fluid compute
 * (see the sprint plan's owner decision card).
 */
export const maxDuration = 300;

export default function Home() {
    return (
        <IntroProvider>
            <ProposalWorkspace />
            <ProposalCopilotIntro />
        </IntroProvider>
    );
}
