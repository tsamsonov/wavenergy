import 'ol/ol.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer, Group } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import MVT from 'ol/format/MVT.js'
import {Fill, Stroke, Icon, Style, Text, Circle} from 'ol/style';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {get as getProjection} from 'ol/proj';
import {transform} from 'ol/proj.js';

var tools = require('./maps_legend_builder/maps_legend_builder.js');

const colorbrewer = require('colorbrewer');
var convert = require('color-convert');

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

// proj4.defs('EPSG:54003');
// register(proj4);
// const prj = getProjection('EPSG:54003', '+proj=mill +lon_0=90');

// proj4.defs('EPSG:21781',
//   '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
//   '+x_0=600000 +y_0=200000 +ellps=bessel ' +
//   '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs');
// register(proj4);
// const prj = getProjection('EPSG:21781');

var host = "localhost:8080/geoserver";
var host2 = "autolab.geogr.msu.ru:8080/geoserver";
var epsg = 900913

var seas = ['baltic', 'barentsz', 'black', 'kaspiy']
var vars = ['esr', 'hsr', 'psr', 'lsr', 'hs', 'h3p']

function vt_source(host, name, epsg = 900913){
  return new VectorTileSource({
    format: new MVT(),
    url: `http://${host}/gwc/service/tms/1.0.0/${name}@EPSG%3A${epsg}@pbf/{z}/{x}/{-y}.pbf`
  })
}

function vector_source(host, name, epsg = 4326){
  return new VectorSource({
    format: new GeoJSON(),
    url: `http://${host}/wfs?service=wfs&version=1.1.0&request=GetFeature&typename=${name}&outputFormat=application/json&srsname=EPSG:${epsg}`
  });
}

var get_color = function(palette, value, min, max, step, nan_color = '#FFFFFF') {
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

    // console.log([nbins_new, bin_new])
    var hsl1 = convert.hex.rgb(palette[nbins_new][bin_new]);

    // if (bin % k == 0) {
    //   return '#' + convert.rgb.hex(hsl1);
    // } else {

    var hsl2 = convert.hex.rgb(palette[nbins_new][bin_new+1]);

    var w = 1 - (bin % k) / k // weighting coefficient

    var hsl = [
      Math.floor(w * hsl1[0] + (1-w) * hsl2[0]),
      Math.floor(w * hsl1[1] + (1-w) * hsl2[1]),
      Math.floor(w * hsl1[2] + (1-w) * hsl2[2]),
    ];

    return '#' + convert.rgb.hex(hsl);
    // }

  }
}

var get_colors = function(palette, min, max, step) {
  var val = min + step/2;
  var arr = [];
  while (val < max){
    arr.push(get_color(palette, val, min, max, step))
    val += step;
  }
  // console.log(arr);
  return arr;
}

var get_values = function(from, to, by){
  var arr = [];
  var val = from;
  while (to - val >= - 0.5 * by) {
    arr.push(round(val,1));
    val += by;
  }

  return arr;
}

var hs_style = function(feature, resolution) {
 var z = feature.get('Z_Mean');
 return new Style({
    fill: new Fill({
      color: get_color(colorbrewer.RdPu, z, 0, 18, 1)
    })
  })
}

var h3p_style = function(feature, resolution) {
 var z = feature.get('Z_Mean');
 return new Style({
    fill: new Fill({
      color: get_color(colorbrewer.YlGn, z, 0, 24, 2)
    })
  })
}

var hsr_style = function(feature, resolution) {
 var z = feature.get('Z_Mean');
 return new Style({
    fill: new Fill({
      color: get_color(colorbrewer.YlGnBu, z, 0, 1.4, 0.1)
    })
  })
}

var cont_style = function(feature, resolution) {
 var idx = feature.get('index');

 return new Style({
   stroke: new Stroke({
     color: '#000000',
     width: (idx == 1) ? 1 : 0.5
   })
 });
}


