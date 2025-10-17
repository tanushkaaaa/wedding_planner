import { Section } from "@/types/board";
import { FolderOpen, ChevronRight } from "lucide-react";

interface SectionBubbleProps {
  section: Section;
  onClick: () => void;
  index: number;
  total: number;
}

export function SectionBubble({ section, onClick, index, total }: SectionBubbleProps) {
  // Calculate position in a circular layout
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
  const radius = Math.min(200, 150 + total * 10);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const hasContent = section.notes || section.todos.length > 0 || section.files.length > 0;
  const hasSubsections = section.subsections.length > 0;

  return (
    <div
      className="absolute cursor-pointer group animate-fade-in"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
    >
      <div className="relative">
        {/* Main circle */}
        <div
          className={`
            w-32 h-32 rounded-full 
            bg-gradient-to-br from-primary/20 to-primary/5
            border-2 border-primary/40
            flex flex-col items-center justify-center
            transition-all duration-300
            hover:scale-110 hover:shadow-elevated hover:border-primary
            ${hasContent ? "ring-4 ring-primary/20" : ""}
          `}
        >
          <FolderOpen className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm font-semibold text-center px-2 line-clamp-2">
            {section.title}
          </span>
        </div>

        {/* Content indicators */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {section.notes && (
            <div className="w-2 h-2 rounded-full bg-accent" title="Has notes" />
          )}
          {section.todos.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-secondary" title="Has todos" />
          )}
          {section.files.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-muted" title="Has files" />
          )}
        </div>

        {/* Subsection indicator */}
        {hasSubsections && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-medium">
              {section.subsections.length}
            </div>
          </div>
        )}

        {/* Arrow indicator */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
