const x = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
const y = [2.30, 2.45, 2.65, 1.62, 2.01, 1.64, 1.35, 1.45, 0.75];
const n = x.length;

const z_a = 1.9;
const z_g = 2.2;
const z_h = 2.3;

const x0 = x[0], xn = x[n - 1];
const xa = (x0 + xn) / 2;
const xg = Math.sqrt(x0 * xn);
const xh = 2 / (1 / x0 + 1 / xn);

function interpolateY(xVal) {
    if (xVal <= x[0]) return y[0];
    if (xVal >= x[n - 1]) return y[n - 1];
    let i = 0;
    while (xVal > x[i + 1]) i++;
    const t = (xVal - x[i]) / (x[i + 1] - x[i]);
    return y[i] + t * (y[i + 1] - y[i]);
}

const ya = interpolateY(xa);
const yg = interpolateY(xg);
const yh = interpolateY(xh);

// Дельты по методичке: |z(x_*) - y_*|
const deltas = [
    Math.abs(z_a - ya),
    Math.abs(z_g - yg),
    Math.abs(z_a - yg),
    Math.abs(z_g - ya),
    Math.abs(z_h - ya),
    Math.abs(z_a - yh),
    Math.abs(z_h - yh),
    Math.abs(z_h - yg),
    Math.abs(z_g - yh)
];

for (let i = 0; i < deltas.length; i++) {
    console.log(`δ${i+1} = ${deltas[i].toFixed(6)}`);
}

let minDelta = deltas[0];
let minIndex = 1;
for (let i = 1; i < deltas.length; i++) {
    if (deltas[i] < minDelta) {
        minDelta = deltas[i];
        minIndex = i + 1;
    }
}
console.log(`\nМинимальная дельта: δ${minIndex} = ${minDelta.toFixed(6)}`);
console.log(`Выбрана функция z${minIndex}`);

// Для minIndex = 2 выбираем z2: y = a * x^b
// Линеаризация: ln y = ln a + b * ln x
//A=ln(a), B=b
const X = x.map(xi => Math.log(xi));
const Y = y.map(yi => Math.log(yi));
let lnaq
let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
for (let i = 0; i < n; i++) {
    sumX += X[i];
    sumY += Y[i];
    sumXY += X[i] * Y[i];
    sumX2 += X[i] * X[i];
}
//получены из условия минимальности ско, далее решаем систему по частным производным, получая а и б
const b_final = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
const ln_a = (sumY - b_final * sumX) / n;
lnaq=ln_a

const a_final = Math.exp(ln_a);

console.log(`Линеаризованная модель: ln y = ${b_final.toFixed(6)} * ln x + ${ln_a.toFixed(6)}`);
console.log(`Исходные параметры: a = ${a_final.toFixed(6)}, b = ${b_final.toFixed(6)}`);
console.log(`linear параметры: a* = ${ln_a.toFixed(6)}, b* = ${b_final.toFixed(6)}`);
console.log(`Функция: y = ${a_final.toFixed(6)} * x^${b_final.toFixed(6)}`);

let sumSq = 0;
for (let i = 0; i < n; i++) {
    const z = a_final * Math.pow(x[i], b_final);
    const diff = y[i] - z;
    sumSq += diff * diff;
}
console.log(`\nСумма квадратов отклонений: ${sumSq.toFixed(6)}`);
console.log(`СКО: ${Math.sqrt(sumSq / n).toFixed(6)}`);