var cont_label_style = function(feature, resolution) {
 var idx = feature.get('index');
 var z = round(feature.get('Z'),1);
 var len = feature.get('Shape_Length');

 var fontstyle = (idx == 1) ? 'bold 14px' : '13px'

 if (len > 5e-4 * resolution) {
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

var land_style = new Style({
   fill: new Fill({
     color: '#FFFFFF'
   }),
   stroke: new Stroke({
     color: '#FFFFFF',
     width: 0.5
   })
 });

 var world_style = new Style({
    fill: new Fill({
      color: '#AAAAAA'
    })
  });

var bnd_lyr = new VectorLayer({
   style: new Style({
     stroke: new Stroke({
       color: '#888888',
       width: 0.5
     })
   }),
   source: vector_source(host, 'ne:ne_10m_admin_0_boundary_lines_land')
})

var world_lyr = new VectorTileLayer({
   style: world_style,
   source: vt_source(host, 'general:world')
})

var land_lyr = new VectorTileLayer({
 style: land_style,
 source: vt_source(host, 'ne:ne_10m_land_scale_rank')
})

var coast_lyr = new VectorTileLayer({
 style: new Style({
   stroke: new Stroke({
     color: '#000000',
     width: 0.5
   })
 }),
 source: vt_source(host, 'ne:ne_10m_coastline')
})

var hs_lyr = new VectorTileLayer({
 style: hs_style,
 source: vt_source(host, 'wavenergy:hs_band')
})

var hs_cont_lyr = new VectorTileLayer({
 style: cont_style,
 source: vt_source(host, 'wavenergy:hs_cont')
})

var hs_cont_wfs_lyr = new VectorLayer({
 declutter: true,
 style: cont_label_style,
 source: vector_source(host, 'wavenergy:hs_cont')
})

var hs_lyr_group = new Group({
            combine: true,
            visible: true,
            title: 'Значительная высота волны',
            name: 'hs',
            layers: [hs_lyr, hs_cont_lyr, hs_cont_wfs_lyr]
})

var h3p_lyr = new VectorTileLayer({
 style: h3p_style,
 source: vt_source(host, 'wavenergy:h3p_band')
})

var h3p_cont_lyr = new VectorTileLayer({
 style: cont_style,
 source: vt_source(host, 'wavenergy:h3p_cont')
})

var h3p_cont_wfs_lyr = new VectorLayer({
 declutter: true,
 style: cont_label_style,
 source: vector_source(host, 'wavenergy:h3p_cont')
})

var h3p_lyr_group = new Group({
            combine: true,
            visible: true,
            title: 'Значительная высота волны',
            name: 'h3p',
            layers: [h3p_lyr, h3p_cont_lyr, h3p_cont_wfs_lyr]
})

var hsr_lyr = new VectorTileLayer({
 style: hsr_style,
 source: vt_source(host, 'wavenergy:hsr_band')
})

var hsr_cont_lyr = new VectorTileLayer({
 style: cont_style,
 source: vt_source(host, 'wavenergy:hsr_cont')
})

var hsr_cont_wfs_lyr = new VectorLayer({
 declutter: true,
 style: cont_label_style,
 source: vector_source(host, 'wavenergy:hsr_cont')
})

var hsr_lyr_group = new Group({
            combine: true,
            visible: true,
            name: 'hsr',
            layers: [hsr_lyr, hsr_cont_lyr, hsr_cont_wfs_lyr]
})

var city_lyr = new VectorLayer({
  source: vector_source(host, 'ne:ne_50m_populated_places'),
  style: function(feature, resolution) {
    if (feature.get('FEATURECLA') =='Admin-0 capital')
      return new Style({
        image: new Circle({
          radius: 2,
          fill: new Fill({
            color: 'rgba(255,255,255,0.5)',
          }),
          stroke: new Stroke({
            color: 'rgba(0,0,0,1)',
            width: 0.5
          })
        }),
        text: new Text({
          text: feature.get('name_ru'),
          font: '10px Open Sans,sans-serif',
          fill: new Fill({
            color: '#000'
          }),
          // stroke: new ol.style.Stroke({
          //   color: '#fff',
          //   width: 2
          // }),
          offsetY: -10
        })
      })
    else return new Style({})
  },
  declutter: true
});

var center = transform([90, 60], 'EPSG:4326', 'EPSG:3857');


// var key = 'pk.eyJ1IjoiaWFtc3RlIiwiYSI6ImNqYm1ibWJiZjF1azUyd3Rncnk0Mjd3bTkifQ.9TWQZoeHu-bIJNRFT6TW4A'
//
// var mbx = new VectorTileLayer({
//   declutter: true,
//   source: new VectorTileSource({
//     attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
//       '© <a href="https://www.openstreetmap.org/copyright">' +
//       'OpenStreetMap contributors</a>',
//     format: new MVT(),
//     url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
//         '{z}/{x}/{y}.vector.pbf?access_token=' + key
//   }),
//   style: createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text)
// })

const map = new Map({
  target: 'map',
  background: '#AAAAAA',
  layers: [
    // new TileLayer({
    //   source: new OSM()
    // }),
    // mbx,
    world_lyr,
    hs_lyr_group,
    land_lyr,
    bnd_lyr,
    coast_lyr,
    city_lyr
  ],
  view: new View({
    center: center,
    zoom: 4,
    // projection: 'EPSG:4326'
  })
});

var cur_var = hs_lyr_group;

var mySelect = document.getElementById('varList');

mySelect.value = 'hs'

mySelect.onchange = function() {
   var x = document.getElementById("varList").value;
   console.log(x)

   map.removeLayer(cur_var);

   switch(x) {
      case 'hs':
        cur_var = hs_lyr_group;
        document.getElementById('td00').innerHTML = "";
        tools.layeredColoring(0, 0,
                    get_colors(colorbrewer.RdPu, 0, 18, 1),
                    false, [30, 15], false,
                    get_values(0, 18, 1), "8pt Arial", "black", 30, 20,
                    false, "", "bold 10pt Arial");
        break;
      case 'h3p':
        cur_var = h3p_lyr_group;
        document.getElementById('td00').innerHTML = "";
        tools.layeredColoring(0, 0,
                    get_colors(colorbrewer.YlGn, 0, 24, 2),
                    false, [30, 15], false,
                    get_values(0, 24, 2), "8pt Arial", "black", 30, 20,
                    false, "", "bold 10pt Arial");
        break;
      case 'hsr':
        cur_var = hsr_lyr_group;
        document.getElementById('td00').innerHTML = "";
        tools.layeredColoring(0, 0,
                    get_colors(colorbrewer.YlGnBu, 0, 1.4, 0.1),
                    false, [30, 15], false,
                    get_values(0, 1.4, 0.1), "8pt Arial", "black", 30, 20,
                    false, "", "bold 10pt Arial");
        break;
      case 'lsr':
        break;
      case 'tsr':
        break;
      case 'psr':
        break;
      case 'esr':
        break;
      case 'osr':
        break;
    }

    map.getLayers().insertAt(1, cur_var);
}

// console.log(get_colors(colorbrewer.YlGnBu, 0, 1.3, 0.1))

tools.tablesInit(1, [1], "legend");
tools.layeredColoring(0, 0,
            get_colors(colorbrewer.RdPu, 0, 18, 1),
            false, [30, 15], false,
            get_values(0, 18, 1), "8pt Arial", "black", 30, 20,
            false, "", "bold 10pt Arial");
