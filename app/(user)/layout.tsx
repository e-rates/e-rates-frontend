import { ThemeToggle } from '../components/theme-toggle';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-main-bg min-h-screen">
      <nav className="bg-card-bg border-border-default border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <h1 className="text-text-primary text-xl font-bold">E-Rates</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
