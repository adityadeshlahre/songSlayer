import { Song } from "./Song";
import { Vote } from "./Vote";
import { VotingManager } from "./VotingManager";

export class SongsManager {
  private songs: Song[];

  private votingManager: VotingManager;

  constructor(votingManager: VotingManager) {
    this.songs = [];
    this.votingManager = votingManager;
  }

  private generateRandomId(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomId = "";
    for (let i = 0; i < 3; i++) {
      randomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomId;
  }

  submitSong(song: Song): Vote[] {
    const existingSong = this.songs.find((s) => s.id === song.id);
    const currentSongsOnVote: Vote[] = this.votingManager.getSongVotes();
    const existingSongOnVote = currentSongsOnVote.find(
      (s) => s.song.id === song.id
    );
    if (!existingSong && !existingSongOnVote) {
      this.songs.push(song);
      this.votingManager.addSongForVoting(song);
    }
    const currentSongsOnVoteUpdated: Vote[] = this.votingManager.getSongVotes();
    return currentSongsOnVoteUpdated;
  }

  addSong(song: Song): Song[] {
    if (song.id === "") {
      song.id = this.generateRandomId();
    }
    const existingSong = this.songs.find((s) => s.id === song.id);
    if (!existingSong) {
      this.songs.push(song);
      this.votingManager.initializeSongVotes(this.songs);
    }
    return this.songs;
  }

  removeSongs(songsId: string): Song[] {
    const index = this.songs.findIndex((song) => song.id === songsId);
    if (index !== -1) {
      this.songs.splice(index, 1);
      this.votingManager.removeSongVote(songsId);
    }
    return this.songs;
  }

  addSongsToQueue(songs: Song) {
    //this should be redish queue
  }

  randomSong(id: string, image: string, ytUrl: string): void {
    this.songs.push({ id, image, ytUrl });
  }

  getAllSongs(): Song[] {
    return this.songs;
  }

  // You can add more methods as needed, such as removing songs, updating song details, etc.
}
