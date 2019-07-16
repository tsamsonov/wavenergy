import 'ol/ol.css';
import Vue from 'vue'
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer, Group } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import GeoJSON from 'ol/format/GeoJSON';
import TileJSON from 'ol/source/TileJSON.js'
import OSM from 'ol/source/OSM';
import MVT from 'ol/format/MVT.js'
import {Fill, Stroke, Icon, Style, Text, Circle} from 'ol/style';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import register from 'ol/proj/proj4';
import {get as getProjection} from 'ol/proj';
import {transform, Projection} from 'ol/proj.js';
import WMTS from 'ol/tilegrid/WMTS.js'
import Control from 'ol/control/Control';
import Plotly from 'plotly'

// var app = new Vue({
//   el: '#manager',
//   data: {
//     message: 'Выберите параметр:'
//   }
// })

var tools = require('./maps_legend_builder/maps_legend_builder.js');

const colorbrewer = require('colorbrewer');
const convert = require('color-convert');

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
// const prj = getProjection('EPSG:4326');

var host = "localhost:8080/geoserver";
var host2 = "autolab.geogr.msu.ru:8080/geoserver";
// var epsg = 900913

var seas = ['baltic', 'barentsz', 'black', 'kaspiy']
var vars = ['esr', 'hsr', 'psr', 'lsr', 'hs', 'h3p', 'osr', 'wind_grp_50', 'wind_grp_100']

var prj = new Projection({
  code: 'EPSG:4326',
  units: 'degrees',
  axisOrientation: 'neu'
});

var gridNames = ['EPSG:4326:0', 'EPSG:4326:1', 'EPSG:4326:2', 'EPSG:4326:3', 'EPSG:4326:4', 'EPSG:4326:5', 'EPSG:4326:6', 'EPSG:4326:7', 'EPSG:4326:8', 'EPSG:4326:9', 'EPSG:4326:10', 'EPSG:4326:11', 'EPSG:4326:12', 'EPSG:4326:13', 'EPSG:4326:14', 'EPSG:4326:15', 'EPSG:4326:16', 'EPSG:4326:17', 'EPSG:4326:18', 'EPSG:4326:19', 'EPSG:4326:20', 'EPSG:4326:21'];

var resolutions = [0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125E-4, 3.4332275390625E-4, 1.71661376953125E-4, 8.58306884765625E-5, 4.291534423828125E-5, 2.1457672119140625E-5, 1.0728836059570312E-5, 5.364418029785156E-6, 2.682209014892578E-6, 1.341104507446289E-6, 6.705522537231445E-7, 3.3527612686157227E-7];


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
   style: new Style({
      fill: new Fill({
        color: '#AAAAAA'
      })
    }),
   source: vt_source(host, 'general:world')
})

var land_lyr = new VectorTileLayer({
  style: new Style({
    fill: new Fill({
      color: '#FFFFFF'
    }),
    stroke: new Stroke({
      color: '#FFFFFF',
      width: 0.5
    })
  }),
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

var hs_lyr_group = new Group({
  combine: true,
  visible: true,
  title: 'Значительная высота волны',
  name: 'hs',
  layers: [
    new VectorTileLayer({
     style: function(feature, resolution) {
      var z = feature.get('Z_Mean');
      return new Style({
         fill: new Fill({
           color: get_color(colorbrewer.RdPu, z, 0, 18, 1)
         })
       })
     },
     source: vt_source(host, 'wavenergy:hs_band')
    }),
    new VectorTileLayer({
     style: cont_style,
     source: vt_source(host, 'wavenergy:hs_cont')
    }),
    new VectorLayer({
     declutter: true,
     style: cont_label_style,
     source: vector_source(host, 'wavenergy:hs_cont')
    })
  ]
})

var h3p_lyr_group = new Group({
  combine: true,
  visible: true,
  title: 'Значительная высота волны',
  name: 'h3p',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('Z_Mean');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.PuRd, z, 0, 24, 2)
          })
        })
      },
      source: vt_source(host, 'wavenergy:h3p_band')
    }),
    new VectorTileLayer({
      style: cont_style,
      source: vt_source(host, 'wavenergy:h3p_cont')
    }),
    new VectorLayer({
      declutter: true,
      style: cont_label_style,
      source: vector_source(host, 'wavenergy:h3p_cont')
    })
  ]
});

