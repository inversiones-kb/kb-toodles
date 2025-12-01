import { DateValue } from "@internationalized/date";

export interface CustomApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface DateRange {
  start: DateValue;
  end: DateValue;
}
