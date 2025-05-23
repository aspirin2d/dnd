export interface DataItem {
  index: string;
  name: string;
  description: string;
}

export interface ChooseFrom<T, N extends Number = 1> {
  from: T[];
  count?: N;
}