var hsr_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'hsr',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('Z_Mean');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.OrRd, z, 0, 2.8, 0.2)
          })
        })
      },
      source: vt_source(host, 'wavenergy:hsr_band')
    }),
    new VectorTileLayer({
      style: cont_style,
      source: vt_source(host, 'wavenergy:hsr_cont')
    }),
    new VectorLayer({
      declutter: true,
      style: cont_label_style,
      source: vector_source(host, 'wavenergy:hsr_cont')
    })
  ]
});

var lsr_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'lsr',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('Z_Mean');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.Blues, z, 0, 80, 5)
          })
        })
      },
      source: vt_source(host, 'wavenergy:lsr_band')
    }),
    new VectorTileLayer({
      style: cont_style,
      source: vt_source(host, 'wavenergy:lsr_cont')
    }),
    new VectorLayer({
      declutter: true,
      style: cont_label_style,
      source: vector_source(host, 'wavenergy:lsr_cont')
    })
  ]
});

var psr_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'psr',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('Z_Mean');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.Greens, z, 0, 5, 0.5)
          })
        })
      },
      source: vt_source(host, 'wavenergy:psr_band')
    }),
    new VectorTileLayer({
      style: cont_style,
      source: vt_source(host, 'wavenergy:psr_cont')
    }),
    new VectorLayer({
      declutter: true,
      style: cont_label_style,
      source: vector_source(host, 'wavenergy:psr_cont')
    })
  ]
});

var esr_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'psr',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('Z_Mean');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.YlGnBu, z, 0, 35, 2.5)
          })
        })
      },
      source: vt_source(host, 'wavenergy:esr_band')
    }),
    new VectorTileLayer({
      style: cont_style,
      source: vt_source(host, 'wavenergy:esr_cont')
    }),
    new VectorLayer({
      declutter: true,
      style: cont_label_style,
      source: vector_source(host, 'wavenergy:esr_cont')
    })
  ]
});

var osr_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'osr',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('Z_MEAN');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.YlGn, z, 0, 60, 5)
          })
        })
      },
      source: vt_source(host, 'wavenergy:osr_band')
    }),
    new VectorTileLayer({
      style: cont_style,
      source: vt_source(host, 'wavenergy:osr_cont')
    }),
    new VectorLayer({
      declutter: true,
      style: cont_label_style,
      source: vector_source(host, 'wavenergy:osr_cont')
    })
  ]
});

var wind_grp_50_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'psr',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('Z_Mean');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.PuBuGn, z, 0, 1200, 100)
          })
        })
      },
      source: vt_source(host, 'wavenergy:wind_grp50_band')
    }),
    new VectorTileLayer({
      style: cont_style,
      source: vt_source(host, 'wavenergy:wind_grp50_cont')
    }),
    new VectorLayer({
      declutter: true,
      style: cont_label_style,
      source: vector_source(host, 'wavenergy:wind_grp50_cont')
    })
  ]
});

var wind_grp_100_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'psr',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('Z_Mean');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.PuBuGn, z, 0, 1200, 100)
          })
        })
      },
      source: vt_source(host, 'wavenergy:wind_grp100_band')
    }),
    new VectorTileLayer({
      style: cont_style,
      source: vt_source(host, 'wavenergy:wind_grp100_cont')
    }),
    new VectorLayer({
      declutter: true,
      style: cont_label_style,
      source: vector_source(host, 'wavenergy:wind_grp100_cont')
    })
  ]
});

var wind_grp_50c_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'grp_50',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('grp_50');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.PuBuGn, z, 0, 1200, 100)
          }),
          stroke: new Stroke({
            color: '#000000',
            width: 0.1
          })
        })
      },
      source: vt_source(host, 'wavenergy:wind')
    })
  ]
});

