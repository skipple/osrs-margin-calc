function calculateTax(sell_price) {
    if (sell_price > 99) {
        return Math.round(sell_price * 0.02);
    }
    return 0;
}

function calculateMargin(buy_price, sell_price) {
    const tax = calculateTax(sell_price);
    return Math.round(sell_price - buy_price - tax);
}

// Correct breakeven that matches real tax + rounding rules
function calculateBreakEven(buy_price) {
    if (isNaN(buy_price) || buy_price <= 0) return 0;

    let sell_price = Math.max(1, Math.round(buy_price));

    while (true) {
        if (calculateMargin(buy_price, sell_price) >= 0) {
            return sell_price;
        }
        sell_price++;
    }
}

function parceLetter(num) {
    if (!num) return NaN;

    const multiplier = num.substr(-1).toLowerCase();
    if (multiplier === "k") return parseFloat(num) * 1000;
    if (multiplier === "m") return parseFloat(num) * 1000000;
    if (multiplier === "b") return parseFloat(num) * 1000000000;

    return parseFloat(num);
}

function pickHex(color1, color2, weight) {
    const w1 = weight;
    const w2 = 1 - w1;
    const rgb = [
        Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)
    ];
    return "rgb(" + rgb + ")";
}

function setcolorROI(roi) {
    const el = document.getElementById("roi_output");

    if (roi > 3) {
        el.style.color = "rgb(0,250,0)";
    } else if (roi > 0) {
        const green = [0,255,0];
        const red = [255,0,0];
        const weight = roi * 33.3 / 100;
        el.style.color = pickHex(green, red, weight);
    } else {
        el.style.color = "rgb(250,0,0)";
    }
}

function calculateROI(margin, buy_price) {
    if (buy_price <= 0) return "0.00%";

    const roi = (margin / buy_price) * 100;
    setcolorROI(roi);
    return roi.toFixed(2) + "%";
}

function setCoinImage(total) {
    const img = document.getElementById('coins');

    if (total > 1000000) img.src = "img/coins/coins_8.png";
    else if (total > 500000) img.src = "img/coins/coins_7.png";
    else if (total > 250000) img.src = "img/coins/coins_6.png";
    else if (total > 100000) img.src = "img/coins/coins_5.png";
    else if (total > 50000) img.src = "img/coins/coins_5.png";
    else if (total > 20000) img.src = "img/coins/coins_4.png";
    else if (total > 10000) img.src = "img/coins/coins_3.png";
    else if (total > 1000) img.src = "img/coins/coins_2.png";
    else if (total >= 1) img.src = "img/coins/coins_1.png";
    else img.src = "";
}

function calculate() {
    const buy_price = parceLetter(document.getElementById("bprice").value);
    const sell_price = parceLetter(document.getElementById("sprice").value);
    const volume = parceLetter(document.getElementById("volume").value);

    // Breakeven ONLY needs buy price
    const breakEven = calculateBreakEven(buy_price);
    document.getElementById("break_output").innerHTML =
        breakEven ? breakEven.toLocaleString("en-US") : 0;

    // If sell price is missing, stop here
    if (isNaN(sell_price)) {
        document.getElementById("tax_output").innerHTML = 0;
        document.getElementById("margin_output").innerHTML = 0;
        document.getElementById("total_output").innerHTML = 0;
        document.getElementById("roi_output").innerHTML = "0.00%";
        return;
    }

    const tax = -calculateTax(sell_price);
    const margin = calculateMargin(buy_price, sell_price);
    const total = margin * (volume || 0);
    const roi = calculateROI(margin, buy_price);

    document.getElementById("tax_output").innerHTML = tax.toLocaleString("en-US");
    document.getElementById("margin_output").innerHTML = margin.toLocaleString("en-US");
    document.getElementById("total_output").innerHTML = total.toLocaleString("en-US");
    document.getElementById("roi_output").innerHTML = roi;

    setCoinImage(total);
}
