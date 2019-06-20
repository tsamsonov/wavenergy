import 'ol/ol.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import MVT from 'ol/format/MVT.js'
import {Fill, Stroke, Style, Text} from 'ol/style';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {get as getProjection} from 'ol/proj';

const colorbrewer = require('colorbrewer');
var convert = require('color-convert');

proj4.defs('EPSG:54003');
register(proj4);
const prj = getProjection('EPSG:54003', '+proj=mill +lon_0=90');

// proj4.defs('EPSG:21781',
//   '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
//   '+x_0=600000 +y_0=200000 +ellps=bessel ' +
//   '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs');
// register(proj4);
// const prj = getProjection('EPSG:21781');

var host = "localhost:8080/geoserver";
var epsg = 900913

var seas = ['baltic', 'barentsz', 'black', 'kaspiy']
var vars = ['esr', 'hsr', 'psr', 'lsr', 'hs', 'h3p']

function vt_source(host, name, epsg = 900913){
  return new VectorTileSource({
    format: new MVT(),
    url: `http://${host}/gwc/service/tms/1.0.0/${name}@EPSG%3A${epsg}@pbf/{z}/{x}/{-y}.pbf`
  })
}

// var addr = `http://{0}/wfs?service=wfs&version=1.1.0&request=GetFeature&typename={1}&outputFormat=application/json&srsname=EPSG:{2}`

function vector_source(host, name, epsg = 4326){
  return new VectorSource({
    format: new GeoJSON(),
    url: `http://${host}/wfs?service=wfs&version=1.1.0&request=GetFeature&typename=${name}&outputFormat=application/json&srsname=EPSG:${epsg}`
  });
}

// var barentsz_hs_cont = vector_source(addr, host,
//   'wavenergy:barentsz_hs_cont', 4326);
// var barentsz_hs_band = vector_source(addr, host,
//   'wavenergy:barentsz_hs_band', 4326);
//
// var barentsz_hs_cont_lyr = new VectorLayer({
//  source: barentsz_hs_cont,
// });
//
// var barentsz_hs_band_lyr = new VectorLayer({
//  source: barentsz_hs_band,
// });

// var hs_style = new Style({
//    fill: new Fill({
//      color: '#AAAAAA'
//    })
//  });

var get_color = function(palette, value, min, max, step, nan_color = '#FFFFFF') {
  var nbins = Math.round((max - min)/step);
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

    var hsl1 = convert.hex.rgb(palette[nbins_new][bin_new]);

    if (bin % k == 0) {
      return hsl1
    } else {

      var hsl2 = convert.hex.rgb(palette[nbins_new][bin_new+1]);

      // console.log(palette[nbins_new]);
      // console.log(palette[nbins_new][bin_new]);
      // console.log(palette[nbins_new][bin_new+1]);
      // console.log(value)
      // console.log(bin)
      // console.log(nbins_new)
      // console.log(bin_new)
      // console.log(hsl1)
      // console.log(hsl2)

      var w = 1 - (bin % k) / k // weighting coefficient

      // console.log(bin)
      // console.log(bin_new)
      // console.log(w)

      var hsl = [
        Math.floor(w * hsl1[0] + (1-w) * hsl2[0]),
        Math.floor(w * hsl1[1] + (1-w) * hsl2[1]),
        Math.floor(w * hsl1[2] + (1-w) * hsl2[2]),
      ];

      // var hsl = hsl1.map((a, i) => Math.floor(w * a + (1-w) * hsl2[i]));
      return '#' + convert.rgb.hex(hsl);
    }

  }
}

var hs_style = function(feature, resolution) {
 var z = feature.get('Z_Mean');
 return new Style({
    fill: new Fill({
      color: get_color(colorbrewer.YlGnBu, z, 0, 18, 1)
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
 var z = feature.get('Z');

 return new Style({
   text: new Text({
     text : z.toString(),
     font: 'regular 11px "Open Sans", "Arial", "sans-serif"',
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

var coast_style = new Style({
  stroke: new Stroke({
    color: '#000000',
    width: 0.5
  })
});

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

var world_lyr = new VectorTileLayer({
   style: world_style,
   source: vt_source(host, 'general:world')
})

var land_lyr = new VectorTileLayer({
 style: land_style,
 source: vt_source(host, 'ne:ne_10m_land_scale_rank')
})

var coast_lyr = new VectorTileLayer({
 style: coast_style,
 source: vt_source(host, 'ne:ne_10m_coastline')
})

var hs_lyr = new VectorTileLayer({
 style: hs_style,
 source: vt_source(host, 'wavenergy:hs_band')
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

const map = new Map({
  target: 'map',
  background: '#AAAAAA',
  layers: [
    // new TileLayer({
    //   source: new OSM()
    // }),
    world_lyr,
    hs_lyr,
    hs_cont_lyr,
    hs_cont_wfs_lyr,
    land_lyr,
    coast_lyr
  ],
  view: new View({
    center: [0, 0],
    zoom: 0,
    projection: prj
  })
});
