function solveTridiagonal(matrix, fVector) {
    //прогонка с предыдущей работы, используем как модуль по факту
    const n = matrix.length;
    
    // Извлекаем диагонали и работаем с ними
    const a = new Array(n).fill(0);  // нижняя диагональ (индексы 1..n-1)
    const b = new Array(n).fill(0);  // главная диагональ
    const c = new Array(n).fill(0);  // верхняя диагональ (индексы 0..n-2)
    const d = [...fVector];          // правые части
    
    for (let i = 0; i < n; i++) {
        b[i] = matrix[i][i];
        if (i > 0) a[i] = matrix[i][i-1];
        if (i < n-1) c[i] = matrix[i][i+1];
    }
    
    // Прогоночные коэффициенты
    const alpha = new Array(n).fill(0);
    const beta = new Array(n).fill(0);
    
    // Прямой ход
    alpha[0] = -c[0] / b[0];
    beta[0] = d[0] / b[0];
    
    for (let i = 1; i < n; i++) {
        const denominator = a[i] * alpha[i-1] + b[i];
        if (i < n-1) {
            alpha[i] = -c[i] / denominator;
        }
        beta[i] = (d[i] - a[i] * beta[i-1]) / denominator;
    }
    
    // Обратный ход
    const x = new Array(n).fill(0);
    x[n-1] = beta[n-1];
    
    for (let i = n-2; i >= 0; i--) {
        x[i] = alpha[i] * x[i+1] + beta[i];
    }
    
    return x;
}

class CubSpline {
    constructor(x, y, h) {
        const n = x.length;
        if (n !== y.length || n < 2) {
            throw new Error("Invalid input data");
        }

        // Построение трехдиагональной матрицы для коэффициентов c
        const matrix = [];
        const dVector = [];
        
        for (let i = 0; i < n; i++) {
            const row = new Array(n).fill(0);
            
            if (i === 0) {
                row[0] = 1.0;
                dVector.push(0);
            } else if (i === n-1) {
                row[n-1] = 1.0;
                dVector.push(0);
            } else {
                row[i-1] = h;
                row[i] = 4 * h;
                row[i+1] = h;
                dVector.push(3 * ((y[i+1] - y[i]) / h - (y[i] - y[i-1]) / h));
            }
            matrix.push(row);
        }

        // Решение системы для коэффициентов c методом прогонки с прошлой работы
        const cCoeffs = solveTridiagonal(matrix, dVector);

        // Инициализация сплайна
        this.x = x.slice();
        this.y = y.slice();
        this.a = new Array(n-1).fill(0);
        this.b = new Array(n-1).fill(0);
        this.c = cCoeffs.slice(0, n-1);
        this.d = new Array(n-1).fill(0);

        // Вычисление остальных коэффициентов
        for (let i = 0; i < n-1; i++) {
            this.a[i] = y[i];
            if (i < n-2) {
                this.b[i] = (y[i+1] - y[i]) / h - h * (2 * cCoeffs[i] + cCoeffs[i+1]) / 3;
                this.d[i] = (cCoeffs[i+1] - cCoeffs[i]) / (3 * h);
            } else {
                this.b[i] = (y[i+1] - y[i]) / h - 2 * h * cCoeffs[i] / 3;
                this.d[i] = -cCoeffs[i] / (3 * h);
            }
        }
    }

    interpolate(xVal) {
        let i = 0;
        while (i < this.x.length - 1 && xVal > this.x[i + 1]) {
            i++;
        }

        const dx = xVal - this.x[i];
        return this.a[i] + this.b[i] * dx + this.c[i] * dx * dx + this.d[i] * dx * dx * dx;
    }
}

function main() {
    const f = (x) => Math.exp(x);
    const a = 0.0, b = 1.0, n = 10;
    const h = (b - a) / n;
    
    const x = new Array(n + 1);
    const y = new Array(n + 1);
    for (let i = 0; i <= n; i++) {
        x[i] = a + i * h;
        y[i] = f(x[i]);
    }
    
    const spline = new CubSpline(x, y, h);
    
    console.log("\nПОГРЕШНОСТИ В УЗЛАХ |S_i(x_i) - y_i|:");
    console.log("i\tx_i\t\t|S_i(x_i)-y_i|");
    console.log("-".repeat(40));
    for (let i = 0; i <= n; i++) {
        const error = Math.abs(spline.interpolate(x[i]) - y[i]);
        console.log(`${i}\t${x[i].toFixed(4)}\t\t${error.toExponential(6)}`);
    }
    
    console.log("\nПОГРЕШНОСТИ В СЕРЕДИНАХ |S_i(x_{i-0.5}) - f(x_{i-0.5})|:");
    console.log("i\tx_{i-0.5}\t|S_i(x)-f(x)|");
    console.log("-".repeat(40));
    for (let i = 0; i < n; i++) {
        const xMid = a + (i + 0.5) * h;
        const error = Math.abs(spline.interpolate(xMid) - f(xMid));
        console.log(`${i}\t${xMid.toFixed(4)}\t\t${error.toExponential(6)}`);
    }
}

main();
