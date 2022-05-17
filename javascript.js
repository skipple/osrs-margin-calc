function calculateTax(sell_price)
{
    tax = Math.round(sell_price * 0.01);
    return tax;
}

function calculateMargin(buy_price, sell_price)
{
    margin = Math.round(sell_price - buy_price - (sell_price * 0.01));
    return margin;
}

function parceLetter(num){
    multiplier = num.substr(-1).toLowerCase();
    if (multiplier == "k")
      return parseFloat(num) * 1000;
    else if (multiplier == "m")
      return parseFloat(num) * 1000000;
    else if (multiplier == "b")
      return parseFloat(num) * 1000000000;
    else 
      return parseFloat(num);
}

function calculateROI(margin, buy_price){
    roi = (margin / buy_price * 100).toFixed(2)
    roi = roi + "%";
    return roi;

}

function calculate()
{
    buy_price = parceLetter(document.getElementById("bprice").value);
    sell_price = parceLetter(document.getElementById("sprice").value);
    volume = parceLetter(document.getElementById("volume").value);

    if(isNaN(buy_price) || isNaN(sell_price))
    {
      document.getElementById("tax_output").innerHTML = 0;
      document.getElementById("margin_output").innerHTML = 0;
      document.getElementById("total_output").innerHTML = 0;
      document.getElementById("roi_output").innerHTML = "0.00%";
    }
    else {
        tax = calculateTax(sell_price);
        margin = calculateMargin(buy_price, sell_price);
        total = margin * volume;
        roi = calculateROI(margin, buy_price);

        tax_str = tax.toLocaleString("en-US");
        margin_str = margin.toLocaleString("en-US");
        total_str = total.toLocaleString("en-US");         

        document.getElementById("tax_output").innerHTML = tax_str;
        document.getElementById("margin_output").innerHTML = margin_str;
        document.getElementById("total_output").innerHTML = total_str;
        document.getElementById("roi_output").innerHTML = roi;
    }
}