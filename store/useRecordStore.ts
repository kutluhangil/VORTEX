import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface RecordState {
  recording: boolean;
  recordingDuration: number;
  exportModalOpen: boolean;

  setRecording: (v: boolean) => void;
  setRecordingDuration: (v: number) => void;
  setExportModalOpen: (v: boolean) => void;
}

export const useRecordStore = create<RecordState>()(
  devtools(
    (set) => ({
      recording: false,
      recordingDuration: 0,
      exportModalOpen: false,

      setRecording: (v) => set({ recording: v }),
      setRecordingDuration: (v) => set({ recordingDuration: v }),
      setExportModalOpen: (v) => set({ exportModalOpen: v }),
    }),
    { name: "record" },
  ),
);
