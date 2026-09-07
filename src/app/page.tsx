import { IntroProvider } from "@/features/proposal-preparation/components/onboarding/intro-context";
import { ProposalCopilotIntro } from "@/features/proposal-preparation/components/onboarding/proposal-copilot-intro";
import { ProposalWorkspace } from "@/features/proposal-preparation/components/workspace/proposal-workspace";

export default function Home() {
    return (
        <IntroProvider>
            <ProposalWorkspace />
            <ProposalCopilotIntro />
        </IntroProvider>
    );
}
