import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreateBoardModal } from "@/components/CreateBoardModal";
import { Board, ThemeType } from "@/types/board";
import { Plus, FolderKanban, Calendar, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Index() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch boards from Firebase on component mount
  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const boardsRef = collection(db, "boards");
      const q = query(boardsRef, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const fetchedBoards: Board[] = [];
      querySnapshot.forEach((doc) => {
        fetchedBoards.push({ id: doc.id, ...doc.data() } as Board);
      });
      
      setBoards(fetchedBoards);
    } catch (error) {
      console.error("Error fetching boards:", error);
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (title: string, theme: ThemeType) => {
    try {
      const newBoard = {
        title,
        theme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sections: [],
      };

      const docRef = await addDoc(collection(db, "boards"), newBoard);
      
      const boardWithId = { id: docRef.id, ...newBoard };
      setBoards([boardWithId, ...boards]);
      
      toast.success("Board created successfully!");
      navigate(`/board/${docRef.id}`);
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board");
    }
  };

  const deleteBoard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this board?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "boards", id));
      setBoards(boards.filter((b) => b.id !== id));
      toast.success("Board deleted");
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Failed to delete board");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderKanban className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">StoryFlow</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your visual organizer for events, projects, and life planning
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Create Button */}
        <div className="mb-12">
          <Button
            size="lg"
            onClick={() => setShowCreateModal(true)}
            className="h-14 px-8 text-lg shadow-medium hover:shadow-elevated transition-all"
            disabled={loading}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Board
          </Button>
        </div>

        {/* Boards Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <FolderKanban className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading boards...</p>
          </div>
        ) : boards.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Your Boards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="group relative bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-elevated hover:border-primary/50 transition-all animate-slide-in-up"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold mb-1 truncate group-hover:text-primary transition-colors">
                        {board.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="capitalize">{board.theme}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteBoard(board.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-2 -mr-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>{board.sections?.length || 0} sections</span>
                      <span>{formatDate(board.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Theme indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 rounded-b-xl">
                    <div className="h-full w-1/3 bg-primary rounded-bl-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <FolderKanban className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">No boards yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first board to start organizing your events, projects, or plans
            </p>
            <Button onClick={() => setShowCreateModal(true)} variant="outline" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </div>
        )}
      </main>

      <CreateBoardModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createBoard}
      />
    </div>
  );
}
