export type TBoatType = 1 | 2 | 3 | 4;

export default class Boat {
  private type: TBoatType

  constructor(type: TBoatType) {
    this.type = type
  }
}