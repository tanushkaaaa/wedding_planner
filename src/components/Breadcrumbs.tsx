import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  id: string;
  title: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(-1)}
        className="h-8 px-2"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant={index === items.length - 1 ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onNavigate(index)}
            className="h-8"
            disabled={index === items.length - 1}
          >
            {item.title}
          </Button>
        </div>
      ))}
    </div>
  );
}
