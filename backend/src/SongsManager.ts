import { Songs } from "./Songs";
import { Vote } from "./Voting";
import { VotingManager } from "./VotingManager";

export class SongsManager {
  private songs: Songs[];

  //   [
  //     { id: "1", image: "image1.jpg", ytUrl: "youtube.com/song1" },
  //     { id: "2", image: "image2.jpg", ytUrl: "youtube.com/song2" },
  //     { id: "3", image: "image3.jpg", ytUrl: "youtube.com/song3" },
  //     { id: "4", image: "image4.jpg", ytUrl: "youtube.com/song4" },
  //   ];

  private votingManager: VotingManager;

  constructor() {
    this.songs = [];
    this.votingManager = new VotingManager();
    // this.votingManager.initializeSongVotes(this.songs.map((song) => song.id));
  }

  submitSong(song: Songs): Vote[] {
    // this will return songs in votingManager
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
  } // this method need fixes

  addSong(song: Songs): Songs[] {
    // this will return songs in songsManager
    const existingSong = this.songs.find((s) => s.id === song.id);
    if (!existingSong) {
      this.songs.push(song);
      this.votingManager.initializeSongVotes(this.songs);
    }
    return this.songs;
  }

  removeSongs(songsId: string): Songs[] {
    const index = this.songs.findIndex((song) => song.id === songsId);
    if (index !== -1) {
      this.songs.splice(index, 1);
      this.votingManager.removeSongVote(songsId);
    }
    return this.songs;
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
