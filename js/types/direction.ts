export type TDirection = "row" | "col";

export default class Direction {
  static getDirection(): TDirection {
    return Math.round(Math.random()) === 0 ? "row" : "col";
  }
}