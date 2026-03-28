import { DashboardLayout } from "@/components/dashboard-layout"
import { PerformancePage } from "@/components/pages/performance-page"

export default async function Performance({ searchParams }: { searchParams: Promise<{ stock?: string }> }) {
    const params = await searchParams
    return (
        <DashboardLayout>
            <PerformancePage initialStock={params.stock} />
        </DashboardLayout>
    )
}
