import { Section } from "@/types/board";
import { SectionBubble } from "./SectionBubble";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";

interface BubbleNavigationProps {
  sections: Section[];
  onSelectSection: (section: Section) => void;
  onAddSection: () => void;
}

export function BubbleNavigation({
  sections,
  onSelectSection,
  onAddSection,
}: BubbleNavigationProps) {
  return (
    <div className="relative w-full h-full min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Central content */}
      <div className="relative z-10 w-full h-full">
        {sections.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
                <Layers className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Start Organizing</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                Create your first section to begin organizing your thoughts
              </p>
              <Button onClick={onAddSection} size="lg" className="shadow-elevated">
                <Plus className="mr-2 h-5 w-5" />
                Create First Section
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Center button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <Button
                onClick={onAddSection}
                size="lg"
                className="rounded-full w-20 h-20 shadow-elevated hover:scale-110 transition-transform"
              >
                <Plus className="h-8 w-8" />
              </Button>
            </div>

            {/* Section bubbles */}
            {sections.map((section, index) => (
              <SectionBubble
                key={section.id}
                section={section}
                onClick={() => onSelectSection(section)}
                index={index}
                total={sections.length}
              />
            ))}
          </>
        )}
      </div>

      {/* Instructions */}
      {sections.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-sm text-muted-foreground animate-fade-in">
          Click any bubble to explore • Click center to add new section
        </div>
      )}
    </div>
  );
}
