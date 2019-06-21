// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"maps_legend_builder/maps_legend_builder.js":[function(require,module,exports) {
var globalGap = 5;
var globalFont = "10pt Arial";
var globalTextColor = "black";
var globalCaptionFont = "12pt Arial";
var globalCaptionColor = "black";
var globalBorder = ""; //'1px solid black'; //""; //"5px solid rgba(0,0,0,0)"; //'1px solid black'; //""

module.exports = {
  setGlobalValues: function setGlobalValues(textfont, textcolor, gap, captionfont, captioncolor, borderstyle) {
    globalFont = textfont || globalFont;
    globalTextColor = textcolor || globalTextColor;
    globalGap = gap || globalGap;
    globalCaptionFont = captionfont || globalCaptionFont;
    globalCaptionColor = captioncolor || globalCaptionColor;
    globalBorder = borderstyle || globalBorder;
  },
  tablesInit: function tablesInit(columns, rows, id) {
    //rows - array of rows number of every table
    var body = document.getElementById(id); //document.body,

    for (j = 0; j < columns; j++) {
      var tbl = document.createElement('table'); //it is nessesary not to have table for all screen

      tbl.style = "table-layout:fixed;";
      tbl.style.border = globalBorder;
      tbl.align = "left";

      for (var i = 0; i < rows[j]; i++) {
        var tr = tbl.insertRow();
        var td = tr.insertCell();
        td.id = "td" + j + i;
        td.style.border = globalBorder;
      }

      body.appendChild(tbl);
    }
  },
  splitCell: function splitCell(col, row, cols_amount) {
    //always 1 row
    cols_amount = cols_amount || 2;
    createInternalTable(col, row, 1, cols_amount, true);
  },
  createTable: function createTable(id, rows, cols, is_split, align) {
    var body = document.getElementById(id);
    var tbl = document.createElement('table'); //it is nessesary not to have table for all screen

    tbl.style = "table-layout:fixed;";
    tbl.style.border = globalBorder;
    var cols = cols || 2;

    for (j = 0; j < rows; j++) {
      var tr = tbl.insertRow();

      for (var i = 0; i < cols; i++) {
        var td = tr.insertCell();

        if (is_split) {
          td.id = id + i;
          td.style = "vertical-align: top;"; //to have table in top of the cell
        } else {
          td.style = "vertical-align: center;"; //to have text in cell in center

          if (align) {
            td.align = align;
          }
        }

        td.style.border = globalBorder;
      }
    }

    body.appendChild(tbl);
    return tbl;
  },
  createInternalTable: function createInternalTable(extrenalcol, externalrow, rows, cols, is_split, inside_col, align) {
    var tdID = "td" + extrenalcol + externalrow;

    if (inside_col != undefined && inside_col !== false) {
      tdID = tdID + inside_col;
    }

    var tbl = createTable(tdID, rows, cols, is_split, align); //tableCreate(cols, rows, tdID);

    return tbl;
  },
  getCell: function getCell(table, r, c) {
    var cell = table.rows[r].cells;
    return cell[c];
  },
  insertCanvas: function insertCanvas(td) {
    var canv = document.createElement('canvas');
    td.appendChild(canv);
    return canv;
  },
  //rectangles (изолинейная шкала)
  layeredColoring: function layeredColoring(column, row, colors, strokecolor, size, is_vertical, description, textfont, textcolor, txtGap, xgap, ygap, caption, captionfont, captioncolor, inside_col) {
    xgap = xgap || globalGap;
    ygap = ygap || globalGap;
    canvasSize = getWH(colors.length, size, is_vertical);
    var mytable = createInternalTable(column, row, 1, 1, false, inside_col);
    var ctx = getCtx(mytable, 0, 0, canvasSize.w + xgap * 2, canvasSize.h + ygap * 2);
    var x0 = xgap;
    var y0 = ygap;
    var x = x0;
    var y = y0;
    var w = size[0];
    var h = size[1]; // rectangles drawing

    for (i = 0; i < colors.length; i++) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = strokecolor || "grey";
      ctx.strokeRect(x, y, w, h);

      if (!is_vertical) {
        x = x + w;
      } else {
        y = y + h;
      }
    } //text drawing


    var startCoord, dCoord, constCoordDescr, coordDescr;

    if (is_vertical) {
      startCoord = y0;
      dCoord = h;
      txtGap = txtGap || w + w * 0.1;
      constCoordDescr = x0 + txtGap;
    } else {
      startCoord = x0;
      dCoord = w;
      txtGap = txtGap || h + h * 0.7;
      constCoordDescr = y0 + txtGap;
    } //start coordinate


    switch (description.length) {
      case colors.length - 1:
        coordDescr = startCoord + dCoord;
        break;

      case colors.length + 1:
        coordDescr = startCoord;
        break;

      case colors.length:
        coordDescr = startCoord + dCoord / 2.0;
        break;

      default:
        alert('Incorrect');
    }

    if (is_vertical) {
      textDrawing(ctx, constCoordDescr, coordDescr, 0, dCoord, "start", description, textfont, textcolor);
    } else {
      textDrawing(ctx, coordDescr, constCoordDescr, dCoord, 0, "center", description, textfont, textcolor);
    }

    setCaption(mytable, captionfont, captioncolor, caption);
  },
  drawRings: function drawRings(ctx, x, y, size, color) {
    if (Array.isArray(size)) {
      for (j = 0; j < size.length; j++) {
        ctx.beginPath();
        ctx.arc(x, y, size[j], 0, Math.PI * 2);
        var curcolor = Array.isArray(color) ? color[j] : color || "black";
        ctx.fillStyle = curcolor;
        ctx.fill();
        ctx.closePath();
      }
    } else {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      var tst = color[j] || color || black;
      ctx.fillStyle = Array.isArray(color) ? color[j] : color || "black";
      ctx.fill();
      ctx.closePath();
    }
  },
  getSizeArray: function getSizeArray(size) {
    var arr = size.slice();

    for (i = 0; i < arr.length; i++) {
      if (arr[i].length != undefined) {
        arr[i] = Math.max.apply(null, arr[i]);
      }
    }

    return arr;
  },
  setText: function setText(mytable, r, c, description, textfont, textcolor, textwidth) {
    var mycell = getCell(mytable, r, c);

    if (textwidth != undefined) {
      var w = getTextWidth(description);
      mycell.width = textwidth || w || "100px";
    }

    var currentfont = Array.isArray(textfont) ? textfont[i] : textfont;
    mycell.style.font = currentfont || globalFont;
    mycell.style.color = textcolor || globalTextColor;
    mycell.innerHTML = description;
  },
  getCtx: function getCtx(mytable, i, column, w, h) {
    var mycell = getCell(mytable, i, column);
    var canv = insertCanvas(mycell);
    canv.width = w;
    canv.height = h;
    var ctx = canv.getContext('2d');
    return ctx;
  },
  //значки и картодиаграммы
  circles: function circles(column, row, size, is_vertical, color, description, textfont, textcolor, textwidth, caption, captionfont, captioncolor, inside_col) {
    //column & row - coordinates of cell of external table, where will be our circles
    //inside_col is a column number of internal table in the external table
    //create internal table with description.length rows
    // if there is only one color - set it in one array: "yellow"
    // if there only one size with difficult structure: [[...]]
    if (is_vertical) {
      var mytable = createInternalTable(column, row, description.length, 2, false, inside_col);
    } else {
      var mytable = createInternalTable(column, row, 2, description.length, false, inside_col, "center");
    }

    var currentsize;
    var maxR;

    if (Array.isArray(size)) {
      var sizeArray = getSizeArray(size);
      maxR = Math.max.apply(null, sizeArray);

      if (size.length == 1 && Array.isArray(size[0])) {
        currentsize = size[0];
      }
    } else {
      currentsize = size;
      maxR = size;
    } //coordinate of circles center


    var x0 = maxR + globalGap; //if there is a only one color for all

    var currentcolor;

    if (Array.isArray(color)) {
      if (color.length == 1) {
        currentcolor = color[0];
      }
    } else {
      currentcolor = color;
    }

    if (Array.isArray(description)) {
      for (i = 0; i < description.length; i++) {
        if (is_vertical) {
          var ctx = getCtx(mytable, i, 0, x0 * 2, x0 * 2);
          setText(mytable, i, 1, description[i], textfont, textcolor, textwidth);
        } else {
          var ctx = getCtx(mytable, 0, i, x0 * 2, x0 * 2);
          setText(mytable, 1, i, description[i], textfont, textcolor, textwidth);
        }

        ctx.beginPath();

        if (currentcolor) {
          color[i] = currentcolor;
        }

        var curcolor = currentcolor ? currentcolor : color[i];
        var cursize = currentsize || size[i];
        drawRings(ctx, x0, x0, cursize, curcolor);
        ctx.closePath();
      }
    } else {
      var ctx = getCtx(mytable, 0, 0, x0 * 2, x0 * 2);
      drawRings(ctx, x0, x0, size, currentcolor);
      setText(mytable, 0, 1, description, textfont, textcolor, textwidth);
    }

    setCaption(mytable, captionfont, captioncolor, caption);
  },
  setCaption: function setCaption(mytable, font, color, text) {
    if (text) {
      var cap = mytable.createCaption();
      cap.style.font = font || globalCaptionFont || globalFont;
      cap.style.color = color || globalCaptionColor || globalTextColor;
      cap.innerHTML = text;
    }
  },
  drawText: function drawText(ctx, x, y, align, description, currentfont, textcolor) {
    ctx.fillStyle = textcolor || globalTextColor;
    ctx.font = currentfont || globalFont;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(description, x, y);
  },
  textDrawing: function textDrawing(ctx, x, y, dx, dy, align, description, textfont, textcolor) {
    for (i = 0; i < description.length; i++) {
      var currentfont = Array.isArray(textfont) ? textfont[i] : textfont;
      drawText(ctx, x, y, align, description[i], currentfont, textcolor);
      x = x + dx;
      y = y + dy;
    }
  },
  slices: function slices(col, row, size, fillcolors, strokecolors, is_vertical, description, textfont, textcolor, internaltext, internaltextfont, internaltextcolor, textwidth, caption, captionfont, captioncolor, inside_col) {
    //size[0] - length - w, size[1] - h
    var tablerow = is_vertical ? description.length : 2;
    var tablecol = is_vertical ? 2 : description.length;

    if (is_vertical) {
      var mytable = createInternalTable(col, row, tablerow, tablecol, false, inside_col);
    } else {
      var mytable = createInternalTable(col, row, tablerow, tablecol, false, inside_col, "center");
    }

    var w = size[0];
    var h = size[1];
    var x = globalGap;
    canvL = w + globalGap;
    canvW = h + globalGap; // rectangles drawing

    for (i = 0; i < fillcolors.length; i++) {
      var ctx;

      if (is_vertical) {
        ctx = getCtx(mytable, i, 0, canvL, canvW);
      } else {
        ctx = getCtx(mytable, 0, i, canvL, canvW);
      }

      ctx.fillStyle = fillcolors[i];
      ctx.fillRect(x, x, w, h);
      ctx.strokeStyle = strokecolors;
      ctx.strokeRect(x, x, w, h); //text inside the rectangle

      if (internaltext != undefined) {
        if (internaltext[i] != undefined) {
          xtext = x + w / 2.0;
          ytext = x + h / 2.0;
          drawText(ctx, xtext, ytext, "center", internaltext[i], internaltextfont, internaltextcolor);
        }
      }

      if (is_vertical) {
        setText(mytable, i, 1, description[i], textfont, textcolor, textwidth);
      } else {
        setText(mytable, 1, i, description[i], textfont, textcolor, textwidth);
      }
    }

    setCaption(mytable, captionfont, captioncolor, caption);
  },
  drawDottedLine: function drawDottedLine(ctx, length, x, y, width, linecolor, pattern) {
    if (pattern.length != undefined) {
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.strokeStyle = linecolor;
      var lastX = x + length;
      ctx.moveTo(x, y);

      while (x < lastX) {
        for (k = 0; k < pattern.length; k += 2) {
          x = x + pattern[k];

          if (x > lastX) {
            x = lastX;
            ctx.lineTo(x, y);
            break;
          }

          ctx.lineTo(x, y);
          x = x + pattern[k + 1];
          ctx.moveTo(x, y);
        }
      }

      ;
      ctx.stroke();
    }
  },
  drawArrow: function drawArrow(ctx, x, y, arrowwidth, arrowcolor) {
    ctx.beginPath();
    ctx.fillStyle = arrowcolor;
    ctx.moveTo(x, y + arrowwidth / 2.0);
    ctx.lineTo(x, y - arrowwidth / 2.0);
    x = x + arrowwidth;
    ctx.lineTo(x, y);
    ctx.fill();
  },
  linesLegend: function linesLegend(col, row, length, width, colors, pattern, description, arrowwidth, textfont, textcolor, textwidth, caption, captionfont, captioncolor, inside_col) {
    // width, colors, pattern - can be array of array: [5, [4,3,2], 1]
    // pattern can be false
    // arrowwidth - array
    var mytable = createInternalTable(col, row, description.length, 2, false, inside_col); //if one color for all lines

    if (!Array.isArray(colors) && Array.isArray(description) || Array.isArray(colors) && colors.length != description.length) {
      colors = new Array(description.length).fill(colors);
    } //if one width for all lines


    if (!Array.isArray(width) && Array.isArray(description) || Array.isArray(width) && width.length != description.length) {
      width = new Array(description.length).fill(width);
    } //if one arrowwidth for all lines


    if (!Array.isArray(arrowwidth) && Array.isArray(description) || Array.isArray(arrowwidth) && arrowwidth.length != description.length) {
      arrowwidth = new Array(description.length).fill(arrowwidth);
    }

    arrowwidth = arrowwidth || false;
    var x0 = globalGap;
    var y0 = globalGap + 2;
    var x = x0;
    var y = y0;
    var ctxW = length + globalGap * 2;
    var arrH = getSizeArray(width);
    var ctxH = Math.max.apply(null, arrH) + globalGap * 2;

    for (i = 0; i < description.length; i++) {
      //array amount
      ctx = getCtx(mytable, i, 0, ctxW, ctxH);
      var l = length;
      x = x0;

      if (arrowwidth) {
        //not false not undefined
        if (arrowwidth[i]) {
          if (arrowwidth[i] < 0) {
            x = x0 - arrowwidth[i];
            l = length + arrowwidth[i]; //arrowwidth < 0 => line will be shorter
          } else if (arrowwidth[i] > 0) {
            //arrowwidth > 0 => line will be shorter
            l = length - arrowwidth[i];
          }
        }
      }

      if (Array.isArray(width[i])) {
        for (j = 0; j < colors[i].length; j++) {
          //lines amount inside the line
          if (pattern[i] && pattern[i][j]) {
            drawDottedLine(ctx, l, x, y + width[i][0] / 2.0, width[i][j], colors[i][j], pattern[i][j]);
          } else {
            ctx.beginPath();
            ctx.strokeStyle = colors[i][j];
            ctx.lineWidth = width[i][j];
            ctx.moveTo(x, y + width[i][0] / 2.0);
            ctx.lineTo(x + l, y + width[i][0] / 2.0);
            ctx.stroke();
          }
        }
      } else {
        if (pattern[i]) {
          drawDottedLine(ctx, l, x, y + width[i] / 2.0, width[i], colors[i], pattern[i]);
        } else {
          ctx.beginPath();
          ctx.strokeStyle = colors[i];
          ctx.lineWidth = width[i];
          ctx.moveTo(x, y + width[i] / 2.0);
          ctx.lineTo(x + l, y + width[i] / 2.0);
          ctx.stroke();
        }
      }

      if (arrowwidth) {
        if (arrowwidth[i]) {
          arrowcolor = Array.isArray(colors[i]) ? colors[i][0] : colors[i];
          arrowY = Array.isArray(width[i]) ? width[i][0] / 2.0 + y : width[i] / 2.0 + y;
          w = arrowwidth[i];

          if (w < 0) {
            drawArrow(ctx, x, arrowY, w, arrowcolor);
          } else {
            drawArrow(ctx, x + l, arrowY, w, arrowcolor);
          }
        }
      }

      setText(mytable, i, 1, description[i], textfont, textcolor, textwidth);
    }

    setCaption(mytable, captionfont, captioncolor, caption);
  },
  pointsMethod: function pointsMethod(col, row, is_vertical, diameter, color, description, strokecolor, textfont, textcolor, caption, captionfont, captioncolor, inside_col) {
    //arrays
    //always 3 circless
    var rows_amount = Array.isArray(description) ? description.length : 1;

    if (is_vertical) {
      var mytable = createInternalTable(col, row, rows_amount, 2, false, inside_col); //, description.length);
    } else {
      var mytable = createInternalTable(col, row, 1, 2 * rows_amount, false, inside_col, "center"); //, description.length);
    }

    if (rows_amount == 1) {
      var gap = globalGap > diameter ? globalGap : diameter;
      var w = gap + diameter * 3;
      var h = gap + 5 * diameter / 2.0;
      var ctx = getCtx(mytable, 0, 0, w, h);
      drawPoints(ctx, diameter / 2.0, color, description, strokecolor);
      setText(mytable, 0, 1, description, textfont, textcolor);
    } else {
      for (i = 0; i < rows_amount; i++) {
        var gap = globalGap > diameter[i] ? globalGap : diameter[i];
        var w = gap + diameter[i] * 3;
        var h = gap + 5 * diameter[i] / 2.0;

        if (is_vertical) {
          var ctx = getCtx(mytable, i, 0, w, h);
          setText(mytable, i, 1, description[i], textfont, textcolor);
        } else {
          var ctx = getCtx(mytable, 0, 2 * i, w, h);
          setText(mytable, 0, 2 * i + 1, description[i], textfont, textcolor);
        }

        drawPoints(ctx, diameter[i] / 2.0, color[i], strokecolor);
      }
    }

    setCaption(mytable, captionfont, captioncolor, caption);
  },
  drawPoints: function drawPoints(ctx, radius, color, strokecolor) {
    var x0 = radius * 2;
    var y0 = x0;
    var x = x0;
    var y = y0;
    ctx.strokeStyle = strokecolor || color;
    ctx.fillStyle = color || black;
    ctx.beginPath(); //first point

    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.beginPath(); //second point

    ctx.arc(x + 4 * radius, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.beginPath(); //thirs point

    ctx.arc(x + 2 * radius, y + 3 * radius, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  },
  textLegend: function textLegend(col, row, text, textfont, textcolor, descr, descrfont, descrcolor, caption, captionfont, captioncolor, inside_col) {
    var rows_amount = Array.isArray(descr) ? descr.length : 1;
    var mytable = createInternalTable(col, row, rows_amount, 2, false, inside_col); //, description.length);
    //if one color for all text elements

    if (!Array.isArray(textcolor) && Array.isArray(descr) || Array.isArray(textcolor) && textcolor.length != descr.length) {
      textcolor = new Array(descr.length).fill(textcolor);
    }

    if (rows_amount == 1) {
      setText(mytable, 0, 0, text, textfont, textcolor);
      setText(mytable, 0, 1, descr, descrfont, descrcolor);
    } else {
      for (i = 0; i < rows_amount; i++) {
        var font = textfont ? textfont[i] : false;
        var color = textcolor ? textcolor[i] : false;
        setText(mytable, i, 0, text[i], textfont[i], textcolor[i]);
        setText(mytable, i, 1, descr[i], descrfont[i], descrcolor[i]);
      }
    }

    setCaption(mytable, captionfont, captioncolor, caption);
  },
  imagesLegend: function imagesLegend(col, row, links, descr, descrfont, descrcolor, caption, captionfont, captioncolor, inside_col) {
    var rows_amount = Array.isArray(descr) ? descr.length : 1;
    var mytable = createInternalTable(col, row, rows_amount, 2, false, inside_col);

    if (rows_amount == 1) {
      var mycell = getCell(mytable, 0, 0);
      var img = document.createElement("img");
      mycell.appendChild(img);
      img.src = links;
      setText(mytable, 0, 1, descr, descrfont, descrcolor);
    } else {
      for (i = 0; i < rows_amount; i++) {
        var mycell = getCell(mytable, i, 0);
        var img = document.createElement("img");
        mycell.appendChild(img);
        img.src = links[i];
        var font = descrfont ? descrfont[i] : false;
        var color = descrcolor ? descrcolor[i] : false;
        setText(mytable, i, 1, descr[i], font, color);
      }
    }

    setCaption(mytable, captionfont, captioncolor, caption);
  },
  getWH: function getWH(amount, size, is_vertical, gap, description) {
    // for layeredColoring
    // size[0] - w, size[1] - h of rectangle
    var w, h;
    var gap = gap || globalGap * 2;

    if (is_vertical) {
      h = size[1] * amount + gap;
      w = size[0] * 2 + gap;
    } else {
      h = size[1] * 2 + gap;
      w = size[0] * amount + gap;
    }

    return {
      w: w,
      h: h
    };
  },
  getTextWidth: function getTextWidth(description) {
    //check digit in the last string
    var l = 0; //text length

    if (Array.isArray(description)) {
      for (i = 0; i < description.length; i++) {
        if (description[i].length > l) {
          l = description[i].length;
        }
      }
    } else {
      l = description.length;
    }

    return l * 8;
  }
};
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52819" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","maps_legend_builder/maps_legend_builder.js"], null)
//# sourceMappingURL=/maps_legend_builder.b9815ee5.js.map