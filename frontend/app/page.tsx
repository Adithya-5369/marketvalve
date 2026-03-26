import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardContent } from "@/components/dashboard-content"
import AIChat from "@/components/AIChat"

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardContent />
      <AIChat />
    </DashboardLayout>
  )
}
