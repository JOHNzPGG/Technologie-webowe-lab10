export interface IData {
   temperature: number;
   pressure: number;
   humidity: number;
   deviceId: number;
   readingDate?: Date;
}

export type Query<T> = {
   [key: string]: T;
};