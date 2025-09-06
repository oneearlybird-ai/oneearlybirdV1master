export const dynamic = "force-dynamic";
export default function BillingPage() {
  return (
    <section>
      <h2>Billing</h2>
      <p>Manage plan and invoices here. No PHI is ever sent to Stripe metadata.</p>
      <ul>
        <li>Current Plan: Starter</li>
        <li>Next Invoice: PHI-zero details only</li>
      </ul>
      <p>For plan changes and payment methods, connect your Stripe Customer Portal link in settings.</p>
    </section>
  );
}
