import { FileAttachment } from "@/types/board";
import { FileText, Image, FileSpreadsheet, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileCardProps {
  file: FileAttachment;
  onDelete: (id: string) => void;
}

export function FileCard({ file, onDelete }: FileCardProps) {
  const getFileIcon = () => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-5 w-5" />;
    } else if (file.type.includes("pdf")) {
      return <FileText className="h-5 w-5" />;
    } else if (file.type.includes("sheet") || file.type.includes("excel")) {
      return <FileSpreadsheet className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  const isImage = file.type.startsWith("image/");

  return (
    <div className="group relative bg-accent/30 border border-border rounded-lg p-4 hover:shadow-medium transition-all">
      {isImage && (
        <div className="mb-3 rounded-md overflow-hidden bg-muted">
          <img
            src={file.data}
            alt={file.name}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="text-primary mt-1">{getFileIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7"
          onClick={handleDownload}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7 hover:text-destructive"
          onClick={() => onDelete(file.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
