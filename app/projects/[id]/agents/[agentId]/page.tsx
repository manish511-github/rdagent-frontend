import IndividualAgentPage from "@/components/kokonutui/individual-agent-page";

export default function AgentDetail({
  params,
}: {
  params: { agentId: string };
}) {
  return <IndividualAgentPage agentId={params.agentId} />;
}
