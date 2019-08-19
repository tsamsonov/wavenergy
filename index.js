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
import TileWMS from 'ol/source/TileWMS.js';
import Control from 'ol/control/Control';
import Plotly from 'plotly';
import Graticule from 'ol/Graticule.js';
import Overlay from 'ol/Overlay.js';
import Select from 'ol/interaction/Select.js'
import click from 'ol/events/condition.js'
import $ from 'jquery'
import 'popper.js'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css';

// import * as layers from './layers.js';
var fun = require('./functions.js');
var layers = require('./layers.js');
var styles = require('./styles.js');
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
    zoom: 5,
    maxZoom: 10
  })
});

var popup = new Overlay({
  element: document.getElementById('popup'),
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

var cur_var = layers.hs_lyr_group;
var cur_data = layers.voronoy_lyr;
// var cur_data = layers.wind_spd_50c_lyr_group.getLayers().item(0);

var selectClick = new Select({
  condition: click,
  layers: function(layer) {
            return layer === cur_data
          },
  hitTolerance: 1
});

map.addOverlay(popup);
// map.addInteraction(selectClick);

// map.on('click', function(e) {
//   var element = popup.getElement();
//   $(element).popover('dispose');
// });

map.on('click', function(evt) {
  var viewResolution = map.getView().getResolution();
    var url = layers.voronoy_lyr.getSource().getGetFeatureInfoUrl(
      evt.coordinate, viewResolution, 'EPSG:4326',
      {'INFO_FORMAT': 'application/json'});
    if (url) {
      var parser = new GeoJSON();
      $.ajax({
        url: url,
        type: "POST"
      }).then(function(response) {
        var result = parser.readFeatures(response);
        // if (result.length) {
        //   var info = [];
        //   for (var i = 0, ii = result.length; i < ii; ++i) {
        //     info.push(result[i].get('formal_en'));
        //   }
        //   container.innerHTML = info.join(', ');
        // } else {
        //   container.innerHTML = '&nbsp;';
        // }

        var tbl = `<p><table id="dt">
                      <tr>
                        <th><br>Море</th>
                        <th>${result[0].get('formal_en')}</th>
                      </tr>
                      <tr>
                        <td>Широта, °</td>
                        <td>${result[0].get('lat')}</td>
                      </tr>
                      <tr>
                        <td>Долгота, °</td>
                        <td>${result[0].get('lon')}</td>
                      </tr>
                      <tr>
                        <td colspan="2">Средние значения<br></td>
                      </tr>
                      <tr>
                        <td>Высота, [м]</td>
                        <td>${result[0].get('hsr')}</td>
                      </tr>
                      <tr>
                        <td>Длина, [м]</td>
                        <td>${result[0].get('lsr')}</td>
                      </tr>
                      <tr>
                        <td>Период, [с]</td>
                        <td>${result[0].get('psr')}</td>
                      </tr>
                      <tr>
                        <td>Энергия, [кВт/м]</td>
                        <td>${result[0].get('esr')}</td>
                      </tr>
                      <tr>
                        <td colspan="2">Экстремальные значения</td>
                      </tr>
                      <tr>
                        <td>Макс. высота, [м.]</td>
                        <td>${result[0].get('hs')}</td>
                      </tr>
                      <tr>
                        <td>Макс. высота (3%), [м]</td>
                        <td>${result[0].get('h3p')}</td>
                      </tr>
                    </table></p>`

        var element = popup.getElement();
        $(element).popover('dispose');
        popup.setPosition(evt.coordinate);

        $(element).popover({
          placement: 'top',
          animation: false,
          html: true,
          content: `<p>Море: <code>${result[0].get('sea')}</code></p>
                    <p>Широта, °: <code>${result[0].get('lat')}</code></p>
                    <p>Долгота, °: <code>${result[0].get('lon')}</code></p>
                    <p>Высота, [м]: <code>${result[0].get('hsr')}</code></p>
                    <p>Длина, [м]: <code>${result[0].get('lsr')}</code></p>
                    <p>Период, [с]: <code>${result[0].get('psr')}</code></p>
                    <p>Энергия, [кВт/м]: <code>${result[0].get('esr')}</code></p>
                    <p>Макс. высота, [м.]: <code>${result[0].get('hs')}</code></p>
                    <p>Макс. высота (3%), [м]: <code>${result[0].get('h3p')}</code></p>`
        });

        // $('#dt').innerHTML = tbl;
        // $('#dt').bootstrapTable();
        // var content = document.getElementById('popup-content');
        //
        // content.innerHTML = tbl;
        $(element).popover('show');

        // console.log(result[0].get('lon'));
      });
    }
});

selectClick.on('select', function(evt) {
  // document.getElementById('nodelist').innerHTML = "Loading... please wait...";

  var selected = evt.selected[0];
  var deselected = evt.deselected;

  // if (selected.length) {
  //     selected.setStyle(styles.selectedStyle);
  // } else {
  //     deselected.setStyle(null);
  // }

  var z = selected.get('hsr')

  var coordinate = evt.mapBrowserEvent.coordinate;
  var element = popup.getElement();

  console.log(coordinate);

  $(element).popover('dispose');
  popup.setPosition(coordinate);

  $(element).popover({
    'placement': 'top',
    'animation': false,
    'html': true,
    'trigger': 'focus',
    'content': '<p>H ср.: <code>'  + z +   '</code> м</p>'
  });

  $(element).popover('show');
  // document.getElementById('popup').innerHTML = '<iframe seamless src="' + url + '"></iframe>';
});
// new Graticule({
//   map: map
// });



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
