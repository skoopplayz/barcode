import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertItem } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch all items
export function useItems(search?: string) {
  return useQuery({
    queryKey: [api.items.list.path, search],
    queryFn: async () => {
      const url = search 
        ? `${api.items.list.path}?search=${encodeURIComponent(search)}` 
        : api.items.list.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch items");
      return api.items.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch single item by ID
export function useItem(id: number) {
  return useQuery({
    queryKey: [api.items.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.items.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch item");
      return api.items.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Fetch item by Barcode
export function useItemByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: [api.items.getByBarcode.path, barcode],
    queryFn: async () => {
      if (!barcode) return null;
      const url = buildUrl(api.items.getByBarcode.path, { barcode });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch item by barcode");
      return api.items.getByBarcode.responses[200].parse(await res.json());
    },
    enabled: !!barcode,
    retry: false,
  });
}

// Create Item
export function useCreateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertItem) => {
      const res = await fetch(api.items.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Item with this barcode already exists");
        }
        const error = await res.json();
        throw new Error(error.message || "Failed to create item");
      }
      return api.items.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.items.list.path] });
      toast({ title: "Success", description: "Item created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}

// Update Item
export function useUpdateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertItem>) => {
      const url = buildUrl(api.items.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update item");
      }
      return api.items.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.items.list.path] });
      // Invalidate specific item queries too
      queryClient.invalidateQueries({ queryKey: [api.items.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.items.getByBarcode.path] });
      toast({ title: "Success", description: "Item updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}

// Delete Item
export function useDeleteItem() {
  const queryClient = useQueryClient();
