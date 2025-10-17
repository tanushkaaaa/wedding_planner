import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Board as BoardType, Section } from "@/types/board";
import { BubbleNavigation } from "@/components/BubbleNavigation";
import { SectionView } from "@/components/SectionView";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { getBoardData, listenBoard, saveBoard } from "@/firebaseMagic";

import { ArrowLeft, Download, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardType | null>(null);
  const [navigationPath, setNavigationPath] = useState<Section[]>([]);
  const [currentSections, setCurrentSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showCollabDialog, setShowCollabDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 Load board from Firebase ONLY
  useEffect(() => {
    if (!id) return;

    // 1️⃣ Load existing board from Firebase
    getBoardData(id).then((firebaseBoard) => {
      if (firebaseBoard) {
        setBoard(firebaseBoard);
        setCurrentSections(firebaseBoard.sections);
        document.documentElement.setAttribute("data-theme", firebaseBoard.theme);
      } else {
        toast.error("Board not found");
        navigate("/");
      }
      setIsLoading(false);
    });

    // 2️⃣ Listen for live updates from other users
    const unsub = listenBoard(id, (firebaseBoard) => {
      if (firebaseBoard) {
        setBoard(firebaseBoard);
        // Update current sections if we're at the root level
        if (navigationPath.length === 0) {
          setCurrentSections(firebaseBoard.sections);
        }
      }
    });

    // 3️⃣ Cleanup
    return () => {
      unsub();
      document.documentElement.removeAttribute("data-theme");
    };
  }, [id, navigate]);

  // 🧱 Board Update Helper
  const updateBoard = (updatedBoard: BoardType) => {
    const boardWithTimestamp = {
      ...updatedBoard,
      updatedAt: new Date().toISOString(),
    };
    setBoard(boardWithTimestamp);
    saveBoard(updatedBoard.id, boardWithTimestamp); // Save to Firebase
  };

  // 🔍 Utility functions
  const findAndUpdateSection = (
    sections: Section[],
    sectionId: string,
    updateFn: (section: Section) => Section
  ): Section[] =>
    sections.map((section) =>
      section.id === sectionId
        ? updateFn(section)
        : {
            ...section,
            subsections: findAndUpdateSection(
              section.subsections,
              sectionId,
              updateFn
            ),
          }
    );

  const findAndDeleteSection = (sections: Section[], sectionId: string): Section[] =>
    sections
      .filter((section) => section.id !== sectionId)
      .map((section) => ({
        ...section,
        subsections: findAndDeleteSection(section.subsections, sectionId),
      }));

  // ➕ Add Section
  const handleAddSection = () => {
    if (!board) return;
    const newSection: Section = {
      id: Date.now().toString(),
      title: `Section ${currentSections.length + 1}`,
      notes: "",
      todos: [],
      files: [],
      subsections: [],
      isExpanded: true,
    };

    if (navigationPath.length === 0) {
      updateBoard({ ...board, sections: [...board.sections, newSection] });
      setCurrentSections([...currentSections, newSection]);
    } else {
      const parentSection = navigationPath[navigationPath.length - 1];
      const updatedSections = findAndUpdateSection(
        board.sections,
        parentSection.id,
        (section) => ({
          ...section,
          subsections: [...section.subsections, newSection],
        })
      );
      updateBoard({ ...board, sections: updatedSections });
      setCurrentSections([...currentSections, newSection]);
    }
    toast.success("Section added");
  };

  // 🪄 Section Handlers
  const handleSelectSection = (section: Section) => setSelectedSection(section);
  const handleNavigateToSubsection = (subId: string) => {
    if (!selectedSection) return;
    const sub = selectedSection.subsections.find((s) => s.id === subId);
    if (sub) {
      setNavigationPath([...navigationPath, selectedSection]);
      setCurrentSections(selectedSection.subsections);
      setSelectedSection(sub);
    }
  };
  const handleBack = () => setSelectedSection(null);
  const handleBreadcrumbNavigate = (index: number) => {
    if (!board) return;
    if (index === -1) {
      setNavigationPath([]);
      setCurrentSections(board.sections);
      setSelectedSection(null);
    } else {
      const newPath = navigationPath.slice(0, index + 1);
      setNavigationPath(newPath);
      setCurrentSections(newPath[newPath.length - 1].subsections);
      setSelectedSection(null);
    }
  };

  const handleUpdateSection = (updatedSection: Section) => {
    if (!board) return;
    const updatedSections = findAndUpdateSection(
      board.sections,
      updatedSection.id,
      () => updatedSection
    );
    updateBoard({ ...board, sections: updatedSections });
    setSelectedSection(updatedSection);
  };

  const handleDeleteSection = () => {
    if (!board || !selectedSection) return;
    if (!confirm("Delete this section and all its subsections?")) return;

    const updatedSections = findAndDeleteSection(board.sections, selectedSection.id);
    updateBoard({ ...board, sections: updatedSections });
    setSelectedSection(null);
    if (navigationPath.length === 0) setCurrentSections(updatedSections);
    toast.success("Section deleted");
  };

  // 📦 Export / Import
  const handleExport = () => {
    if (!board) return;
    const dataStr = JSON.stringify(board, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${board.title.replace(/\s+/g, "-")}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Board exported");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedBoard = JSON.parse(event.target?.result as string) as BoardType;
        const newId = Date.now().toString();
        importedBoard.id = newId;
        importedBoard.updatedAt = new Date().toISOString();
        
        // Save to Firebase
        await saveBoard(newId, importedBoard);
        toast.success("Board imported successfully");
        navigate(`/board/${newId}`);
      } catch {
        toast.error("Invalid board file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopyLink = () => {
    if (!id) return;
    const url = `${window.location.origin}/board/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) return null;

  // 🧠 UI
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{board.title}</h1>
              <Breadcrumbs
                items={navigationPath.map((s) => ({ id: s.id, title: s.title }))}
                onNavigate={handleBreadcrumbNavigate}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Users className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Import
                <input
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={handleImport}
                />
              </label>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      {selectedSection ? (
        <SectionView
          section={selectedSection}
          onUpdateSection={handleUpdateSection}
          onBack={handleBack}
          onNavigateToSubsection={handleNavigateToSubsection}
          onAddSubsection={handleAddSection}
          onDeleteSection={handleDeleteSection}
        />
      ) : (
        <BubbleNavigation
          sections={currentSections}
          onSelectSection={handleSelectSection}
          onAddSection={handleAddSection}
        />
      )}

      {/* Collaboration Dialog */}
      <Dialog open={showCollabDialog} onOpenChange={setShowCollabDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Board</DialogTitle>
            <DialogDescription>
              Copy the link below and share it with anyone!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/board/${id}`}
                className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
              />
              <Button onClick={handleCopyLink}>Copy</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Anyone with this link can view and edit the board in real-time.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
