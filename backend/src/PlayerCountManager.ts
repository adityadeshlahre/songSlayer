export class PlayerCountManager {
  public playerCount: number;

  constructor() {
    this.playerCount = 0;
  }

  incrementPlayerCount() {
    this.playerCount++;
  }

  decrementPlayerCount() {
    this.playerCount--;
  }

  getPlayerCount() {
    return this.playerCount;
  }
}
