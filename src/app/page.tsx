import { LandingClient } from "@/components/landing/LandingClient";
import { LoadingCounter } from "@/components/landing/LoadingCounter";
import { WaitlistPanel } from "@/components/landing/WaitlistPanel";
import { LANDING_MEDIA } from "@/lib/landing/media";

export default function LandingPage() {
  return (
    <main>
      <LandingClient />
      <WaitlistPanel />
      <LoadingCounter media={LANDING_MEDIA} />
    </main>
  );
}
