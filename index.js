import 'ol/ol.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import MVT from 'ol/format/MVT.js'
import {Fill, Stroke, Style} from 'ol/style';
import TileGrid from 'ol/tilegrid/TileGrid';

var host = "localhost:8080/geoserver";
var name = "wavenergy:barentsz_hs_band"
var epsg = 900913

// var addr = `http://{0}/wfs?service=wfs&version=1.1.0&request=GetFeature&typename={1}&outputFormat=application/json&srsname=EPSG:{2}`
// function vector_source(addr, host, name, epsg){
//   return new VectorSource({
//     format: new GeoJSON(),
//     // url: addr.format(host, name, epsg)
//     url: `http://${host}/wfs?service=wfs&version=1.1.0&request=GetFeature&typename=${name}&outputFormat=application/json&srsname=EPSG:${epsg}`
//   });
// }

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

var style_simple = new Style({
   fill: new Fill({
     color: '#FFFFFF'
   }),
   stroke: new Stroke({
     color: '#880000',
     width: 0.5
   })
 });

 function simpleStyle(feature) {
   return style_simple;
 }

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    new VectorTileLayer({
      style:style_simple,
      source: new VectorTileSource({
        // tilePixelRatio: 1, // oversampling when > 1
        // tileGrid: TileGrid(),
        format: new MVT(),
        url: `http://${host}/gwc/service/tms/1.0.0/${name}@EPSG%3A${epsg}@pbf/{z}/{x}/{-y}.pbf`
      })
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 0
  })
});
