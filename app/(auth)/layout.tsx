export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">NewsletterAI</h1>
          <p className="text-sm text-muted-foreground">AI Newsletter Operating System</p>
        </div>
        {children}
      </div>
    </div>
  )
}
