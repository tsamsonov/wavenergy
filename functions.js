const convert = require('color-convert');

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function get_color(palette, value, min, max, step, nan_color = '#FFFFFF') {
  var nbins = Math.ceil((max - min)/step);
  var bin = Math.floor((value - min)/step);

  if (isNaN(bin)){
    return nan_color
  }

  if (nbins <= 9) {
    return palette[nbins][bin];
  } else {
    var k = Math.floor(nbins / 9) + 1

    var nbins_new = Math.ceil(nbins/k) + 1;
    var bin_new = Math.floor((value - min) * (nbins_new-1) / (max - min));

    bin_new = bin_new < 0 ? 0 : bin_new;

    var hsl1 = convert.hex.rgb(palette[nbins_new][bin_new]);
    var hsl2 = convert.hex.rgb(palette[nbins_new][bin_new+1]);

    var w = 1 - (bin % k) / k // weighting coefficient

    var hsl = [
      Math.floor(w * hsl1[0] + (1-w) * hsl2[0]),
      Math.floor(w * hsl1[1] + (1-w) * hsl2[1]),
      Math.floor(w * hsl1[2] + (1-w) * hsl2[2]),
    ];

    return '#' + convert.rgb.hex(hsl);

  }
}

function get_colors(palette, min, max, step) {
  var val = min + step/2;
  var arr = [];
  while (val < max){
    arr.push(get_color(palette, val, min, max, step))
    val += step;
  }
  return arr;
}

function get_values(from, to, by){
  var arr = [];
  var val = from;
  while (to - val >= - 0.5 * by) {
    arr.push(round(val,1));
    val += by;
  }
  return arr;
}

module.exports = {
  get_color, get_colors, get_values, round
}
