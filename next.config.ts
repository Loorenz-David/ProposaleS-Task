import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // The workflow state is bounded at 1 MiB by MAX_WORKFLOW_STATE_BYTES, and the approval
    // envelope carries the proposition a second time beside it, so a compliant envelope can
    // exceed the framework's 1 MB default. The state's own bound still fails loudly with
    // `workflow_state_too_large`; this only stops the transport rejecting a legal payload first.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;