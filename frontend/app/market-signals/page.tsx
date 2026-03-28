import { DashboardLayout } from "@/components/dashboard-layout"
import { AlertsPage } from "@/components/pages/alerts-page"

export default async function Alerts({ searchParams }: { searchParams: Promise<{ stock?: string }> }) {
  const params = await searchParams
  return (
    <DashboardLayout>
      <AlertsPage initialStock={params.stock} />
    </DashboardLayout>
  )
}
