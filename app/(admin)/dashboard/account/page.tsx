import AdminProfile from '../../components/AdminProfile';

export default function AccountPage() {
  return (
    <div className="w-full p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Account
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Manage your account information
          </p>
        </div>
        <AdminProfile />
      </div>
    </div>
  );
}
