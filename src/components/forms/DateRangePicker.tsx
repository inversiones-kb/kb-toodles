import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  CalendarDate,
  Calendar,
  RangeCalendar,
  RangeValue,
  DateValue,
  RangeCalendarProps,
} from "@heroui/react";
import { IconCalendarWeek, IconChevronDown } from "@tabler/icons-react";
import React from "react";
import {
  getLocalTimeZone,
  parseAbsolute,
  parseAbsoluteToLocal,
  parseDate,
  parseDateTime,
  parseZonedDateTime,
} from "@internationalized/date";
import { dateToString } from "@/utils/dateUtils";
import { DateRange } from "@/types/coreTypes";

interface DateRangePickerProps extends RangeCalendarProps {}

const DateRangePicker = ({ onChange, ...props }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex">
      <Popover showArrow isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button
            size="lg"
            className="text-sm text-light px-4"
            color="secondary"
            startContent={
              <IconCalendarWeek size={24} className="text-soft-light" />
            }
            endContent={<IconChevronDown size={20} />}
          >
            {dateToString(
              props.defaultValue?.start.toDate(getLocalTimeZone()),
              "DD/MM/YYYY"
            )}
            {" - "}
            {dateToString(
              props.defaultValue?.end.toDate(getLocalTimeZone()),
              "DD/MM/YYYY"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 rounded-3xl">
          <RangeCalendar
            classNames={{
              cellButton:
                "data-[selected]:before:!bg-light/10 data-[selected]:!text-soft-light data-[selection-start]:!text-light data-[selection-end]:!text-light",
              base: "rounded-3xl",
            }}
            onChange={(value) => {
              if (onChange) onChange(value);
              setIsOpen(false);
            }}
            {...props}
            defaultValue={props.defaultValue}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
