// Độ phức tạp O(n)
const sum_to_n_a = (n: number) => {
    let sum: number = 0;
    for (let i: number = 1; i <= n; i++ ) {
        sum += i;
    }
    return sum
};

// Độ phức tạp O(n)
const sum_to_n_a = (n: number) : number =>  {
    if (n === 1) return 1;
    return n + sum_to_n_a(n - 1);
};

// Độ phức tạp O(1)
const sum_to_n_a = (n: number): number => {
    return n * ( n + 1) /2;
};

