import React from "react";

type TProps = {
  status: string;
};

export const Boat = ({ status }: TProps) => {
  const boatView = (status: string) => {
    switch (status) {
      case "drowned":
        return "drowned";

      default:
        return "";
    }
  };

  return <div className={`boat ${boatView(status)}`}></div>;
};
