import { Persona } from "./persona";

export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export interface Thread {
  id: string;
  persona: Persona;
  messages: Message[];
  mood?: number;
  createdAt: Date;
  title: string;
  savedWithPersona?: boolean;
}
