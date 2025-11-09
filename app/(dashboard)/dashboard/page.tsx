export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">📝 Content Studio</h3>
          <p className="text-sm text-muted-foreground">Coming in ETAP 4</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">💡 Ideas & Calendar</h3>
          <p className="text-sm text-muted-foreground">Coming in ETAP 5</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">🎯 Personalization</h3>
          <p className="text-sm text-muted-foreground">Coming in ETAP 6</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">📊 Analytics</h3>
          <p className="text-sm text-muted-foreground">Coming in ETAP 7</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">🔍 Competitors</h3>
          <p className="text-sm text-muted-foreground">Coming in ETAP 8</p>
        </div>
      </div>
    </div>
  )
}
