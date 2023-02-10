import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { COLOUMNS, ROWS } from "../const/conts";
import { Boat } from "../components/boat";
import {
  calculateCount,
  generateBoats,
  generateEmptyBoard,
} from "./board-model";
import { Injured } from "../components/Injured";
import { Miss } from "../components/miss";
import { TPosition } from "../types/position";

const socket = io({
  port: 3001,
  reconnection: true,
  reconnectionDelay: 5000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 3,
});

const BoardComponent = () => {
  const [myBoard, setMyBoard] = useState(generateEmptyBoard());
  const [enemyBoard, setEnemyBoard] = useState(generateEmptyBoard());
  const [backTimer, setBackTimer] = useState(0);
  const [gameStatus, setGameStatus] = useState("");
  const [spiner, setSpiner] = useState(false);

  useEffect(() => {
    socket.on("timer", (data) => {
      setBackTimer(data.timer);

      if (data.timer === 0) {
        socket.emit("boardGenerated", myBoard);
      }
    });

    socket.on("drowned", (data) => {
      const newMyBoard = JSON.parse(JSON.stringify(myBoard));
      newMyBoard[data.y][data.x] = "drowned";
      setMyBoard(newMyBoard);
    });

    socket.on("new_game", () => {
      setMyBoard(generateBoats());
    });

    return () => {
      socket.off("timer");
      socket.off("drowned");
      socket.off("new_game");
    };
  }, [myBoard]);

  useEffect(() => {
    socket.on("injured", injured);
    socket.on("miss", miss);

    socket.on("new_game", () => {
      setEnemyBoard(generateEmptyBoard());
    });

    return () => {
      socket.off("injured");
      socket.off("miss");
      socket.off("new_game");
    };
  }, [enemyBoard]);

  useEffect(() => {
    socket.on("game_status_changed", (status) => {
      setGameStatus(status);
    });

    return () => {
      socket.off("game_status_changed");
    };
  }, [gameStatus]);

  useEffect(() => {
    socket.on("turn", (playerId) => {
      setSpiner(socket.id == playerId ? false : true);
    });

    return () => {
      socket.off("turn");
    };
  }, [spiner]);

  useEffect(() => {
    socket.on("info", (data) => {
      alert(data.message);
    });

    return () => {
      socket.off("info");
    };
  }, []);

  const newGame = () => {
    socket.emit("new_game", {});
  };

  const doAttack = (coords: TPosition) => {
    socket.emit("fire", {
      x: coords.x,
      y: coords.y,
    });
  };

  const injured = (coords: TPosition) => {
    const newEnemyBoard = JSON.parse(JSON.stringify(enemyBoard));

    newEnemyBoard[coords.y][coords.x] = "injured";
    setEnemyBoard(newEnemyBoard);
  };

  const miss = (coords: TPosition) => {
    const newEnemyBoard = JSON.parse(JSON.stringify(enemyBoard));

    newEnemyBoard[coords.y][coords.x] = "miss";
    setEnemyBoard(newEnemyBoard);
  };

  const renderIndexes = () => {
    return [...[""], ...COLOUMNS].map((j) => {
      return (
        <div className="index" key={j}>
          {j}
        </div>
      );
    });
  };

  const generateBoatsClick = () => {
    if(`${gameStatus}`.includes("placement")) {
      setMyBoard(generateBoats());
    }
  };

  return (
    <>
      <section className="my-board">
        {ROWS.map((i) => {
          return (
            <React.Fragment key={`row${i}`}>
              <div className="index">{i + 1}</div>
              {COLOUMNS.map((latter, j) => {
                return (
                  <div className="cell" key={latter}>
                    {myBoard[i][j] ? (
                      <Boat status={myBoard[i][j]}></Boat>
                    ) : null}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
        {renderIndexes()}
      </section>
      <section className="status-bar">
        {backTimer < 60 && backTimer > 0 && (
          <div className="timer">{backTimer}</div>
        )}
        {spiner ? <div className="point">• • •</div> : null}
        <div className="counter">{calculateCount(myBoard, enemyBoard)}</div>
        <div className="status">{gameStatus}</div>
      </section>
      <section className="opponent-board">
        {ROWS.map((i) => {
          return (
            <React.Fragment key={`row${i}`}>
              <div className="index">{i + 1}</div>

              {COLOUMNS.map((latter, j) => {
                return (
                  <div
                    className="cell"
                    onClick={() => doAttack({ x: j, y: i })}
                    key={latter}
                  >
                    {enemyBoard[i][j] === "injured" ? (
                      <Injured></Injured>
                    ) : enemyBoard[i][j] === "miss" ? (
                      <Miss></Miss>
                    ) : null}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
        {renderIndexes()}
      </section>
      <section className="controls">
        <button className="button" onClick={() => generateBoatsClick()}>
          Generate boats
        </button>
        <button className="button" onClick={newGame}>
          New Game / End game
        </button>
      </section>
    </>
  );
};

export default BoardComponent;
