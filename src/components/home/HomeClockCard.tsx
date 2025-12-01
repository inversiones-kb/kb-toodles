"use client";

import React, { useEffect, useState } from "react";
import LightningIcon from "@public/home/lightning.svg";
import Image from "next/image";
import { MONTHS_DICT } from "@/utils/dateUtils";

const HomeClockCard = () => {
  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
  });
  const [date, setDate] = useState({
    date: 0,
    month: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      setTime({
        hours: date.getHours(),
        minutes: date.getMinutes(),
      });

      setDate({
        date: date.getDate(),
        month: MONTHS_DICT[date.getMonth()],
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex flex-col items-right text-right flex-1">
        <h6 className="text-brand-primary text-6xl font-bold">
          {date.date.toString().padStart(2, "00")}
        </h6>
        <h6 className="font-bold text-6xl">{date.month.substring(0, 3)}</h6>
      </div>
      <Image
        src={LightningIcon}
        className="absolute inset-0 m-auto h-full"
        alt="Ícono de un rayo"
      />
      <div className="flex flex-col items-left text-left flex-1">
        <h6 className="font-bold text-6xl">
          {(time.hours > 12 ? time.hours - 12 : time.hours)
            .toString()
            .padStart(2, "00")}
        </h6>
        <h6 className="text-brand-primary text-6xl font-bold">
          {time.minutes.toString().padStart(2, "00")}
        </h6>
      </div>
    </>
  );
};

export default HomeClockCard;
