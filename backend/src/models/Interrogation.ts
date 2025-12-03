export interface Interrogation {
  id: number;
  title: string;
  date: string; // ISO date string
  suspect: string;
  officer: string;
  notes: string;
  audioFilePath?: string; // Path to the audio recording
  transcript?: string; // Transcription of the audio
  wordDocumentPath?: string; // Path to the generated Word document
  createdAt: Date;
  updatedAt: Date;
  createdBy: number; // User ID of the creator
}

// Mock data for interrogations
export const interrogations: Interrogation[] = [
  {
    id: 1,
    title: "Initial Interview",
    date: "2023-05-15",
    suspect: "John Doe",
    officer: "Officer Smith",
    notes: "Initial questioning of the suspect",
    audioFilePath: "/uploads/audio/initial-interview-1.wav",
    transcript:
      "Officer Smith: You are under arrest...\nJohn Doe: I want to remain silent...",
    wordDocumentPath: "/documents/initial-interview-1.docx",
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-05-15"),
    createdBy: 1,
  },
  {
    id: 2,
    title: "Follow-up Interview",
    date: "2023-05-20",
    suspect: "John Doe",
    officer: "Officer Johnson",
    notes: "Follow-up questions regarding alibi",
    audioFilePath: "/uploads/audio/followup-interview-2.wav",
    transcript:
      "Officer Johnson: Where were you on the night of...\nJohn Doe: I was at home...",
    wordDocumentPath: "/documents/followup-interview-2.docx",
    createdAt: new Date("2023-05-20"),
    updatedAt: new Date("2023-05-20"),
    createdBy: 1,
  },
];
