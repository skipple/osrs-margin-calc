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

function calculate()
{
    buy_price = document.getElementById("bprice").value;
    sell_price = document.getElementById("sprice").value;
    volume = document.getElementById("volume").value;

    if(buy_price !== "" && sell_price !== ""){
        tax = calculateTax(sell_price);
        margin = calculateMargin(buy_price, sell_price);

        document.getElementById("tax_output").innerHTML = tax;
        document.getElementById("margin_output").innerHTML = margin;
        document.getElementById("total_output").innerHTML = margin * volume;
    }
}