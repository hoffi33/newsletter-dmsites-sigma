export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex">
        {/* Sidebar - będzie dodany później */}
        <aside className="hidden md:flex w-64 min-h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">NewsletterAI</h2>
            <p className="text-xs text-muted-foreground">Navigation coming soon...</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
