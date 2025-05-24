import ProjectDashboard from "@/components/kokonutui/project-dashboard"
import Layout from "@/components/kokonutui/layout"

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <Layout>
      <ProjectDashboard projectId={params.id} />
    </Layout>
  )
}
