import { TBoatType } from "../types/boat";

export const FIELD_SIZE = 10;
export const ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export const COLOUMNS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
export const BOATS_CAPACITY: { size: TBoatType, count: number }[] = [
  {
    size: 4,
    count: 1
  },
  {
    size: 3,
    count: 2
  },
  {
    size: 2,
    count: 3
  },
  {
    size: 1,
    count: 4
  }
]