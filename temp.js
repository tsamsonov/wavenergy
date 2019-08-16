// proj4.defs('ESRI:54003', '+proj=mill +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
// register(proj4);
// var prj = getProjection('ESRI:54003');
// prj.setExtent(transformExtent([-179, -89, 179, 89],
//    'EPSG:4326', 'ESRI:54003'));

// var prj = new Projection({
//   code: 'ESRI:54003',
//   // extent: [-9009954.605703328, -9009954.605703328,
//   //   9009954.605703328, 9009954.605703328],
//   extent: transformExtent([-179, -89, 179, 89], 'EPSG:4326', 'ESRI:54003'),
//   worldExtent: [-179, -89.99, 179, 89.99]
// });
//
// var center = transform([40, 60], 'EPSG:4326', 'ESRI:54003');

// proj4.defs('EPSG:21781',
//   '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
//   '+x_0=600000 +y_0=200000 +ellps=bessel ' +
//   '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs');
// register(proj4);
// const prj = getProjection('EPSG:4326');
