import 'ol/ol.css';
// import Vue from 'vue';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer, Group } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import GeoJSON from 'ol/format/GeoJSON';
import TileJSON from 'ol/source/TileJSON.js';
import OSM from 'ol/source/OSM';
import MVT from 'ol/format/MVT.js';
import {Fill, Stroke, Icon, Style, Text, Circle} from 'ol/style';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';
import {get as getProjection} from 'ol/proj';
import {transform, Projection} from 'ol/proj.js';
import {fromLonLat, transformExtent} from 'ol/proj.js';
import WMTS from 'ol/tilegrid/WMTS.js';
import Control from 'ol/control/Control';
import Plotly from 'plotly';
import Graticule from 'ol/Graticule.js';
import Overlay from 'ol/Overlay.js';

// import * as layers from './layers.js';
var fun = require('./functions.js')
var layers = require('./layers.js');
import * as tools from './maps_legend_builder/maps_legend_builder.js';

const colorbrewer = require('colorbrewer');
const convert = require('color-convert');

var epsg = 4326;

var center = [40, 60]
var prj = new Projection({
  code: 'EPSG:4326',
  units: 'degrees',
  axisOrientation: 'neu'
});

var seas = ['baltic', 'barentsz', 'black', 'kaspiy']
var vars = ['esr', 'hsr', 'psr', 'lsr', 'hs', 'h3p', 'osr', 'wind_grp_50', 'wind_grp_100']

// var popup = new Overlay({
//   element: document.getElementById('popup'),
//   autoPan: true,
//   autoPanAnimation: {
//     duration: 250
//   }
// });

const map = new Map({
  target: 'map',
  background: '#AAAAAA',
  layers: [
    // new TileLayer({
    //   source: new OSM(),
    // }),
    // mbx,
    layers.world_lyr,
    layers.hs_lyr_group,
    layers.land_lyr,
    layers.bnd_lyr,
    layers.coast_lyr,
    layers.city_lyr
  ],
  view: new View({
    projection: prj,
    center: center,
    // center: transform([40, 60], 'EPSG:4326', 'ESRI:54003'),
    // extent: transformExtent([-180, -90, 180, 90], 'EPSG:4326', 'ESRI:54003'),
    zoom: 3,
    maxZoom: 10
  })
});

// new Graticule({
//   map: map
// });

var cur_var = layers.hs_lyr_group;

var mySelect = document.getElementById('varList');

mySelect.value = 'hs';

function insert_legend(palette, from, to, by, id = 'td00') {
  document.getElementById(id).innerHTML = "";
  tools.layeredColoring(0, 0,
              fun.get_colors(palette, from, to, by),
              false, [30, 15], false,
              fun.get_values(from, to, by), "8pt Arial", "black", 30, 20,
              false, "", "bold 10pt Arial");
}

mySelect.onchange = function() {
   var x = document.getElementById("varList").value;
   console.log(x)

   map.removeLayer(cur_var);

   var level = 1;

   switch(x) {
      case 'hs':
        cur_var = layers.hs_lyr_group;
        insert_legend(colorbrewer.RdPu, 0, 18, 1);
        break;
      case 'h3p':
        cur_var = layers.h3p_lyr_group;
        insert_legend(colorbrewer.PuRd, 0, 24, 2);
        break;
      case 'hsr':
        cur_var = layers.hsr_lyr_group;
        insert_legend(colorbrewer.OrRd, 0, 2.8, 0.2);
        break;
      case 'lsr':
        cur_var = layers.lsr_lyr_group;
        insert_legend(colorbrewer.Blues, 0, 80, 5);
        break;
      case 'psr':
        cur_var = layers.psr_lyr_group;
        insert_legend(colorbrewer.Greens, 0, 5, 0.5);
        break;
      case 'esr':
        cur_var = layers.esr_lyr_group;
        insert_legend(colorbrewer.YlGnBu, 0, 35, 2.5);
        break;
      case 'osr':
        cur_var = layers.osr_lyr_group;
        insert_legend(colorbrewer.YlGn, 0, 60, 5);
        break;
      case 'wind_grp_50':
        cur_var = layers.wind_grp_50_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 1200, 100);
        level = 2;
        break;
      case 'wind_grp_100':
        cur_var = layers.wind_grp_100_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 1200, 100);
        level = 2;
        break;
      case 'wind_grp_50c':
        cur_var = layers.wind_grp_50c_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 1200, 100);
        level = 2;
        break;
      case 'wind_grp_100c':
        cur_var = layers.wind_grp_100c_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 1200, 100);
        level = 2;
        break;
      case 'wind_spd_50c_year':
        cur_var = layers.wind_spd_50c_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 8, 1);
        level = 2;
        break;
      case 'wind_spd_100c_year':
        cur_var = layers.wind_spd_100c_lyr_group;
        insert_legend(colorbrewer.PuBuGn, 0, 8, 1);
        level = 2;
        break;

    }

    map.getLayers().insertAt(level, cur_var);
}

tools.tablesInit(1, [1], "legend");
insert_legend(colorbrewer.RdPu, 0, 18, 1);
