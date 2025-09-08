// Type declarations for packages that don't have built-in types

declare module "tailwind-merge" {
  export function twMerge(
    ...classLists: (string | undefined | null | false)[]
  ): string;
}

declare module "clsx" {
  export type ClassValue =
    | ClassArray
    | ClassDictionary
    | string
    | number
    | null
    | boolean
    | undefined;

  export interface ClassDictionary {
    [id: string]: any;
  }

  export interface ClassArray extends Array<ClassValue> {}

  export default function clsx(...inputs: ClassValue[]): string;
  export function clsx(...inputs: ClassValue[]): string;
}
