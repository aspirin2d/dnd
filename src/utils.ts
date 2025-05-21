export interface DataItem {
  index: string;
  name: string;
  description: string;
}

export interface ChooseFrom<T> {
  from: T[];
  count: number;
}
