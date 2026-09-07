import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // The reviewer intro's diagrams and its walkthrough clip are hosted, not bundled: they are
    // demonstration assets, not application code. `next/image` refuses a remote host it has not
    // been told about, so the one origin the intro references is named here — an allowlist of
    // exactly one, which is also what keeps it from becoming a general-purpose image proxy.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "test-bootstrap-local.s3.eu-north-1.amazonaws.com",
        pathname: "/proposales_media/**",
      },
    ],
  },
  experimental: {
    // The workflow state is bounded at 1 MiB by MAX_WORKFLOW_STATE_BYTES, and the approval
    // envelope carries the proposition a second time beside it, so a compliant envelope can
    // exceed the framework's 1 MB default. The state's own bound still fails loudly with
    // `workflow_state_too_large`; this only stops the transport rejecting a legal payload first.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;