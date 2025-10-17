import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeType } from "@/types/board";
import { Sparkles, Moon, Crown, Palette } from "lucide-react";

interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, theme: ThemeType) => void;
}

const themes: { value: ThemeType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "pastel", label: "Pastel", icon: <Palette className="h-5 w-5" />, description: "Soft and calming" },
  { value: "dark", label: "Dark", icon: <Moon className="h-5 w-5" />, description: "Sleek and modern" },
  { value: "elegant", label: "Elegant", icon: <Crown className="h-5 w-5" />, description: "Refined and classic" },
  { value: "playful", label: "Playful", icon: <Sparkles className="h-5 w-5" />, description: "Vibrant and fun" },
];

export function CreateBoardModal({ open, onClose, onCreate }: CreateBoardModalProps) {
  const [title, setTitle] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("pastel");

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title.trim(), selectedTheme);
      setTitle("");
      setSelectedTheme("pastel");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Board</DialogTitle>
          <DialogDescription>
            Give your board a title and choose a theme to get started.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Board Title</Label>
            <Input
              id="title"
              placeholder="e.g., Wedding Planning, Product Launch..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label>Choose Theme</Label>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setSelectedTheme(theme.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-medium ${
                    selectedTheme === theme.value
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${selectedTheme === theme.value ? "text-primary" : "text-muted-foreground"}`}>
                      {theme.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{theme.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{theme.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>
            Create Board
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
