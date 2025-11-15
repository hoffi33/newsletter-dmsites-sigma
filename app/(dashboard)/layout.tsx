import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { getUserProfile } from '@/lib/supabase/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userProfile = await getUserProfile()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Navbar user={userProfile} />

          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
