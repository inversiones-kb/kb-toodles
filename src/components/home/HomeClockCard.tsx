"use client";

import React, { useEffect, useState } from "react";
import LightningIcon from "@public/home/lightning.svg";
import Image from "next/image";
import { MONTHS_DICT } from "@/utils/dateUtils";
import { Spinner } from "@heroui/react";
import clsx from "clsx";

const HomeClockCard = () => {
  const [loading, setLoading] = useState<boolean>(true);
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
      if (loading) {
        setLoading(false);
      }

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
    <section className="row-span-2 bg-layer-2 rounded-3xl flex items-center gap-1 relative overflow-hidden">
      <div
        className={clsx([
          "w-full h-full bg-layer-2 absolute z-10 left-0 top-0 rounded-3xl grid place-content-center transition-opacity",
          { "opacity-0 pointer-events-none": !loading },
        ])}
      >
        <Spinner />
      </div>

      <div className="flex flex-col text-right flex-1">
        <h6 className="text-brand-primary text-6xl font-bold">
          {date.date.toString().padStart(2, "00")}
        </h6>
        <h6 className="font-bold text-5xl">{date.month.substring(0, 3)}</h6>
      </div>
      <Image
        src={LightningIcon}
        className="inset-0 m-auto h-full pointer-events-none"
        alt="Ícono de un rayo"
      />
      <div className="flex flex-col text-left flex-1 gap-1">
        <h6 className="font-bold text-6xl">
          {(time.hours > 12 ? time.hours - 12 : time.hours)
            .toString()
            .padStart(2, "00")}
        </h6>
        <h6 className="text-brand-primary text-6xl font-bold">
          {time.minutes.toString().padStart(2, "00")}
        </h6>
      </div>
    </section>
  );
};

export default HomeClockCard;
