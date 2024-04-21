import { Songs } from "./Songs";
import { VotingManager } from "./VotingManager";

export class SongsManager {
  private songs: Songs[] = [];

  //   [
  //     { id: "1", image: "image1.jpg", ytUrl: "youtube.com/song1" },
  //     { id: "2", image: "image2.jpg", ytUrl: "youtube.com/song2" },
  //     { id: "3", image: "image3.jpg", ytUrl: "youtube.com/song3" },
  //     { id: "4", image: "image4.jpg", ytUrl: "youtube.com/song4" },
  //   ];

  private votingManager: VotingManager;

  constructor() {
    // this.songs = [];
    this.votingManager = new VotingManager();
    // this.votingManager.initializeSongVotes(this.songs.map((song) => song.id));
  }

  submitSong(song: Songs): void {
    const existingSong = this.songs.find((s) => s.id === song.id);
    if (!existingSong) {
      this.songs.push(song);
      this.votingManager.addSongForVoting(song);
    }
  }

  addSong(song: Songs): Songs[] {
    const existingSong = this.songs.find((s) => s.id === song.id);
    if (!existingSong) {
      this.songs.push(song);
      this.votingManager.initializeSongVotes(this.songs);
    }
    return this.songs;
  }

  removeSongs(songsId: string): void {
    const index = this.songs.findIndex((song) => song.id === songsId);
    if (index !== -1) {
      this.songs.splice(index, 1);
      this.votingManager.removeSongVote(songsId);
    }
  }

  addSongsToQueue(songs: Songs) {
    //this should be redish queue
  }

  randomSong(id: string, image: string, ytUrl: string): void {
    this.songs.push({ id, image, ytUrl });
  }

  getAllSongs(): Songs[] {
    return this.songs;
  }

  // You can add more methods as needed, such as removing songs, updating song details, etc.
}
