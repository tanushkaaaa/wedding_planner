import { useState } from "react";
import { Section, TodoItem, FileAttachment } from "@/types/board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FileCard } from "./FileCard";
import {
  Plus,
  Trash2,
  Upload,
  Save,
  ArrowLeft,
  Edit2,
  Check,
  X,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";

interface SectionViewProps {
  section: Section;
  onUpdateSection: (section: Section) => void;
  onBack: () => void;
  onNavigateToSubsection: (subsectionId: string) => void;
  onAddSubsection: () => void;
  onDeleteSection: () => void;
}

export function SectionView({
  section,
  onUpdateSection,
  onBack,
  onNavigateToSubsection,
  onAddSubsection,
  onDeleteSection,
}: SectionViewProps) {
  const [notes, setNotes] = useState(section.notes);
  const [newTodo, setNewTodo] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onUpdateSection({ ...section, title: editedTitle.trim() });
      setIsEditingTitle(false);
      toast.success("Section renamed");
    }
  };

  const handleCancelTitle = () => {
    setEditedTitle(section.title);
    setIsEditingTitle(false);
  };

  const handleSaveNotes = () => {
    onUpdateSection({ ...section, notes });
    toast.success("Notes saved");
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
      };
      onUpdateSection({
        ...section,
        todos: [...section.todos, newTodoItem],
      });
      setNewTodo("");
      toast.success("Todo added");
    }
  };

  const handleToggleTodo = (todoId: string) => {
    onUpdateSection({
      ...section,
      todos: section.todos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      ),
    });
  };

  const handleDeleteTodo = (todoId: string) => {
    onUpdateSection({
      ...section,
      todos: section.todos.filter((todo) => todo.id !== todoId),
    });
    toast.success("Todo deleted");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: FileAttachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target?.result as string,
          uploadedAt: new Date().toISOString(),
        };

        onUpdateSection({
          ...section,
          files: [...section.files, newFile],
        });
        toast.success(`${file.name} attached`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleDeleteFile = (fileId: string) => {
    onUpdateSection({
      ...section,
      files: section.files.filter((file) => file.id !== fileId),
    });
    toast.success("File removed");
  };

  return (
    <div className="min-h-screen bg-background overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") handleCancelTitle();
                  }}
                  className="text-2xl font-bold h-12"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
                  <Check className="h-5 w-5 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelTitle}>
                  <X className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate">{section.title}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onAddSubsection}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Add Subsection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteSection}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-8 space-y-8">
        {/* Subsections Grid */}
        {section.subsections.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <h2 className="text-lg font-semibold mb-4">Subsections</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {section.subsections.map((subsection) => (
                <button
                  key={subsection.id}
                  onClick={() => onNavigateToSubsection(subsection.id)}
                  className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 hover:border-primary hover:scale-105 transition-all text-left group"
                >
                  <div className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-primary">
                    {subsection.title}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {subsection.notes && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                    {subsection.todos.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    )}
                    {subsection.files.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Notes</h2>
            <Button size="sm" onClick={handleSaveNotes} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
          <Textarea
            placeholder="Write your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[200px] resize-y"
          />
        </div>

        {/* Todos */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-semibold">Todo List</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Add a new todo..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
            />
            <Button onClick={handleAddTodo}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {section.todos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No todos yet</p>
            ) : (
              section.todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {todo.text}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Files */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Attachments</h2>
            <Button size="sm" variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
          </div>
          {section.files.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No files attached yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.files.map((file) => (
                <FileCard key={file.id} file={file} onDelete={handleDeleteFile} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
