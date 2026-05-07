// Problem 4: Three ways to sum to n
//
// Assumption:
// - n can be any integer.
// - For n > 0, sum from 1 to n.
// - For n < 0, sum from n to -1.
// - The problem states the result is less than Number.MAX_SAFE_INTEGER.

// Approach A: Loop
// Time complexity: O(|n|)
// Space complexity: O(1)
export function sum_to_n_a(n: number): number {
  let sum = 0;

  if (n >= 0) {
    for (let i = 1; i <= n; i += 1) {
      sum += i;
    }
  } else {
    for (let i = n; i <= -1; i += 1) {
      sum += i;
    }
  }

  return sum;
}

// Approach B: Arithmetic formula
// Time complexity: O(1)
// Space complexity: O(1)
// This is the most efficient implementation.
export function sum_to_n_b(n: number): number {
  const abs = Math.abs(n);
  const sum = (abs * (abs + 1)) / 2;

  return n < 0 ? -sum : sum;
}

// Approach C: Recursion
// Time complexity: O(|n|)
// Space complexity: O(|n|) because each recursive call uses stack space.
export function sum_to_n_c(n: number): number {
  if (n === 0) return 0;
  if (n < 0) return n + sum_to_n_c(n + 1);

  return n + sum_to_n_c(n - 1);
}
