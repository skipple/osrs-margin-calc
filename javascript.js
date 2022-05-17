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

function calculate()
{
    buy_price = parceLetter(document.getElementById("bprice").value);
    sell_price = parceLetter(document.getElementById("sprice").value);
    volume = parceLetter(document.getElementById("volume").value);

    if(buy_price !== "" && sell_price !== ""){
        tax = calculateTax(sell_price);
        margin = calculateMargin(buy_price, sell_price);
        total = margin * volume;
        roi = Math.round((margin / buy_price * 100) / 100) + "%";

        tax_str = tax.toLocaleString("en-US");
        margin_str = margin.toLocaleString("en-US");
        total_str = total.toLocaleString("en-US");         

        document.getElementById("tax_output").innerHTML = tax_str;
        document.getElementById("margin_output").innerHTML = margin_str;
        document.getElementById("total_output").innerHTML = total_str;
        document.getElementById("roi_output").innerHTML = roi;
    }
}