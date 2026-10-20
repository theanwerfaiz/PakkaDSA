/** Small helpers shared by several generators. */

export const swapArr = <T>(a: T[], i: number, j: number): void => {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
};

/** [0, 1, ..., n-1] */
export const range = (n: number): number[] => [...Array(n).keys()];
