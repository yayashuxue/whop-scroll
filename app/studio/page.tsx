import { StudioClient } from "./studio-client";
import { MY_CAMPAIGNS, POSTER_TEMPLATES } from "@/lib/studio-templates";

export default function StudioPage() {
  return (
    <StudioClient campaigns={MY_CAMPAIGNS} templates={POSTER_TEMPLATES} />
  );
}
