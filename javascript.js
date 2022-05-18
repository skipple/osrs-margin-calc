function calculateTax(sell_price)
{
    if(sell_price >99) tax = Math.round(sell_price * 0.01);
    else tax = 0; 
    console.log(tax);
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

function pickHex(color1, color2, weight) {
  var w1 = weight;
  var w2 = 1 - w1;
  var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
      Math.round(color1[1] * w1 + color2[1] * w2),
      Math.round(color1[2] * w1 + color2[2] * w2)];
  rgb = "rgb(" + rgb + ")"
  return rgb;
}

function setcolorROI(roi){

    if(roi > 3) document.getElementById("roi_output").style.color = "rgb(0,250,0)";
    else if(roi > 0) {;
      green = [0,255,0]
      red = [255,0,0];
      weight = roi * 33.3 / 100;
      color = pickHex(green,red,weight);
      document.getElementById("roi_output").style.color = color;
    }
    else document.getElementById("roi_output").style.color = "rgb(250,0,0)";

}

function calculateROI(margin, buy_price){
    roi = (margin / buy_price * 100)
    setcolorROI(roi)
    roi = roi.toFixed(2) + "%";
    return roi;
}

function setCoinImage(total){
  if(total > 1000000) document.getElementById('coins').src="img/coins/coins_8.png";
  else if(total > 500000) document.getElementById('coins').src="img/coins/coins_7.png";
  else if(total > 250000) document.getElementById('coins').src="img/coins/coins_6.png";
  else if(total > 100000) document.getElementById('coins').src="img/coins/coins_5.png";
  else if(total > 50000) document.getElementById('coins').src="img/coins/coins_5.png";
  else if(total > 20000) document.getElementById('coins').src="img/coins/coins_4.png";
  else if(total > 10000) document.getElementById('coins').src="img/coins/coins_3.png";
  else if(total > 1000) document.getElementById('coins').src="img/coins/coins_2.png";
  else if(total >= 1) document.getElementById('coins').src="img/coins/coins_1.png";
  else document.getElementById('coins').src="";
  return;
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
        tax = 0 - calculateTax(sell_price);
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

        setCoinImage(total);
    }
}