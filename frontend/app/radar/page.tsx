import { DashboardLayout } from "@/components/dashboard-layout"
import { RadarPage } from "@/components/pages/radar-page"

export default async function Radar({ searchParams }: { searchParams: Promise<{ stock?: string }> }) {
  const params = await searchParams
  return (
    <DashboardLayout>
      <RadarPage initialStock={params.stock} />
    </DashboardLayout>
  )
}
