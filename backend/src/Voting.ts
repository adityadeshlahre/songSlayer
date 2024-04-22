import { Songs } from "./Songs";

export interface Vote {
  id: string;
  song: Songs;
  votes: number;
}
