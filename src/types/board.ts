export type ThemeType = "pastel" | "dark" | "elegant" | "playful";

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded
  uploadedAt: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Section {
  id: string;
  title: string;
  notes: string;
  todos: TodoItem[];
  files: FileAttachment[];
  subsections: Section[];
  isExpanded: boolean;
}

export interface Board {
  id: string;
  title: string;
  theme: ThemeType;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
}
