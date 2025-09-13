import SharedLayout from "@/components/shared-layout";

export default function Items() {
  return (
    <SharedLayout currentPage="/items">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Items</h2>
        <div className="text-muted-foreground">Items page - Coming soon</div>
      </div>
    </SharedLayout>
  );
}