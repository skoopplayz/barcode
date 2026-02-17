import { useState } from "react";
import { useItems, useCreateItem, useUpdateItem, useDeleteItem, useItemByBarcode } from "@/hooks/use-items";
import { ItemCard } from "@/components/ItemCard";
import { ItemForm } from "@/components/ItemForm";
import { Scanner } from "@/components/Scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScanBarcode, Plus, Search, PackageOpen, Loader2 } from "lucide-react";
import { type Item, type InsertItem } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const [search, setSearch] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    item?: Item;
    initialBarcode?: string;
  }>({
    isOpen: false,
    mode: "create",
  });

  // Queries & Mutations
  const { data: items, isLoading } = useItems(search);
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const queryClient = useQueryClient();

  // Temporary state for looking up scanned barcode
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  
  // We use this specific hook to check if an item exists after scanning
  const { data: existingItem, isLoading: isLookupLoading } = useItemByBarcode(scannedCode);

  // Handle Scan Result
  const handleScan = (code: string) => {
    setIsScannerOpen(false);
    setScannedCode(code);
    // The useEffect below will react to the lookup result
  };

  // React to scan lookup
  // If item exists -> Open Edit
  // If item doesn't exist -> Open Create with prefilled barcode
  // We need to wait for isLookupLoading to be false
  if (scannedCode && !isLookupLoading) {
    if (existingItem) {
      setModalState({
        isOpen: true,
        mode: "edit",
        item: existingItem,
      });
    } else {
      setModalState({
        isOpen: true,
        mode: "create",
        initialBarcode: scannedCode,
      });
    }
    setScannedCode(null); // Reset scan trigger
  }

  const handleCreate = (data: InsertItem) => {
    createItem.mutate(data, {
      onSuccess: () => setModalState({ ...modalState, isOpen: false }),
    });
  };

  const handleUpdate = (data: InsertItem) => {
    if (!modalState.item) return;
    updateItem.mutate(
      { id: modalState.item.id, ...data },
      { onSuccess: () => setModalState({ ...modalState, isOpen: false }) }
    );
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate(id);
  };

  const openCreateModal = () => {
    setModalState({ isOpen: true, mode: "create", initialBarcode: "" });
  };

  const openEditModal = (item: Item) => {
    setModalState({ isOpen: true, mode: "edit", item });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <PackageOpen className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight hidden sm:block">
              Inventory<span className="text-primary">Master</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative w-full max-w-[200px] md:max-w-xs hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-9 bg-muted/40 border-transparent focus:bg-background focus:border-primary transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setIsScannerOpen(true)} className="hidden sm:flex" variant="secondary">
              <ScanBarcode className="w-4 h-4 mr-2" />
              Scan
            </Button>
            
            <Button onClick={openCreateModal} className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="sm:hidden px-4 pb-4">
           <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-9 bg-muted/40 border-transparent focus:bg-background focus:border-primary transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Mobile Scan FAB */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="fixed bottom-6 right-6 z-50 sm:hidden h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <ScanBarcode className="w-7 h-7" />
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Loading inventory...</p>
          </div>
        ) : items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-bold font-display text-foreground mb-2">
              No items found
            </h2>
            <p className="text-muted-foreground max-w-sm mb-8">
              Your inventory is empty. Start by adding a new item manually or scan a barcode to quick-add.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setIsScannerOpen(true)} variant="outline">
                <ScanBarcode className="w-4 h-4 mr-2" />
                Scan Code
              </Button>
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Manually
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items?.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <Scanner 
          onScan={handleScan} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}

      {/* Create/Edit Modal */}
      <Dialog 
        open={modalState.isOpen} 
        onOpenChange={(open) => {
          if (!open) setModalState(prev => ({ ...prev, isOpen: false }));
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">
              {modalState.mode === "create" ? "Add New Item" : "Edit Item"}
            </DialogTitle>
            <DialogDescription>
              {modalState.mode === "create" 
                ? "Enter the item details below to add it to your inventory." 
                : "Update the item information below."}
            </DialogDescription>
          </DialogHeader>
          
          <ItemForm
            defaultValues={
              modalState.mode === "edit" 
                ? modalState.item 
                : { barcode: modalState.initialBarcode }
            }
            onSubmit={modalState.mode === "create" ? handleCreate : handleUpdate}
            isLoading={createItem.isPending || updateItem.isPending}
            buttonText={modalState.mode === "create" ? "Create Item" : "Save Changes"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
