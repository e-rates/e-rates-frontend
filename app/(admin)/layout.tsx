import { ThemeToggle } from '../components/theme-toggle';
import Header from './components/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    //Main Container
    <div className="bg-main-bg mx-auto min-h-screen w-full max-w-[1366px] px-2">
      {/* Header */}
      <Header />
      {/* Body */}
      <div>{children}</div>
    </div>
  );
}
