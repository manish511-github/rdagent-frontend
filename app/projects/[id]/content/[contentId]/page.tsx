import ContentDetailPage from "@/components/kokonutui/content-detail-page"
import Layout from "@/components/kokonutui/layout"

export default function ContentPage({ params }: { params: { id: string; contentId: string } }) {
  // In a real app, you would fetch the content data here
  return (
    <Layout>
      <ContentDetailPage projectId={params.id} contentId={params.contentId} />
    </Layout>
  )
}
