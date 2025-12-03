import mongoose, { Document, Schema } from "mongoose";

export interface IInterrogation extends Document {
  title: string;
  date: Date;
  suspect: string;
  officer: string;
  transcript: string;
  audioFilePath?: string;
  wordDocumentPath?: string;
  createdBy: mongoose.Types.ObjectId;
}

const InterrogationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    suspect: {
      type: String,
      required: true,
    },
    officer: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
      required: false,
      default: "",
    },
    audioFilePath: {
      type: String,
    },
    wordDocumentPath: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInterrogation>(
  "Interrogation",
  InterrogationSchema
);
