import { Vote } from "./Voting";

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

  initializeSongVotes(songsIds: string[]) {
    this.songVotes = songsIds.map((songsId) => ({
      id: this.generateRandomId(),
      songsId,
      votes: 0,
    }));
    return this.songVotes;
  }

  voteForSong(songId: string) {
    const songIndex = this.songVotes.findIndex((songs) => songs.id === songId);
    if (songIndex !== -1) {
      this.songVotes[songIndex].votes++;
      return this.getSongVotes();
    } else {
      throw new Error("Invalid song ID");
    }
  }

  getSongVotes() {
    return this.songVotes;
  }

  // You can add more methods as needed, such as determining the winning song, resetting votes, etc.
}
