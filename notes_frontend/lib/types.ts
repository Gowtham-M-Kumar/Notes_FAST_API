// User types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: User;
}

// Note types
export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: number;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title: string;
  content: string;
}

// Version types
export interface NoteVersion {
  id: number;
  note: number;
  version_number: number;
  title: string;
  content: string;
  created_at: string;
}
