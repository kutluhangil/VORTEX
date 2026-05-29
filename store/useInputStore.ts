import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface InputState {
  audioEnabled: boolean;
  cameraEnabled: boolean;
  imageObstacle: ImageData | null;
  textObstacle: string;
  splatForce: number;
  splatRadius: number;
  audioSensitivity: number;
  webcamFlowStrength: number;
  obstacleThreshold: number;

  setAudioEnabled: (v: boolean) => void;
  setCameraEnabled: (v: boolean) => void;
  setImageObstacle: (data: ImageData | null) => void;
  setTextObstacle: (text: string) => void;
  setSplatForce: (v: number) => void;
  setSplatRadius: (v: number) => void;
  setAudioSensitivity: (v: number) => void;
  setWebcamFlowStrength: (v: number) => void;
  setObstacleThreshold: (v: number) => void;
}

export const useInputStore = create<InputState>()(
  devtools(
    (set) => ({
      audioEnabled: false,
      cameraEnabled: false,
      imageObstacle: null,
      textObstacle: "",
      splatForce: 6000,
      splatRadius: 0.25,
      audioSensitivity: 1.0,
      webcamFlowStrength: 0.5,
      obstacleThreshold: 0.3,

      setAudioEnabled: (v) => set({ audioEnabled: v }),
      setCameraEnabled: (v) => set({ cameraEnabled: v }),
      setImageObstacle: (data) => set({ imageObstacle: data }),
      setTextObstacle: (text) => set({ textObstacle: text }),
      setSplatForce: (v) => set({ splatForce: v }),
      setSplatRadius: (v) => set({ splatRadius: v }),
      setAudioSensitivity: (v) => set({ audioSensitivity: v }),
      setWebcamFlowStrength: (v) => set({ webcamFlowStrength: v }),
      setObstacleThreshold: (v) => set({ obstacleThreshold: v }),
    }),
    { name: "input" },
  ),
);
