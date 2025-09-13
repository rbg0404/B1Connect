import SharedLayout from "@/components/shared-layout";

export default function SalesOrders() {
  return (
    <SharedLayout currentPage="/sales-orders">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Sales Orders</h2>
        <div className="text-muted-foreground">Sales Orders page - Coming soon</div>
      </div>
    </SharedLayout>
  );
}