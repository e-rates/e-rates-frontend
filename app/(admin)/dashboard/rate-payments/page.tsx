import { redirect } from 'next/navigation';

export default function RatePaymentsPage() {
  redirect('/dashboard/defaulters?view=payments');
}
