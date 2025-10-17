import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Board } from "./types/board";

export async function getBoardData(id: string): Promise<Board | null> {
  const ref = doc(db, "boards", id);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Board) : null;
}

export function listenBoard(id: string, callback: (data: Board) => void) {
  const ref = doc(db, "boards", id);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data() as Board);
  });
}

export async function saveBoard(id: string, data: Board) {
  const ref = doc(db, "boards", id);
  await setDoc(ref, data);
}
