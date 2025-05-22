import ProjectDashboard from "@/components/kokonutui/project-dashboard"

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <ProjectDashboard projectId={params.id} />
}
