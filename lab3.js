function f(x) {
    return x * Math.log(x);
}

function rectangleMethod(a, b, n) {
    const h = (b - a) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        const x = a + (i + 0.5) * h;
        sum += f(x);
    }
    return sum * h;
}

function trapezoidMethod(a, b, n) {
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    for (let i = 1; i < n; i++) {
        sum += 2 * f(a + i * h);
    }
    return sum * h / 2;
}

function simpsonMethod(a, b, n) {
    if (n % 2 !== 0) n++;
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    for (let i = 1; i < n; i++) {
        const x = a + i * h;
        if (i % 2 === 0) sum += 2 * f(x);
        else sum += 4 * f(x);
    }
    return sum * h / 3;
}

function findOptimalN(method, a, b, epsilon, k) {
    for (let m = 1; m <= 10; m++) {
        const n = Math.pow(2, m);
        const result = method(a, b, n);
        if (m === 1) continue;
        const prevResult = method(a, b, n/2);
        const R = (result - prevResult) / (Math.pow(2, k) - 1);
        if (Math.abs(R) <= epsilon) {
            return { n, result, R, correctedResult: result + R };
        }
    }
    const n = 1024;
    const result = method(a, b, n);
    const prevResult = method(a, b, n/2);
    const R = (result - prevResult) / (Math.pow(2, k) - 1);
    return { n, result, R, correctedResult: result + R };
}

function main() {
    const a = 1, b = Math.E, epsilon = 0.001;
    const kRect = 2, kTrap = 2, kSimpson = 4;
    const exactValue = 2.097264024732; // точное значение интеграла
    
    const rect = findOptimalN(rectangleMethod, a, b, epsilon, kRect);
    const trap = findOptimalN(trapezoidMethod, a, b, epsilon, kTrap);
    const simpson = findOptimalN(simpsonMethod, a, b, epsilon, kSimpson);
    
    console.log("┌──────────────────────────┬────────┬──────────────┬──────────────┬──────────────┬───────────────┐");
    console.log("│         Метод            │   n    │      I*      │      R       │    I*+R      │   D           │");
    console.log("├──────────────────────────┼────────┼──────────────┼──────────────┼──────────────┼───────────────┼");
    console.log("│ Средние прямоугольники   │ " + rect.n.toString().padEnd(6) + " │ " + rect.result.toFixed(10).padEnd(12) + " │ " + rect.R.toFixed(8).padEnd(12) + " │ " + rect.correctedResult.toFixed(10).padEnd(12) + " │"+ Math.abs(exactValue-rect.correctedResult).toFixed(8)+"     │ ");
    console.log("│ Трапеций                 │ " + trap.n.toString().padEnd(6) + " │ " + trap.result.toFixed(10).padEnd(12) + " │ " + trap.R.toFixed(8).padEnd(12) + " │ " + trap.correctedResult.toFixed(10).padEnd(12) + " │"+Math.abs(exactValue-trap.correctedResult).toFixed(8) +"     │ ");
    console.log("│ Симпсона                 │ " + simpson.n.toString().padEnd(6) + " │ " + simpson.result.toFixed(10).padEnd(12) + " │ " + simpson.R.toFixed(8).padEnd(12) + " │ " + simpson.correctedResult.toFixed(10).padEnd(12) + " │"+Math.abs(exactValue-simpson.correctedResult).toFixed(8)+"     │ ");
    console.log("└──────────────────────────┴────────┴──────────────┴──────────────┴──────────────┘───────────────┘");
}

main();