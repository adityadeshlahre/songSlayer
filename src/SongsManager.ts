import { Songs } from "./Songs";

export class SongsManager {
  private songs: Songs[];

  constructor() {
    this.songs = [];
  }

  addSong(songs: Songs) {
    this.songs.push(songs);
  }

  removeSongs(songs: Songs) {
    //remove the current songs
  }

  addSongsToQueue(songs: Songs) {
    //this should be redish queue
  }

  getAllSongs() {
    return this.songs;
  }

  // You can add more methods as needed, such as removing songs, updating song details, etc.
}
