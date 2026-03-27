function solveTridiagonal(matrix, fVector) {
    const n = matrix.length;
    
    // Извлекаем диагонали и работаем с ними
    const a = new Array(n).fill(0);  
    const b = new Array(n).fill(0); 
    const c = new Array(n).fill(0);  
    const d = [...fVector];        
    
    for (let i = 0; i < n; i++) {
        b[i] = matrix[i][i];
        if (i > 0) a[i] = matrix[i][i-1];
        if (i < n-1) c[i] = matrix[i][i+1];
    }
    
    // Прогоночные коэффициенты
    const alpha = new Array(n).fill(0);
    const beta = new Array(n).fill(0);
    
    alpha[0] = -c[0] / b[0];
    beta[0] = d[0] / b[0];
    
    for (let i = 1; i < n; i++) {
        const denominator = a[i] * alpha[i-1] + b[i];
        if (i < n-1) {
            alpha[i] = -c[i] / denominator;
        }
        beta[i] = (d[i] - a[i] * beta[i-1]) / denominator;
    }
    const x = new Array(n).fill(0);
    x[n-1] = beta[n-1];
    
    for (let i = n-2; i >= 0; i--) {
        x[i] = alpha[i] * x[i+1] + beta[i];
    }
    
    return x;
}

// Функции p(x), q(x), f(x) для нашего уравнения y'' + p*y' + q*y = f(x)
function p_x(x) { return -1.0; }  
function q_x(x) { return 0.0; }   
function f_x(x) { return 3.0; }

// Аналитическое решение для уравнения
function analytical(x) {
    return 5 * Math.exp(x) - 3 * x - 5;
}

// Решение методом прогонки
// Используем конечно-разностную аппроксимацию второго порядка точности:
// y' ≈ (y_{i+1} - y_{i-1})/(2h) y'' ≈ (y_{i+1} - 2y_i + y_{i-1})/h^2
// Подставляя в уравнение y'' + p y' + q y = f, получаем:
// (y_{i+1} - 2y_i + y_{i-1})/h^2 + p*(y_{i+1} - y_{i-1})/(2h) + q*y_i = f_i
function solveProgonka(n, h) {
    const matrix = [];
    const d = new Array(n - 1).fill(0);
    
    // Заполняем матрицу для внутренних точек i = 1..n-1
    for (let i = 0; i < n - 1; i++) {
        const row = new Array(n - 1).fill(0);
        const x = (i + 1) * h;
        
        if (i > 0) {
            row[i - 1] = 1 - (h / 2) * p_x(x);
        }
        
        row[i] = h * h * q_x(x) - 2;
        
        if (i < n - 2) {
            row[i + 1] = 1 + (h / 2) * p_x(x);
        }
        
        d[i] = h * h * f_x(x);
        if (i === 0) {
            d[i] -= analytical(0) * (1 - (h / 2) * p_x(x));
        }
        if (i === n - 2) {
            d[i] -= analytical(1) * (1 + (h / 2) * p_x(x));
        }
        
        matrix.push(row);
    }
    
    const yInternal = solveTridiagonal(matrix, d);
    const y = new Array(n + 1).fill(0);
    y[0] = analytical(0);       
    y[n] = analytical(1);           
    for (let i = 1; i < n; i++) {
        y[i] = yInternal[i - 1];
    }
    return y;
}

// Идея метода: ищем решение в виде y = y0 + C1 * y1, где
// y0 - частное решение неоднородного уравнения с условиями y0(a) = A, y0'(a) = 0
// y1 - частное решение однородного уравнения с условиями y1(a) = 0, y1'(a) = 1
// Константа C1 определяется из условия на правом конце: y0(b) + C1*y1(b) = B
function shootingMethod(a, b, n) {
    const h = (b - a) / n;
    const x = [];         
    
    for (let i = 0; i <= n; i++) {
        x[i] = a + i * h;
    }
    
    const y0 = new Array(n + 1).fill(0);  // частное решение неоднородного уравнения
    const y1 = new Array(n + 1).fill(0);  // частное решение однородного уравнения
    
    // Для y0: y0(a) = A, y0(a+h) = A + O(h)  (берем с погрешностью порядка h)
    // Для y1: y1(a) = 0, y1(a+h) = O(h)
    y0[0] = analytical(a);
    y0[1] = analytical(a) + 0.001;  // D0 = A + O(h)
    
    y1[0] = 0;
    y1[1] = 0.001;      // D1 = O(h)
    
    // Прямой ход - вычисляем y0[i+1] и y1[i+1] для i = 1, 2, ..., n-1
    // Используем конечно-разностную аппроксимацию второго порядка:
    // y' ≈ (y_{i+1} - y_{i-1})/(2h)
    // y'' ≈ (y_{i+1} - 2y_i + y_{i-1})/h^2
    // 
    // Подставляя в уравнение y'' + p y' + q y = f, получаем рекуррентные формулы:
    // 
    // Для неоднородного уравнения (y0):
    // y0[i+1] = (f_i * h^2 + (2 - q_i * h^2) * y0[i] - (1 - p_i * h/2) * y0[i-1]) / (1 + p_i * h/2)
    // 
    // Для однородного уравнения (y1, f_i = 0):
    // y1[i+1] = ((2 - q_i * h^2) * y1[i] - (1 - p_i * h/2) * y1[i-1]) / (1 + p_i * h/2)
    for (let i = 1; i < n; i++) {
        const pi = p_x(x[i]);
        const qi = q_x(x[i]);
        const fi = f_x(x[i]);
        
        const denominator = 1 + pi * h / 2;  
        
        y0[i + 1] = (fi * h * h + 
                     (2 - qi * h * h) * y0[i] - 
                     (1 - pi * h / 2) * y0[i - 1]) / denominator;
        
        y1[i + 1] = ((2 - qi * h * h) * y1[i] - 
                     (1 - pi * h / 2) * y1[i - 1]) / denominator;
    }
    
    // Определяем константу C1 из условия на правом конце: y0(b) + C1 * y1(b) = B  =>  C1 = (B - y0[n]) / y1[n]
    const C1 = (analytical(b) - y0[n]) / y1[n];
    
    // Формируем итоговое решение: y = y0 + C1 * y1
    const y = new Array(n + 1).fill(0);
    for (let i = 0; i <= n; i++) {
        y[i] = y0[i] + C1 * y1[i];
    }
    
    return y;
}


function main() {
    const a = 0.0;
    const b = 1.0;
    const n = 10;        
    const h = (b - a) / n; 
    
    const yProgonka = solveProgonka(n, h);
    const yShooting = shootingMethod(a, b, n);
    
    console.log("┌───────┬────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┐");
    console.log("│  x    │  y                     │ y1                     │ y2                     │  |y-y1|                │  |y-y1|                │");
    console.log("├───────┼────────────────────────┼────────────────────────┼────────────────────────┼────────────────────────┼────────────────────────┤");
    
    for (let i = 0; i <= n; i++) {
        const x = i * h;
        const yAnalytical = analytical(x);
        const errorProgonka = Math.abs(yProgonka[i] - yAnalytical);
        const errorShooting = Math.abs(yShooting[i] - yAnalytical);
        
        console.log(`│ ${x.toFixed(3)} │ ${yAnalytical.toFixed(20)} │ ${yProgonka[i].toFixed(20)} │ ${yShooting[i].toFixed(20)} │ ${errorProgonka.toFixed(20)} │ ${errorShooting.toFixed(20)} │`);
    }
    
    console.log("└───────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘");
}

main();