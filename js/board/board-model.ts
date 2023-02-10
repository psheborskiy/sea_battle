import { BOATS_CAPACITY, FIELD_SIZE } from "../const/conts";
import { TBoatType } from "../types/boat";
import Direction, { TDirection } from "../types/direction";

export const generateEmptyBoard = (): string[][] => {
  return [
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null]
  ];
};

export const boatInValidPosition = (boatCoords: number[][], board: string[][]): boolean => {
  let result = [];

  for (let i = 0; i < boatCoords.length; i++) {
    const x = boatCoords[i][0];
    const y = boatCoords[i][1];

    result.push(
      !!board?.[y - 1]?.[x - 1] !== true &&
      !!board?.[y - 1]?.[x] !== true &&
      !!board?.[y - 1]?.[x + 1] !== true &&
      !!board?.[y]?.[x + 1] !== true &&
      !!board?.[y + 1]?.[x + 1] !== true &&
      !!board?.[y + 1]?.[x] !== true &&
      !!board?.[y + 1]?.[x - 1] !== true &&
      !!board?.[y]?.[x - 1] !== true && 
      !!board?.[y]?.[x] !== true
    );
  }

  return result.every(v => v === true);
};

export const generateBoats = (): string[][] => {
  const newBoard = generateEmptyBoard();

  for (let i = 0; i < BOATS_CAPACITY.length; i++) {
    for (let j = 0; j < BOATS_CAPACITY[i].count; j++) {
      let boatCoords = generateBoat(BOATS_CAPACITY[i].size);

      while (boatInValidPosition(boatCoords, newBoard) === false) {
        boatCoords = generateBoat(BOATS_CAPACITY[i].size);
      }

      for (let k = 0; k < boatCoords.length; k++) {
        const x = boatCoords[k][0];
        const y = boatCoords[k][1];

        newBoard[y][x] = "boat";
      }
    }
  }

  return newBoard;
};

export const generateBoat = (boatLength: TBoatType): number[][] => {
  const direction: TDirection = Direction.getDirection();
  const rnd = Math.floor(Math.random() * FIELD_SIZE);
  const boatHead = Math.floor(Math.random() * (FIELD_SIZE - boatLength)) + 1;
  const boat = [];

  if (direction === "col") {
    for (let i = 0; i < boatLength; i++) {
      boat.push([rnd, boatHead + i]);
    }
  } else {
    for (let i = 0; i < boatLength; i++) {
      boat.push([boatHead + i, rnd]);
    }
  }

  return boat;
};

export const calculateCount = (myBoard: string[][], enemyBoard: string[][]) => {
  const myBoatsDrowned = myBoard.reduce(
    (currentCount, row) =>
      currentCount + row.filter((i) => i === "drowned").length,
    0
  );
  const enemyInjured = enemyBoard.reduce(
    (currentCount, row) =>
      currentCount + row.filter((i) => i === "injured").length,
    0
  );

  return `${enemyInjured} : ${myBoatsDrowned}`
}