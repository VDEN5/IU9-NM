// 1. cos(x+0.5) + y = 0.8
// 2. sin(y) - 2x = 1.6

/**
 * Система уравнений (вектор-функция)
 * @param {Array} vars - вектор [x, y]
 * @returns {Array} - вектор значений функций [F1(x,y), F2(x,y)]
 */
function equations(vars) {
    const [x, y] = vars;
    // Приводим уравнения к виду F(x,y) = 0
    const eq1 = Math.cos(x + 0.5) + y - 0.8;  // cos(x+0.5) + y - 0.8 = 0
    const eq2 = Math.sin(y) - 2 * x - 1.6;    // sin(y) - 2x - 1.6 = 0
    return [eq1, eq2];
}

/**
 * Матрица Якоби
 * Для системы:
 * F1(x,y) = cos(x+0.5) + y - 0.8
 * F2(x,y) = sin(y) - 2x - 1.6
 * Матрица Якоби J(x,y) = [∂F1/∂x, ∂F1/∂y; ∂F2/∂x, ∂F2/∂y] = 
 *                       [ -sin(x+0.5), 1; -2, cos(y) ]
 * @param {Array} vars - вектор [x, y]
 * @returns {Array} - матрица Якоби 2x2
 */
function jacobianMatrix(vars) {
    const [x, y] = vars;
    return [
        [-Math.sin(x + 0.5), 1],
        [-2, Math.cos(y)]
    ];
}

/**
 * Решение системы линейных уравнений 2x2, например методом Крамера (самое простое)
 * @param {Array} A - матрица 2x2
 * @param {Array} b - вектор правой части
 * @returns {Array} - решение системы
 */
function solveLinearSystem2x2(A, b) {
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    
    if (Math.abs(det) < 1e-15) {
        throw new Error("Матрица Якоби вырождена");
    }
    
    const det1 = b[0] * A[1][1] - A[0][1] * b[1];
    const det2 = A[0][0] * b[1] - b[0] * A[1][0];
    
    return [det1 / det, det2 / det];
}

/**
 * Метод Ньютона для решения системы нелинейных уравнений
 * @param {Function} f - система уравнений (вектор-функция)
 * @param {Array} x0 - начальное приближение
 * @param {number} eps - точность
 * @param {number} maxIter - максимальное число итераций
 * @returns {Object} - решение и информация о процессе
 */
function newtonSystem(f, x0, eps = 1e-6, maxIter = 100) {
    let x = [...x0];
    let iterations = 0;
    const trajectory = [{
        iteration: 0,
        x: x[0],
        y: x[1],
        f1: f(x)[0],
        f2: f(x)[1]
    }];
    
    for (let iter = 0; iter < maxIter; iter++) {
        iterations = iter + 1;
        
        const J = jacobianMatrix(x);
        const fVal = f(x);
        
        const dx = solveLinearSystem2x2(J, [-fVal[0], -fVal[1]]);
        
        x = [x[0] + dx[0], x[1] + dx[1]];
        
        trajectory.push({
            iteration: iterations,
            x: x[0],
            y: x[1],
            f1: f(x)[0],
            f2: f(x)[1],
            dx: dx[0],
            dy: dx[1]
        });
        
        // Проверка сходимости
        const error = Math.max(Math.abs(dx[0]), Math.abs(dx[1]));
        if (error < eps) {
            break;
        }
    }
    
    return {
        solution: { x: x[0], y: x[1] },
        iterations,
        trajectory
    };
}

console.log("Система уравнений:");
console.log("  cos(x+0.5) + y = 0.8");
console.log("  sin(y) - 2x = 1.6\n");

// Начальное приближение, полученное графически
const initialGuess = [-0.8, -0.2];

// Решаем систему методом Ньютона
const systemResult = newtonSystem(equations, initialGuess, 1e-8, 20);

console.log(`\nРешение методом Ньютона:`);
console.log(`  x = ${systemResult.solution.x.toFixed(10)}`);
console.log(`  y = ${systemResult.solution.y.toFixed(10)}`);
console.log(`  Количество итераций: ${systemResult.iterations}`);

// Аналитическое решение для сравнения
const analyticalSolution = { x: -0.86658, y: -0.13356 };

// Вычисление абсолютной погрешности
const errorX = Math.abs(systemResult.solution.x - analyticalSolution.x);
const errorY = Math.abs(systemResult.solution.y - analyticalSolution.y);

console.log(`\nСравнение с аналитическим решением:`);
console.log(`  Аналитическое решение: x = ${analyticalSolution.x}, y = ${analyticalSolution.y}`);
console.log(`  Абсолютная погрешность по x: ${errorX.toFixed(10)}`);
console.log(`  Абсолютная погрешность по y: ${errorY.toFixed(10)}`);