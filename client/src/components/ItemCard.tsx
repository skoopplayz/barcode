import { type Item } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Package, Tag } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge variant="outline" className="font-mono text-xs text-muted-foreground bg-muted/50 border-0">
            {item.barcode}
          </Badge>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            item.quantity > 0 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {item.quantity} in stock
          </div>
        </div>

        <h3 className="text-xl font-bold font-display text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Tag className="w-3 h-3" />
          <span>{item.category || "Uncategorized"}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-2">
          {item.description || "No description provided."}
        </p>
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-muted/30 flex justify-end gap-2 border-t border-border/50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(item)}
          className="hover:bg-background hover:text-primary"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove "{item.name}" from your inventory. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(item.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
