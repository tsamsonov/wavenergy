import {Fill, Stroke, Icon, Style, Text, Circle} from 'ol/style';
var fun = require('./functions.js')

function band_style(feature, resolution, palette,
                    value, from, to, by, field = 'Z_Mean') {
  var z = feature.get(field);
  return new Style({
     fill: new Fill({
       color: get_color(palette, value, from, to, by)
     })
   })
}

function cont_style(feature, resolution) {
 var idx = feature.get('index');

 return new Style({
   stroke: new Stroke({
     color: '#000000',
     width: (idx == 1) ? 1 : 0.5
   })
 });
}

function cont_label_style(feature, resolution) {
 var idx = feature.get('index');
 var z = fun.round(feature.get('Z'),1);
 var len = feature.get('Shape_Length');

 var fontstyle = (idx == 1) ? 'bold 14px' : '13px'

 if (len > 5e-1 * resolution) {
   return new Style({
     text: new Text({
       text : z.toString(),
       font: `${fontstyle} "Open Sans", "Arial", "sans-serif"`,
       placement: 'line',
       fill: new Fill({
         color: 'black'
       }),
       stroke: new Stroke({
         color: 'white',
         width: 1
       })
     })
   });
 }
}

module.exports = {
  band_style, cont_style, cont_label_style
}
