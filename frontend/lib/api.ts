const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ProcessMode = "answers" | "notes" | "both";

export async function uploadFile(file: File, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);
  const res = await fetch(`${API_URL}/upload/`, { method: "POST", body: formData });
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Upload failed"); }
  return res.json();
}

export async function processFile(filePath: string, mode: ProcessMode, userId: string) {
  const res = await fetch(`${API_URL}/process/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_path: filePath, mode, user_id: userId }),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Processing failed"); }
  return res.json();
}

export async function fetchHistory(userId: string) {
  const res = await fetch(`${API_URL}/history/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

// NEW: fetch single result directly by ID
export async function fetchResult(userId: string, resultId: string) {
  const res = await fetch(`${API_URL}/history/${userId}/${resultId}`);
  if (!res.ok) throw new Error("Result not found");
  return res.json();
}

// NEW: delete a session
export async function deleteResult(userId: string, resultId: string) {
  const res = await fetch(`${API_URL}/history/${userId}/${resultId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(
  userId: string,
  resultId: string,
  message: string,
  history: ChatMessage[]
) {
  const res = await fetch(`${API_URL}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      result_id: resultId,
      message,
      history,
    }),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Chat failed"); }
  return res.json(); // { reply: string }
}