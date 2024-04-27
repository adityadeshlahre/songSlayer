import { Song } from "./Song";
import { Vote } from "./Vote";

export class VotingManager {
  private songVotes: Vote[];

  constructor() {
    this.songVotes = [];
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

  initializeSongVotes(songs: Song[]): Vote[] {
    this.songVotes = songs.map((song) => ({
      id: song.id || this.generateRandomId(),
      song,
      votes: 0,
    }));
    return this.songVotes;
  }

  addSongForVoting(song: Song): Vote[] {
    if (!this.songVotes.some((v) => v.song.id === song.id)) {
      this.songVotes.push({
        id: song.id || this.generateRandomId(),
        song,
        votes: 0,
      });
    }
    return this.songVotes;
  }

  voteForSong(songId: string): Vote[] {
    const songIndex = this.songVotes.findIndex((song) => song.id === songId);
    if (songIndex !== -1) {
      this.songVotes[songIndex].votes++;
      return this.getSongVotes();
    } else {
      throw new Error("Invalid song ID");
    }
  }

  removeSongVote(songsId: string): void {
    this.songVotes = this.songVotes.filter((song) => song.song.id !== songsId);
  }

  getWinningSongs(): string[] {
    const maxVotes = Math.max(...this.songVotes.map((song) => song.votes));
    const winningSongs = this.songVotes
      .filter((song) => song.votes === maxVotes)
      .map((song) => song.song.ytUrl);

    return winningSongs;
  }

  getSongVotes(): Vote[] {
    return this.songVotes;
  }

  resetVotes(): void {
    this.songVotes.forEach((song) => {
      song.votes = 0;
    });
  }
}
