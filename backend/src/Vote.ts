import { Song } from "./Song";

export interface Vote {
  id: string;
  song: Song;
  votes: number;
}
