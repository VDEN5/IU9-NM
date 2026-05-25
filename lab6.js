// Лабораторная работа: Метод наискорейшего спуска
// Вариант 6: f(x1,x2) = 2*x1^2 + 2*x1*x2 + 2*x1 + x2^2 + 0.5*sin(x1^2 + x2^2)
// Начальная точка: (-1, 1)
// Точность: ε = 0.001

const eps = 0.001;

function f(x1, x2) {
    return 2 * x1 ** 2 + 2 * x1 * x2 + 2 * x1 + x2 ** 2 + 0.5 * Math.sin(x1 ** 2 + x2 ** 2);
}

// Частные производные первого порядка
function f1(x1, x2) { 
    return 4 * x1 + 2 * x2 + 2 + x1 * Math.cos(x1 ** 2 + x2 ** 2);
}

function f2(x1, x2) { 
    return 2 * x1 + 2 * x2 + x2 * Math.cos(x1 ** 2 + x2 ** 2);
}

function f11(x1, x2) {
    return 4 + Math.cos(x1 ** 2 + x2 ** 2) - 2 * x1 ** 2 * Math.sin(x1 ** 2 + x2 ** 2);
}

function f12(x1, x2) {
    return 2 - 2 * x1 * x2 * Math.sin(x1 ** 2 + x2 ** 2);
}

function f22(x1, x2) {
    return 2 + Math.cos(x1 ** 2 + x2 ** 2) - 2 * x2 ** 2 * Math.sin(x1 ** 2 + x2 ** 2);
}

// Метод наискорейшего спуска
function steepestDescent(x1, x2, precision) {
    let x1k = x1;
    let x2k = x2;
    let k = 0;

    while (Math.max(Math.abs(f1(x1k, x2k)), Math.abs(f2(x1k, x2k))) >= precision) {
        const grad1 = f1(x1k, x2k);
        const grad2 = f2(x1k, x2k);
        const gradNorm = Math.max(Math.abs(grad1), Math.abs(grad2));

        console.log(`${k}\t${x1k.toFixed(8)}\t${x2k.toFixed(8)}\t${f(x1k, x2k).toFixed(8)}\t${gradNorm.toFixed(8)}`);

        const phi1 = -(grad1 ** 2 + grad2 ** 2);
        const phi2 = f11(x1k, x2k) * grad1 ** 2 +
                     2 * f12(x1k, x2k) * grad1 * grad2 +
                     f22(x1k, x2k) * grad2 ** 2;

        const tStar = -phi1 / phi2;

        x1k = x1k - tStar * grad1;
        x2k = x2k - tStar * grad2;
        k++;
    }

    // Финальная точка
    console.log(`${k}\t${x1k.toFixed(8)}\t${x2k.toFixed(8)}\t${f(x1k, x2k).toFixed(8)}\t${Math.max(Math.abs(f1(x1k, x2k)), Math.abs(f2(x1k, x2k))).toFixed(8)}`);

    return { x1: x1k, x2: x2k, iterations: k };
}

const result = steepestDescent(-1, 1, eps);

console.log(`Найденный минимум: x1 = ${result.x1.toFixed(8)}, x2 = ${result.x2.toFixed(8)}`);
console.log(`Значение функции: f = ${f(result.x1, result.x2).toFixed(8)}`);
console.log(`Количество итераций: ${result.iterations}`);

const analyticalValue = -0.48571268; 
const absoluteError = Math.abs(f(result.x1, result.x2) - analyticalValue);
console.log(`Абсолютная погрешность = ${absoluteError.toFixed(10)}`);