var wind_grp_100c_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'grp_100',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('grp_100');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.PuBuGn, z, 0, 1200, 100)
          }),
          stroke: new Stroke({
            color: '#000000',
            width: 0.1
          })
        })
      },
      source: vt_source(host, 'wavenergy:wind')
    })
  ]
});

var wind_spd_50c_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'wind_spd_50c_lyr_group',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('spd_50_year');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.PuBuGn, z, 0, 9, 1)
          }),
          stroke: new Stroke({
            color: '#000000',
            width: 0.1
          })
        })
      },
      source: vt_source(host, 'wavenergy:wind')
    })
  ]
});

var wind_spd_100c_lyr_group = new Group({
  combine: true,
  visible: true,
  name: 'wind_spd_100c_lyr_group',
  layers: [
    new VectorTileLayer({
      style: function(feature, resolution) {
       var z = feature.get('spd_100_year');
       return new Style({
          fill: new Fill({
            color: get_color(colorbrewer.PuBuGn, z, 0, 9, 1)
          }),
          stroke: new Stroke({
            color: '#000000',
            width: 0.1
          })
        })
      },
      source: vt_source(host, 'wavenergy:wind')
    })
  ]
});

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
          offsetY: -10
        })
      })
    else return new Style({})
  },
  declutter: true
});

var center = transform([40, 60], 'EPSG:4326', 'EPSG:3857');

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
    // center: [40, 60],
    zoom: 4,
    // projection: prj
  })
});

var cur_var = hs_lyr_group;

var mySelect = document.getElementById('varList');

mySelect.value = 'hs'

function insert_legend(palette, from, to, by, id = 'td00') {
  document.getElementById(id).innerHTML = "";
  tools.layeredColoring(0, 0,
              get_colors(palette, from, to, by),
              false, [30, 15], false,
              get_values(from, to, by), "8pt Arial", "black", 30, 20,
              false, "", "bold 10pt Arial");
}

mySelect.onchange = function() {
   var x = document.getElementById("varList").value;
   console.log(x)

   map.removeLayer(cur_var);

   var level = 1;

   switch(x) {
      case 'hs':
        cur_var = hs_lyr_group;
        insert_legend(colorbrewer.RdPu, 0, 18, 1);
        break;
      case 'h3p':
        cur_var = h3p_lyr_group;
        insert_legend(colorbrewer.PuRd, 0, 24, 2);
        break;
      case 'hsr':
        cur_var = hsr_lyr_group;
        insert_legend(colorbrewer.OrRd, 0, 2.8, 0.2);
        break;
      case 'lsr':
        cur_var = lsr_lyr_group;
        insert_legend(colorbrewer.Blues, 0, 80, 5);
        break;
      case 'psr':
        cur_var = psr_lyr_group;
        insert_legend(colorbrewer.Greens, 0, 5, 0.5);
        break;
      case 'esr':
        cur_var = esr_lyr_group;
        insert_legend(colorbrewer.YlGnBu, 0, 35, 2.5);
        break;
      case 'osr':
        cur_var = osr_lyr_group;
        insert_legend(colorbrewer.YlGn, 0, 60, 5);
        break;
      case 'wind_grp_50':
        cur_var = wind_grp_50_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 1200, 100);
        level = 2;
        break;
      case 'wind_grp_100':
        cur_var = wind_grp_100_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 1200, 100);
        level = 2;
        break;
      case 'wind_grp_50c':
        cur_var = wind_grp_50c_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 1200, 100);
        level = 2;
        break;
      case 'wind_grp_100c':
        cur_var = wind_grp_100c_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 1200, 100);
        level = 2;
        break;
      case 'wind_spd_50c_year':
        cur_var = wind_spd_50c_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 8, 1);
        level = 2;
        break;
      case 'wind_spd_100c_year':
        cur_var = wind_spd_100c_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 8, 1);
        level = 2;
        break;

    }

    map.getLayers().insertAt(level, cur_var);
}


tools.tablesInit(1, [1], "legend");
insert_legend(colorbrewer.RdPu, 0, 18, 1);
