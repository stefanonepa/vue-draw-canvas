// Copyright 2017 Olivier Burdet
//
"use strict";
var jsRep = "/dummy/";

// objet iMini
function iMini(c, ctx, w, h, e2, jsr) {

  // Private properties and methods

  var version = '0.0,000';

  var messages = 'iMini starting, version ' + version + "\n";

  if (jsr != undefined) jsRep = jsr;
  var that = this;
  var myName = c.id;

  console.log("iMini " + version + " " + jsRep + " " + c.id);

  // input data and processed data
  var userID;
  var sessionID;
  var IP;
  var col = []; // color values
  var myData = []; // contains all data for easy access
  myData.nodes = [];

  var wtot = w;
  var htot = h;
  var hbar = 34;

  var hmsg = 30;
  var wbord = 8;
  var wint = 8;
  var xbarmin;
  var xbarmax;
  var wCoo = 100;
  var hCoo = 8;
  var curMessage = '';

  var curDist = 100;
  var MIN_DIST = 10; // pixels for activating proximity

  var doRedraw = true;
  var lastDraw = new Date().getTime();

  var ecran1 = [];
  ecran1.width = wtot - 2 * wbord - wint - e2;
  ecran1.height = htot - hbar - hmsg;
  var inputData;
  var inputChanged;
  var mod = [];
  mod.numbers = false;
  mod.mesh = false;
  mod.shift = false;
  mod.alt = false;
  mod.control = false;
  mod.resultant = false;
  mod.showEp = false;
  mod.mode = '';

  var key = [];
  var map = []; // to store key codes
  var state;

  var butSize = Math.round(hbar / 1.5);
  var butOff = Math.round(butSize / 4);
  var vertOff = butOff;

  var mouse = [];
  mouse.pos = "";
  mouse.x = 0;
  mouse.y = 0;
  mouse.y = 0;
  mouse.startX = 0;
  mouse.startY = 0;
  mouse.dispX = 0;
  mouse.dispY = 0;
  mouse.stretchFactor = 1;
  mouse.deltAngle = 0;
  mouse.inDrag = false;
  mouse.passage = false;
  mouse.disableEvents = false;
  mouse.lastWheel = new Date().getTime();

  var echelle = []; // echelle de l'écran 1 : système réel
  var echelle2 = []; // echelle de l'écran 2 : diagramme de Cremona

  function init() {
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('wheel', onWheel, false);
    // blocage des événements "roulette" sur le canevas
    document.getElementById(myName).onwheel = function (event) {
      event.preventDefault();
    };
    document.getElementById(myName).onmousewheel = function (event) {
      event.preventDefault();
    };
  }

  // onMouseDown                                                            MOUSE DOWN
  function onMouseDown(evt) {
    if (!mouse.inCanvas) return; // la souris n'est pas dans le canevas de l'applet

    mouse.down = true;
    mouse.firstDrag = false;
    mouse.control = false;
    if (mod.control) {
      mouse.control = true;
    } else {
      if (evt.ctrlKey)
        mouse.control = true;
    }

    (mod.alt) ? mouse.alt = true: mouse.alt = evt.altlKey;
    (mod.shift) ? mouse.shift = true: mouse.shift = evt.shiftKey;
    mouse.button = evt.button + 1;
    mouse.downOn = mouse.pos;
    mouse.startX = mouse.x;
    mouse.startY = mouse.y;
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.inNewLine = false;
    //console.log("onMouseDown: " + mouse.button);
    if ((mouse.button == 2) || ((mouse.button == 3) && evt.ctrlKey)) {
      if (mouse.inScreen1) evt.stopPropagation();
      mod.pan = true;
      return;
    }
    if (mouse.pos == 'intbar') { // on commence à déplacer la barre intermédiaire
      mod.intBarMove = true;
    }
    switch (true) {
      case (mod.mode == 'node'):
        { // on ne fait rien : les coordonnées de départ de la souris sont déjà stockées
          break;
        }
    }
  }
  // onMouseUp                                                              MOUSE UP
  function onMouseUp(evt) {
    if (state <= 0) return; // applet inactif
    if (!mouse.down) { // on n'a pas eu le mouse down, on ignore le mouse up
      mouse.inDrag = false;
      mouse.firstDrag = false;
      return;
    }
    if (!mouse.inCanvas && !mouse.inDrag) { // en-dehors du canevas, on ne tient compte de que des fin de drag
      mouse.down = false;
      return;
    }
    var i, num;
    var wasInDrag = mouse.inDrag;
    mouse.down = false;
    mouse.inDrag = false;
    mouse.firstDrag = false;
    if ((mouse.button == 2) || ((mouse.button == 3) && evt.ctrlKey)) {
      mod.pan = false;
      evt.stopPropagation();
      return;
    }
    if (mod.intBarMove) {
      mod.intBarMove = false;
      return;
    }
    mouse.dispX = mouse.x - mouse.startX;
    mouse.dispY = mouse.y - mouse.startY;
    if ((mouse.inMenuBar) && !wasInDrag) {
      menuBarAction(mouse);
    } else {
      //console.log("onMouseUp: " + mod.mode + " " + mouse.pos + " " + mouse.closestItem + " " + wasInDrag);
      switch (true) {
        case (mod.mode == 'node'):
          {
            if ((mouse.pos == 'msgbar') && !wasInDrag) {
              showDialog('node', '');
              break;
            }
            if ((mouse.closestItem == undefined) && mouse.inScreen1) {
              // ajouter un nouveau noeud
              var num = myData.nodes.length;
              var N = {};
              N.x = getRealX(mouse.x);
              N.y = getRealY(mouse.y);
              myData.nodes[num] = N;
              inputChanged = true;
              myData.currentNodes = getCurrentNodes();
              drawAll('new node');
            } else {
              if (wasInDrag) {
                //console.log('onMouseUp: déplacement ' + mouse.dispX + ". " + mouse.dispY);
                moveNodes(mouse.dispX, mouse.dispY);
                inputChanged = true;
              } else {
                var saveSelected = false;
                if ((mouse.closestItem != undefined) && (mouse.closestItem != ''))
                  saveSelected = myData.nodes[mouse.closestItem].selected;
                num = myData.nodes.length;
                if (!mouse.control)
                  for (i = 0; i < num; i++)
                    myData.nodes[i].selected = false
                if (mouse.closestItem != undefined) {
                  myData.nodes[mouse.closestItem].selected = !saveSelected;
                  showMessage();
                }
              }
            }
            drawAll();
            break;
          }
          // case forces              
        case (mod.mode == 'force'):
          {
            if ((mouse.pos == 'msgbar') && !wasInDrag) {
              showDialog('force', '');
              break;
            }
            if ((mouse.closestItem == undefined) && mouse.inScreen1) {
              // ajouter une nouvelle force
              var F = {};
              F.x = getRealX(mouse.x);
              F.y = getRealY(mouse.y);
              var vals = curForce.split("<");
              F.mag = 1 * vals[0];
              F.angle = 1 * vals[1];
              F.Fx = F.mag * Math.cos(Math.PI / 180 * F.angle);
              if (Math.abs(F.Fx) < 1.E-10) F.Fx = 0;
              F.Fy = F.mag * Math.sin(Math.PI / 180 * F.angle);
              if (Math.abs(F.Fy) < 1.E-10) F.Fy = 0;
              var num = myData.forces.length;
              myData.forces[num] = F;
              if (num == 0) // la première force définit l'échelle
                myData.echelleForces = 50 / F.mag;
              inputChanged = true;
              myData.currentForces = getCurrentForces();
              drawAll('new force');
            } else {
              if (wasInDrag) {
                moveRotateStretchForces(mouse.dispX, mouse.dispY, 180 / Math.PI * mouse.deltAngle, mouse.stretchFactor);
                inputChanged = true;
              } else {
                var saveSelected = false;
                if ((mouse.closestItem != undefined) && (mouse.closestItem != ''))
                  saveSelected = myData.forces[mouse.closestItem].selected;
                num = myData.forces.length;
                if (!mouse.control)
                  for (i = 0; i < num; i++)
                    myData.forces[i].selected = false
                if (mouse.closestItem != undefined) {
                  myData.forces[mouse.closestItem].selected = !saveSelected;
                  if (!saveSelected) {
                    curForce = arrondi(myData.forces[mouse.closestItem].mag) + "<" + myData.forces[mouse.closestItem].angle.toFixed(1);
                    curMessage = curForce;
                    showMessage();
                  }
                }
              }
            }
            break;
          } // case forces  
        case (mod.mode == 'support'):
          {
            if ((mouse.closestItem == undefined) && mouse.inScreen1) {
              var num = myData.supports.length;
              // ajouter un nouveau support
              var F = {};
              F.x = getRealX(mouse.x);
              F.y = getRealY(mouse.y);
              if (mouse.control)
                F.attrib = 1;
              else
              if (mouse.shift)
                F.attrib = 2;
              else
                F.attrib = 0;
              myData.supports[num] = F;
              num = myData.supports.length;
              curMessage = curTexts.getValue('nosupport', '*');
              myData.currentSupports = getCurrentSupports();
              inputChanged = true;
              drawAll('support');
            } else {
              if (wasInDrag) {
                moveSupports(mouse.x - mouse.startX, mouse.y - mouse.startY);
                inputChanged = true;
                drawAll('support');
              } else {
                var saveSelected = false;
                if ((mouse.closestItem != undefined) && (mouse.closestItem != ''))
                  saveSelected = myData.supports[mouse.closestItem].selected;
                num = myData.supports.length;
                if (!mouse.control)
                  for (i = 0; i < num; i++)
                    myData.supports[i].selected = false
                if (mouse.closestItem != undefined) {
                  myData.supports[mouse.closestItem].selected = !saveSelected;
                }
              }
            }
            break;
          } // case supports
        case (mod.mode == 'scaleimage'):
          {
            var dx = mouse.x - mouse.startX;
            var dy = mouse.y - mouse.startY;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 10) {
              var echelle_new = computeScale(0, curDist, 0, curDist, mouse.startX, mouse.startX + dist, mouse.startY, mouse.startY + dist);
              echelle_new.ymin -= curDist;
              echelle_new.ymax -= curDist;
              echelle_new.yoff -= curDist;

              myData.back_xmin = getRealX(getScreenX(myData.back_xmin), echelle_new);
              myData.back_xmax = getRealX(getScreenX(myData.back_xmax), echelle_new);
              myData.back_ymin = getRealY(getScreenY(myData.back_ymin), echelle_new);
              myData.back_ymax = getRealY(getScreenY(myData.back_ymax), echelle_new);

              for (var i = 0; i < myData.forces.length; i++) {
                myData.forces[i].x = getRealX(getScreenX(myData.forces[i].x), echelle_new);
                myData.forces[i].y = getRealY(getScreenY(myData.forces[i].y), echelle_new);
              }
              for (i = 0; i < myData.supports.length; i++) {
                myData.supports[i].x = getRealX(getScreenX(myData.supports[i].x), echelle_new);
                myData.supports[i].y = getRealY(getScreenY(myData.supports[i].y), echelle_new);
              }
              for (i = 0; i < myData.tensionLine.length; i++) {
                myData.tensionLine[i].x1 = getRealX(getScreenX(myData.tensionLine[i].x1), echelle_new);
                myData.tensionLine[i].y1 = getRealY(getScreenY(myData.tensionLine[i].y1), echelle_new);
                myData.tensionLine[i].x2 = getRealX(getScreenX(myData.tensionLine[i].x2), echelle_new);
                myData.tensionLine[i].y2 = getRealY(getScreenY(myData.tensionLine[i].y2), echelle_new);
              }
              for (i = 0; i < myData.compressionLine.length; i++) {
                myData.compressionLine[i].x1 = getRealX(getScreenX(myData.compressionLine[i].x1), echelle_new);
                myData.compressionLine[i].y1 = getRealY(getScreenY(myData.compressionLine[i].y1), echelle_new);
                myData.compressionLine[i].x2 = getRealX(getScreenX(myData.compressionLine[i].x2), echelle_new);
                myData.compressionLine[i].y2 = getRealY(getScreenY(myData.compressionLine[i].y2), echelle_new);
              }
              if (myData.subsystem != undefined)
                for (i = 0; i < myData.subsystem.length; i++) {
                  myData.subsystem[i].x = getRealX(getScreenX(myData.subsystem[i].x), echelle_new);
                  myData.subsystem[i].y = getRealY(getScreenY(myData.subsystem[i].y), echelle_new);
                }
              echelle = echelle_new;
              myData.currentForces = getCurrentForces();
              myData.currentSupports = getCurrentSupports();
              var diff = hbar - hmsg;
              myData.xmin = getRealX(wbord);
              myData.xmax = getRealX(wbord + ecran1.width);
              myData.ymin = getRealY(hmsg + ecran1.height + diff);
              myData.ymax = getRealY(hmsg + diff);
              curMessage = curTexts.getValue('distanceset', "*") + " " + arrondi(curDist);
              inputChanged = true;
              curButtons[buttonNumber('scaleimage')].unSet();
              mod.mode = undefined;
              drawAll('');
            } else {
              curButtons[buttonNumber('scaleimage')].unSet();
              mod.mode = undefined;
              curMessage = curTexts.getValue('distancenotset', "*");
              showMessage();
            }
            break;
          } // case scaleimage
        case (mod.mode == 'subsystem'):
          {
            if (mouse.inScreen1 && mouse.inNewLine) {
              // ajouter un nouveau sous-système
              num = tempLine.length;
              tempLine[num] = [];
              tempLine[num].x = getRealX(mouse.x);
              tempLine[num].y = getRealY(mouse.y);
              myData.subsystem = [];
              for (i = 0; i <= num; i++) {
                myData.subsystem[i] = [];
                myData.subsystem[i].x = tempLine[i].x;
                myData.subsystem[i].y = tempLine[i].y;
              }
              tempLine = undefined;
              inputChanged = true;
              mouse.inNewLine = false;
            } else {
              if (myData.subsystem != undefined) {
                if (wasInDrag) {
                  movePolyLine(mouse.x - mouse.startX, mouse.y - mouse.startY, mouse.closestItem);
                  inputChanged = true;
                } else {
                  if ((mouse.closestItem != undefined) && (mouse.closestItem > 0))
                    myData.subsystem.selected = !myData.subsystem.selected;
                }
              }
            }
            drawAll('lines');
            break;
          } // case subsystem
        case ((mod.mode == 'tensionline') || (mod.mode == 'compressionline')):
          {
            if ((mouse.closestItem == undefined) && mouse.inScreen1) {
              // ajouter une nouvelle ligne
              tempLine.x2 = getRealX(mouse.x);
              tempLine.y2 = getRealY(mouse.y);
              if (mod.mode == 'tensionline') {
                var num = myData.tensionLine.length;
                myData.tensionLine[num] = tempLine;
              }
              if (mod.mode == 'compressionline') {
                var num = myData.compressionLine.length;
                myData.compressionLine[num] = tempLine;
              }
              inputChanged = true;
            } else {
              if (wasInDrag) {
                moveLine(mouse.x - mouse.startX, mouse.y - mouse.startY);
                inputChanged = true;
              } else {
                var saveSelected = false;
                if (mouse.closestItem != undefined)
                  if (mouse.closestItem > 0)
                    saveSelected = myData.tensionLine[mouse.closestItem - 1].selected;
                  else
                    saveSelected = myData.compressionLine[-mouse.closestItem - 1].selected;
                num = myData.tensionLine.length;
                for (i = 0; i < num; i++)
                  myData.tensionLine[i].selected = false;
                num = myData.compressionLine.length;
                for (i = 0; i < num; i++)
                  myData.compressionLine[i].selected = false;
                if (mouse.closestItem != undefined) {
                  if (mouse.closestItem >= 0)
                    myData.tensionLine[mouse.closestItem - 1].selected = !saveSelected;
                  else
                    myData.compressionLine[-mouse.closestItem - 1].selected = !saveSelected;
                }
              }
            }
            drawAll('lines');
            break;
          } // case tensionline or compressionline
      }
    }
    mouse.downOn = "";
    mouse.inDrag = false;
    //drawAll();
  }
  // onMouseMove                                                            MOUSE MOVE
  function onMouseMove(evt) {
    var mousePos = getMousePos(c, evt);
    var i;
    if (mousePos === undefined) {
      mouse.x = 0;
      mouse.y = 0;
    } else {
      mouse.delta = arrondi(Math.sqrt((mouse.lastDrawX - mousePos.x) * (mouse.lastDrawX - mousePos.x) + (mouse.lastDrawY - mousePos.y) * (mouse.lastDrawY - mousePos.y)), 2);
      mouse.x = mousePos.x;
      mouse.y = mousePos.y;
    }
    mouse.inMenuBar = false;
    mouse.inScreen1 = false;
    mouse.inScreen2 = false;
    mouse.inCanvas = false;

    if ((mouse.x >= 0) && (mouse.x <= wtot) && (mouse.y >= 0) && (mouse.y <= htot)) { // mouse is on the canvas
      mouse.inCanvas = true;
      if ((mouse.y <= hbar)) { // mouse is on the top menu bar
        mouse.pos = 'menubar'
        mouse.inMenuBar = true;
      } else {
        if (mouse.y >= htot - hmsg) // mouse is on bottom message bar
          mouse.pos = 'msgbar';
        else {
          if ((mouse.x <= wbord + ecran1.width)) { // mouse in screen 1
            mouse.inScreen1 = true;
            mouse.pos = 'screen1';
          } else {
            if (mouse.x <= wtot - wbord - e2)
              mouse.pos = 'intbar';
            else {
              mouse.pos = 'screen2';
              mouse.inScreen2 = true;
            }
          }
        }
      }
    } else {
      mouse.pos = 'outside';
      if (!mouse.inDrag) return; // mouse is not on the canvas and not in drag mode        
    }
    if (state <= 0) return; // applet inactif
    if (mouse.down) {
      if (!mouse.inDrag) {
        if ((mouse.x != mouse.prevX) && (mouse.y != mouse.prevY)) {
          mouse.firstDrag = true;
          mouse.inDrag = true;
        }
      }
    }
    if (((mouse.button == 2) || ((mouse.button == 3) && evt.ctrlKey)) && mod.pan && (mouse.inScreen1)) {
      echelle.pxoff = echelle.pxoff + mouse.x - mouse.prevX;
      echelle.pyoff = echelle.pyoff + mouse.y - mouse.prevY;
      echelle.pymax = echelle.pymax + mouse.y - mouse.prevY;
      echelle.pymin = echelle.pymin + mouse.y - mouse.prevY;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      var diff = hbar - hmsg;
      myData.xmin = getRealX(wbord);
      myData.xmax = getRealX(wbord + ecran1.width);
      myData.ymin = getRealY(hmsg + ecran1.height + diff);
      myData.ymax = getRealY(hmsg + diff);
    }
    if (mod.intBarMove) {
      var newE2 = wtot - mouse.x - wbord - 0.5 * wint;
      var newE1 = wtot - 2 * wbord - wint - newE2;
      if ((newE2 >= 0) && (newE1 > 10)) {
        if (!mouse.shift) echelle = computeScale(myData.xmin, myData.xmax, myData.ymin, myData.ymax, wbord, wbord + ecran1.width, hbar, hbar + ecran1.height);
        e2 = newE2;
        ecran1.width = newE1;
        drawAll();
      }
      return;
    }

    switch (true) {
      case (mouse.pos == 'menubar'):
        {
          var numBtn = "";
          // on ne fait rien : pas de menu bar dans cette version
          break;
        }
      case (mouse.pos == 'msgbar'):
        {
          break;
        }
      case (mouse.pos == 'screen1'):
        {
          if (!mouse.inDrag && !mouse.down) {
            mouse.pos = rechercheElementEcran1(); // <<< does a lot of work !!
            if (mouse.pos == '') mouse.pos = 'screen1';
          } else {
            switch (true) { // mouse is in screen1
              case (mod.mode == 'node'):
                {
                  if ((mouse.firstDrag) && (mouse.closestItem != undefined)) {
                    if ((!mouse.control) && (!mouse.shift)) {
                      if (mouse.posClosest != 2)
                        for (i = 0; i < myData.nodes.length; i++) {
                          myData.nodes[i].selected = false;
                          myData.nodes[i].popup = undefined;
                        }
                    }
                    myData.nodes[mouse.closestItem].selected = true;
                  }
                  break;
                }
            }
          }
        }

      case (mouse.pos == 'intbar'):
        {
          break;
        }
      case (mouse.pos == 'screen2'):
        {
          break;
        }
    }

    if ((mouse.prevPos != mouse.pos) || mouse.inDrag) {
      drawAll('mouse_drag');
      switch (true) {
        case (mouse.pos == 'outside'):
          c.style.cursor = 'auto';
          break;
        case (mouse.pos == 'intbar'):
          c.style.cursor = 'e-resize';
          break;
        default:
          if (mod.mode != 'zoom') c.style.cursor = 'auto';
      }
      mouse.prevPos = mouse.pos;
    }
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    showCoordinates();
    return false;
  }

  // highlight screen 1 objects                                              RECHERCHE ECRAN 1
  function rechercheElementEcran1() {
    var i, res, posClosest;
    if (mod.mode != 'undefined') {
      var dist, minDist = 1E10,
        closest = undefined,
        pos = -1;
      mouse.closestPolygonItem = undefined;
      switch (true) {
        case (mod.mode == 'node'):
          {
            if (mouse.inDrag) { // on ne fait probablement rien
            } else {
              var numNodes = myData.nodes.length;
              for (i = 0; i < numNodes; i++) { // chercher le noeud le plus proche
                myData.nodes[i].hover = false;
                dist = objDist(mouse.x, mouse.y, myData.nodes[i]);
                if (dist[0] < minDist) {
                  minDist = dist[0];
                  posClosest = dist[1];
                  closest = i;
                }
              }
              //console.log('rechercheElementEcran1: ' + 'noeud le plus proche ' + closest);
              if ((closest >= 0) && (minDist <= MIN_DIST)) {
                mouse.closestItem = closest;
                mouse.posClosest = dist[1];
                myData.nodes[closest].hover = true;
                myData.nodes[closest].pos = posClosest; // indique de quoi la souris est la plus proche
                res = mod.mode + " " + (closest + 1);
              } else {
                //console.log("rechercheElementEcran1: mouse is remote, replace " + mouse.closesItem + " by undefined");
                mouse.closestItem = undefined;
                res = "";
              }
            }
            //if (mouse.closestItem != undefined) console.log("rechercheElementEcran1: force " + mouse.closestItem + "." + mouse.posClosest); 
            break;
          }
        default:
          //console.log ("ERROR : " + mod.mode + " is not a recognized mode!");
      }
    }
    return res;
  }
  // onWheel
  function onWheel(evt) {
    if (state <= 0) return; // applet inactif
    if (mouse.down) return; // on distingue rouler et cliquer
    var thisWheel = new Date().getTime();
    if ((thisWheel - mouse.lastWheel) > 250) {
      mouse.lastWheel = thisWheel;
    } else {
      return;
    }
    if (mouse.inScreen1) {
      if (!mouse.disableEvents) evt.preventDefault(); // je ne comprends pas cette ligne, à revoir !!!
      var zf = ZOOM_FACTOR;
      if (evt.deltaY < 0) { // roule vers le haut : zoom-in 
      } else { // roule vers le bas : zoom-out
        zf = 1 / zf;
      }
      var newDx = (getRealX(echelle.pxmax) - echelle.xoff) * zf;
      var newDy = (getRealY(0) - echelle.yoff) * zf;
      var newScale = zf * echelle.scale;
      echelle.xoff = (newScale * echelle.xoff - getRealX(mouse.x) * (newScale - echelle.scale)) / echelle.scale;
      echelle.yoff = (newScale * echelle.yoff - getRealY(mouse.y) * (newScale - echelle.scale)) / echelle.scale;
      echelle.xmax = echelle.xoff + newDx;
      echelle.ymax = echelle.yoff + newDy;
      echelle.scale = newScale;
      var diff = hbar - hmsg;
      myData.xmin = getRealX(wbord);
      myData.xmax = getRealX(wbord + ecran1.width);
      myData.ymin = getRealY(hmsg + ecran1.height + diff);
      myData.ymax = getRealY(hmsg + diff);
      drawAll();
    }
  }
  // returns correct mouse coordinates
  function getMousePos(c, evt) {
    // necessary to take into account CSS boudaries
    var rect = c.getBoundingClientRect();
    return {
      x: Math.round(evt.clientX - rect.left),
      y: Math.round(evt.clientY - rect.top)
    };
  }
  // create a copy of the current nodes (including displacements under way -- mouseMove)
  function getCurrentNodes() {
    var num = myData.nodes.length;
    var n = [];
    var i;
    var dx = mouse.dispX * echelle.scale;
    var dy = -mouse.dispY * echelle.scale;

    var stretchFactor = mouse.stretchFactor;
    var angle = 180 / Math.PI * mouse.deltAngle;
    var num = myData.nodes.length;
    for (i = 0; i < num; i++) {
      n[i] = [];
      n[i].num = myData.nodes[i].num;
      n[i].x = myData.nodes[i].x;
      n[i].y = myData.nodes[i].y;
      n[i].selected = myData.nodes[i].selected;
      n[i].hover = myData.nodes[i].hover;

      if (!mod.passage && (mod.mode == 'node') && ((n[i].selected) || (n[i].hover))) {
        n[i].x += dx;
        n[i].y += dy;
        n[i].selected = false; // jusqu'à ce qu'on ait fait passer toutes les fonctions à utiliser une copie...
        n[i].hover = false; // jusqu'à ce qu'on ait fait passer toutes les fonctions à utiliser une copie...
      }

      //console.log ( n[i].num + " : " + n[i].x + " , " + n[i].y);¨
    }
    return n;
  }

  // draws all screen components                                             DRAW ALL
  function drawAll(obj) {
    var thisDraw = new Date().getTime();
    if (((mouse.inScreen1) && ((thisDraw - lastDraw) > 10)) || !mouse.inScreen1) {
      mouse.lastDrawX = mouse.x;
      mouse.lastDrawY = mouse.y;
      draw();
      drawNodes();
      showMessage();
      showCoordinates();

      lastDraw = thisDraw;
      doRedraw = false;
    }
  }
  // Draw method updates the canvas with the current display
  function draw() {
    // menu bar area
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, hbar);
    ctx.lineTo(0, hbar);
    ctx.closePath();
    setColor(col.toolbar, 0, true);
    ctx.fill();
    // message bar area
    ctx.beginPath();
    ctx.moveTo(0, htot - hmsg);
    ctx.lineTo(w, htot - hmsg);
    ctx.lineTo(w, htot);
    ctx.lineTo(0, htot);
    ctx.closePath();
    setColor(col.statusbar, 0, true);
    ctx.fill();

    // left border
    ctx.beginPath();
    ctx.moveTo(0, hbar);
    ctx.lineTo(wbord, hbar);
    ctx.lineTo(wbord, h - hmsg);
    ctx.lineTo(0, h - hmsg);
    ctx.closePath();
    setColor(col.applet, 0, true);
    ctx.fill();

    // intermediate border
    ctx.beginPath();
    ctx.moveTo(wtot - wbord - wint - e2, hbar);
    ctx.lineTo(wtot - wbord - e2, hbar);
    ctx.lineTo(wtot - wbord - e2, htot - hmsg);
    ctx.lineTo(wtot - wbord - wint - e2, htot - hmsg);
    ctx.closePath();
    setColor(col.separator, 0, true);
    ctx.fill();

    // right border
    ctx.beginPath();
    ctx.moveTo(wtot - wbord, hbar);
    ctx.lineTo(wtot, hbar);
    ctx.lineTo(wtot, htot - hmsg);
    ctx.lineTo(wtot - wbord, htot - hmsg);
    ctx.closePath();
    setColor(col.applet, 0, true);
    ctx.fill();

    // outline
    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(w - 1, 1);
    ctx.lineTo(w - 1, h - 1);
    ctx.lineTo(1, h - 1);
    ctx.closePath();
    setColor(col.screen, 1, false);
    ctx.stroke();

    // inside of left screen
    ctx.beginPath();
    ctx.moveTo(wbord + 1, hbar + 1);
    ctx.lineTo(wtot - wbord - e2 - wint - 1, hbar + 1);
    ctx.lineTo(wtot - wbord - e2 - wint - 1, htot - hmsg - 1);
    ctx.lineTo(wbord + 1, htot - hmsg - 1);
    ctx.closePath();
    setColor(col.screen, 0, true);
    ctx.fill();
    //drawBackground()

    // inside of right screen
    ctx.beginPath();
    ctx.moveTo(wtot - wbord - e2 + 2, hbar + 2);
    ctx.lineTo(wtot - wbord - 2, hbar + 2);
    ctx.lineTo(wtot - wbord - 2, htot - hmsg - 2);
    ctx.lineTo(wtot - wbord - e2 + 2, htot - hmsg - 2);
    ctx.closePath();
    setColor(col.screen2, 0, true);
    ctx.fill();
    // outline of left screen
    ctx.beginPath();
    ctx.moveTo(wbord, hbar);
    ctx.lineTo(wtot - wbord - e2 - wint, hbar);
    ctx.lineTo(wtot - wbord - e2 - wint, htot - hmsg);
    ctx.lineTo(wbord, htot - hmsg);
    ctx.closePath();
    //ctx.strokeStyle = "red";

    ctx.stroke();

    // outline of right screen
    ctx.beginPath();
    ctx.moveTo(wtot - wbord - e2 + 1, hbar + 1);
    ctx.lineTo(wtot - wbord - 1, hbar + 1);
    ctx.lineTo(wtot - wbord - 1, htot - hmsg - 1);
    ctx.lineTo(wtot - wbord - e2 + 1, htot - hmsg - 1);
    ctx.closePath();
    setColor(col.screen, 1, true);
    ctx.stroke();

    // limits of extents
    //console.log("x : " + getScreenX(myData.xmin) + " à " + getScreenX(myData.xmax) + " y :" + getScreenY(myData.ymin) + " à " + getScreenY(myData.ymax));
    ctx.beginPath();
    ctx.moveTo(getScreenX(myData.xmin), getScreenY(myData.ymin));
    ctx.lineTo(getScreenX(myData.xmax), getScreenY(myData.ymin));
    ctx.lineTo(getScreenX(myData.xmax), getScreenY(myData.ymax));
    ctx.lineTo(getScreenX(myData.xmin), getScreenY(myData.ymax));
    ctx.closePath();
    ctx.strokeStyle = "red";
    //ctx.stroke();

    ctx.restore();
  }


  // draw nodes
  function drawNodes() {
    var i;
    if ((myData.nodes == undefined) || (myData.nodes == []))
      return;
    var numNodes = myData.nodes.length;
    var px, py;
    ctx.save();
    ctx.beginPath();
    ctx.rect(wbord + 1, hbar + 1, ecran1.width, ecran1.height);
    ctx.clip();
    if (numNodes > 0) {
      for (i = 0; i < numNodes; i++) {
        px = getScreenX(myData.nodes[i].x);
        py = getScreenY(myData.nodes[i].y);
        if (mouse.inDrag && myData.nodes[i].hover && mod.mode == 'node') {
          px += mouse.x - mouse.startX;
          py += mouse.y - mouse.startY;
        }
        var colNode = col.node.split(',');
        var coulFond = colNode[1];
        if (myData.nodes[i].hover && mod.mode == 'node') coulFond = colNode[2];
        if (myData.nodes[i].selected && mod.mode == 'node') coulFond = colNode[3];
        //console.log("drawSupports: " + col.support[1] + ", " + coulFond);
        drawNode(px, py, colNode[0], coulFond, 0);
        if (mod.numbers) {
          drawText(px + 1.3 * 4, py - 1.3 * 4, (i + 1));
        }
      }
    }
    ctx.restore();
  }

  // draw a node
  function drawNode(px, py, couleur, couleurFond, type) {

    var ax = [];
    var ay = [];
    var i;
    var taille = 4; // en fait demi-taille du noeud

    ctx.save();

    ax[0] = px + taille;
    ay[0] = py + taille;
    ax[1] = px + taille;
    ay[1] = py - taille;
    ax[2] = px - taille;
    ay[2] = py - taille;
    ax[3] = px - taille;
    ay[3] = py + taille;
    ax[4] = ax[0];
    ay[4] = ay[0];

    //ctx.fillStyle = couleurFond;
    //ctx.strokeStyle = couleur;
    ctx.beginPath();
    ctx.moveTo(ax[0], ay[0]);
    ctx.lineTo(ax[1], ay[1]);
    ctx.lineTo(ax[2], ay[2]);
    ctx.lineTo(ax[3], ay[3]);
    ctx.lineTo(ax[4], ay[4]);
    setColor(couleurFond, 0, true);
    ctx.fill();
    setColor(couleur, 0, false);
    ctx.stroke();

    ctx.restore();
  }
  // draws a text
  function drawText(px, py, s) {
    ctx.save();
    ctx.font = "12px Arial";
    ctx.fillText(s, px, py);
    ctx.restore();
  }


  // move selected nodes
  function moveNodes(px, py) {
    var i;
    var dx = px * echelle.scale;
    var dy = -py * echelle.scale;
    var num = myData.nodes.length;
    for (i = 0; i < num; i++) {
      if (myData.nodes[i].selected) {
        myData.nodes[i].x += dx;
        myData.nodes[i].y += dy;
      }
    }
  }


  // distance to object (mesurée en pixels écran)
  function objDist(mx, my, O) {
    var minDist = 100000; // devrait être plus petit !
    var pos;
    O.hover = false;
    var px = getScreenX(O.x);
    var py = getScreenY(O.y);
    var minDist = Math.sqrt((mx - px) * (mx - px) + (my - py) * (my - py));
    pos = 1;
    return [Math.round(minDist), pos];
  }


  // creates output file
  function outData() {
    var s, d;
    var sep = ","
    d = new Date();
    s = '** Data file generated on ' + d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear() + " at " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "\n";
    s += "**i-Mesh\n";
    s += "*VERSION," + version + "\n";
    //console.log("myData.backImage = "  + myData.backImage);
    if (myData.backImage != undefined) {
      s += '*BACKIMAGE,' + myData.backImage + sep + arrondi(myData.back_xmin) + sep + arrondi(myData.back_xmax) + sep + arrondi(myData.back_ymin) + sep + arrondi(myData.back_ymax) + sep
      if (mod.backimage)
        s += "ON\n";
      else
        s += "OFF\n";
    }
    // OB/28.2.2016 : le +4 pour les coordonnées y n'est pas propre. Il faudrait comprendre d'où il provient... en rapport avec hbar en tout cas
    var diff = hbar - hmsg;
    s += '*EXTENTS' + sep + arrondi(getRealX(wbord)) + sep + arrondi(getRealX(wbord + ecran1.width)) + sep + arrondi(getRealY(hmsg + ecran1.height + diff)) + sep + arrondi(getRealY(hmsg + diff)) + "\n";
    if ((myData.supports != null) && (myData.supports.length > 0)) {
      s += "*SUPPORTS\n";
      for (var i = 0; i < myData.supports.length; i++)
        s += arrondi(myData.supports[i].x) + sep + arrondi(myData.supports[i].y) + sep + 'ux=0;uy=0' + sep + myData.supports[i].attrib + sep + "\n"
    }
    if ((myData.echelleForces != null) && (myData.echelleForces))
      s += '*ECHELLEFORCES' + sep + arrondi(myData.echelleForces) + "\n";
    if ((myData.forces != null) && (myData.forces.length > 0)) {
      s += "*FORCES\n";
      for (i = 0; i < myData.forces.length; i++)
        if (!isNaN(myData.forces[i].Fx + myData.forces[i].Fy))
          s += arrondi(myData.forces[i].x) + sep + arrondi(myData.forces[i].y) + sep + arrondi(myData.forces[i].Fx) + sep + arrondi(myData.forces[i].Fy) + sep + "\n"
    }
    if (mod.resultant)
      s += '*RESULTANT' + sep + 'ON' + "\n";
    if (mod.showEp)
      s += '*SHOWEP' + sep + 'ON' + "\n";
    if (myData.resmat != undefined)
      s += '*RESMAT' + sep + arrondi(myData.resmat) + "\n";
    if (myData.epaisseur != undefined)
      s += '*EPAISSEUR' + sep + arrondi(myData.epaisseur) + "\n";
    if (myData.subsystem != undefined) {
      s += "*SUBSYSTEM\n";
      for (i = 0; i < myData.subsystem.length; i++)
        s += arrondi(myData.subsystem[i].x) + sep + arrondi(myData.subsystem[i].y) + sep;
      s += "\n";
    }
    if ((myData.compressionLine != null) && (myData.compressionLine.length > 0)) {
      s += "*COMPRESSIONLINE\n";
      for (i = 0; i < myData.compressionLine.length; i++) {
        var tmp = myData.compressionLine[i].x1 + myData.compressionLine[i].y1 + myData.compressionLine[i].x2 + myData.compressionLine[i].y2;
        if (!isNaN(tmp))
          s += arrondi(myData.compressionLine[i].x1) + sep + arrondi(myData.compressionLine[i].y1) + sep + arrondi(myData.compressionLine[i].x2) + sep + arrondi(myData.compressionLine[i].y2) + sep + "\n";
      }
    }
    if ((myData.tensionLine != null) && (myData.tensionLine.length > 0)) {
      s += "*TENSIONLINE\n";
      for (i = 0; i < myData.tensionLine.length; i++) {
        var tmp = myData.tensionLine[i].x1 + myData.tensionLine[i].y1 + myData.tensionLine[i].x2 + myData.tensionLine[i].y2;
        if (!isNaN(tmp))
          s += arrondi(myData.tensionLine[i].x1) + sep + arrondi(myData.tensionLine[i].y1) + sep + arrondi(myData.tensionLine[i].x2) + sep + arrondi(myData.tensionLine[i].y2) + sep + "\n";
      }
    }
    if ((myData.polygon != undefined) && mod.polygon) {
      s += "*POLYGON" + sep + myData.modeConstruction + sep + sep + arrondi(myData.angle_0) + sep + arrondi(myData.angle_1) + sep + arrondi(myData.passageX) + sep + arrondi(myData.passageY) + sep + arrondi(myData.lTot) + sep + "\n";
      if (myData.funicular != undefined) {
        //console.log("effort dans tie / strut " + arrondi(myData.funicular[numForces + 1].effort));
        var last = myData.forces.length;
        if (myData.supports[1].attrib != 0) last++;
        s += "*FUNICULAR\n";
        for (i = 0; i <= last; i++) {
          if (myData.funicular[i] != undefined) {
            s += arrondi(myData.funicular[i].x1) + sep + arrondi(myData.funicular[i].y1) + sep + arrondi(myData.funicular[i].x2) + sep + arrondi(myData.funicular[i].y2) + sep + arrondi(myData.funicular[i].effort) + sep + sep;
            if (i < last) s += "\n";
          }
        }
      }
    }
    s += "\n*END";
    var goOn = true;
    while (goOn) {
      s = s.replace("\n\n", "\n");
      if (s.indexOf("\n\n") == -1)
        goOn = false;
    }
    return s;
  }
  // set or unsets options

  // shows current mouse coordinates on the right of the message bar
  function showMessage() {
    ctx.save();
    // message bar area
    ctx.beginPath();
    ctx.moveTo(wbord, htot - hmsg + 3);
    ctx.lineTo(wtot - 15 - wCoo, htot - hmsg + 3);
    ctx.lineTo(wtot - 15 - wCoo, htot - 5);
    ctx.lineTo(wbord, htot - 5);
    ctx.closePath();
    //console.log((wtot - 10 - wCoo) + ", " +  (htot -  1));
    if (inputChanged)
      setColor(col.statusbar, 2, true);
    else
      setColor(col.statusbar, 0, true);
    setColor(col.statusbar, 1, false);
    //   ctx.fillStyle = 'yellow';
    ctx.fill();
    //   ctx.strokeStyle = 'green';
    ctx.stroke();
    if (curMessage === undefined)
      return;
    ctx.font = '10pt Arial';
    ctx.align = 'LEFT';
    setColor(col.statusinput, 1, true);
    ctx.fillText(curMessage, wbord + 8, htot - hmsg / 2 + 3);
    ctx.restore();
  }
  // shows current mouse coordinates on the right of the message bar
  function showCoordinates(what) {
    ctx.save();
    // message bar area
    ctx.beginPath();
    ctx.moveTo(wtot - wbord - wCoo - 3, htot - hmsg + 3);
    ctx.lineTo(wtot - wbord, htot - hmsg + 3);
    ctx.lineTo(wtot - wbord, htot - 5);
    ctx.lineTo(wtot - wbord - wCoo - 3, htot - 5);
    ctx.closePath();
    setColor(col.statusbar, 9, true);
    ctx.fill();
    setColor(col.statusbar, 1, false);
    ctx.stroke();
    ctx.font = '8pt Arial';
    setColor(col.statusbar, 1, true);
    switch (true) {
      case (what == 'paintCount'):
        {
          message = numPaint.n;
          break;
        }
      case (what == 'mousepos'):
        {
          message = mouse.pos;
          break;
        }
      default:
        {
          if (mouse.inScreen1)
            var message = arrondi(getRealX(mouse.x), 3) + ',' + arrondi(getRealY(mouse.y), 3);
          else
            var message = mouse.x + ',' + mouse.y;
          break;
        }
    }
    ctx.fillText(message, wtot - wbord - wCoo + (wCoo - ctx.measureText(message).width) / 2, htot - hmsg / 2 + 4);
    ctx.restore();
  }
  // defines the scaling between screen and real world
  function computeScale(xmin, xmax, ymin, ymax, pxmin, pxmax, pymin, pymax) {
    var echelle = [];
    echelle.xoff = xmin;
    echelle.xmax = xmax;
    echelle.yoff = ymin;
    echelle.ymax = ymax;
    echelle.pxoff = pxmin;
    echelle.pyoff = pymax - pymin;
    echelle.pymax = pymax;
    echelle.pymax = pymax;
    echelle.pxmax = pxmax;
    //console.log ('computeScale: " +xmin + "," + ymin + " " + xmax + "," + ymax + " -- " + pxmin + "," + pymin + " " + pxmax + "," + pymax);
    var scalex = (xmax - xmin) / (pxmax - pxmin);
    var scaley = (ymax - ymin) / echelle.pyoff;
    //console.log (scalex + " " + scaley);
    if (scalex > scaley) {
      echelle.scale = scalex;
      echelle.yoff -= (echelle.pyoff * echelle.scale - (ymax - ymin)) / 2;
    } else {
      echelle.scale = scaley;
      echelle.xoff -= ((pxmax - pxmin) * echelle.scale - (xmax - xmin)) / 2;
      //console.log(echelle.xoff);
    }
    return echelle;
  }
  // get screen x-coordinate from real location
  function getScreenX(x, ech) {
    if (ech == undefined) ech = echelle;
    return Math.round(((x - ech.xoff) / ech.scale) + ech.pxoff);
  }
  // get screen y-coordinate from real location
  function getScreenY(y, ech) {
    if (ech == undefined) ech = echelle;
    return Math.round(ech.pymax - (y - ech.yoff) / ech.scale);
  }
  // get real-world x-coordinate from screen location
  function getRealX(px, ech) {
    if (ech == undefined) ech = echelle;
    var val = (px - ech.pxoff) * ech.scale + ech.xoff;
    //val = arrondi(val,digitsGeom )
    return val;
  }
  // get real-world y-coordinate from screen location
  function getRealY(py, ech) {
    if (ech == undefined) ech = echelle;
    var val = (ech.pymax - py) * ech.scale + ech.yoff,
      digitsGeom;
    return val;
  }
  // round of to a prescribed number of significant digits
  function arrondi(x, digits) {
    if (digits == undefined) digits = 3;
    //if (isNaN(x)) return NaN;
    //if (x == '') return NaN;
    //var mult = Math.pow(10, digits);
    //console.log(x + ", " + digits + ", " + mult + " --> " + Math.round(x * mult) + " " + (x * mult) / mult);
    //return Math.round(x * mult) / mult;
    return formatEng(x, digits + 1);
  }
  // formats a number in flexible manner, with a given number of significant digits
  function formatEng(x, digits) {

    if (x == 0) return '0';
    if (x >= 0) {
      var sign = 1;
      var res = "";
    } else {
      var sign = -1;
      var res = "-";
    }
    var exp = Math.floor(Math.log(Math.abs(x)) / Math.LN10);
    var mant = Math.round(sign * x / Math.pow(10, (exp - digits + 1))) / Math.pow(10, digits - 1);
    //console.log (mant.toFixed(3) + "e" + exp);

    if ((exp >= -1) && (exp < digits)) { // afichage "normal" --> tout est OK ici
      res += trimZeroes((mant * Math.pow(10, exp)).toFixed(digits - exp - 1));
    } else {
      var modu = Math.abs(exp) % 3;
      if (exp > 0) { // nombres trop grands pour l'affichage normal --> tout est OK ici
        var tmp = digits - modu - 1;
        if (tmp < 0) tmp = 0;
        res += trimZeroes((mant * Math.pow(10, modu)).toFixed(tmp)) + "e" + (exp - modu);
      } else {
        var tmp = digits - modu;
        if (tmp < 0) tmp = 0;
        var fact = 3 - modu;
        if (fact == 3) fact = 0;
        tmp = digits - fact - 1;
        if (tmp < 0) tmp = 0;
        //console.log(" modu = " + modu + " fact " + fact + " tmp " + tmp);
        res += trimZeroes((mant * Math.pow(10, fact)).toFixed(tmp)) + "e" + (exp - fact); // + " modu = " + modu + " fact " + fact + " tmp " + tmp;
      }
    }
    return res;
  }
  // removes trailing zeros after decimal point in number string. Also removes the decimal point if unnecessary
  function trimZeroes(s) {
    var i = s.length - 1;
    if (s.indexOf('.') == -1) return s; // pas de point décimal
    while (s.charAt(i) == '0')
      i--;
    if (s.charAt(i) == '.')
      i--;
    //var t = s.slice(0,i+1);
    //console.log("trimZeroes: " + s + " --> " + t);
    return s.slice(0, i + 1);
  }
  // returns the angle of a vector
  function atanYX(x, y) {
    var val = 0;
    if (Math.abs(x) < minDouble) { // quasi vertical
      if (y > 0) val = Math.PI / 2;
      else val = -Math.PI / 2;
    } else {
      if (x < 0) {
        if (y >= 0)
          val = Math.PI / 2 + Math.atan(-x / y);
        else val = -Math.PI / 2 - Math.atan(x / y);
      } else
      if (y >= 0) val = Math.atan(y / x);
      else val = -Math.atan(-y / x);
    }
    return val;
  }
  // intersection de deux lignes d'action
  function intersection(x1, y1, f1, x2, y2, f2) {
    // retourne le paramètre "k" localisant le point d'intersection
    // de deux droites définies chacune par un point et un vecteur (force)
    var det = (-f1.Fx * f2.Fy + f2.Fx * f1.Fy);
    var k;
    if (Math.abs(det) >= 1.0E-10)
      k = ((x1 - x2) * f2.Fy - (y1 - y2) * f2.Fx) / det;
    if (debug) {
      var inter = [];
      inter.x = x1 + k * f1.Fx;
      inter.y = y1 + k * f1.Fy;
      console.log("intersection à (" + arrondi(inter.x) + "," + arrondi(inter.y) + ") k = " + arrondi(k) + " " + arrondi(x1) + "," + arrondi(y1) + " [" + arrondi(f1.Fx) + "," + arrondi(f1.Fy) + "] " + arrondi(x2) + "," + arrondi(y2) + " [" + arrondi(f2.Fx) + "," + arrondi(f2.Fy) + "]");
    }
    // k est 'undefined' si le déterminant est nul
    return k;
  }
  // sets the drawing color and transparency
  function setColor(couleur, index, doFill, alpha) {
    var tmp = couleur;
    if (couleur.indexOf(",") < 0) {
      tmp = couleur;
    } else {
      var coulMat = couleur.split(',');
      tmp = coulMat[0];
    }
    //console.log("setColor: color is '" + tmp + "'");
    if (tmp == undefined) {
      tmp = 'lightgreen';
      console.log('request for undefined color');
      console.trace();
    }
    if (doFill == undefined)
      doFill = false;
    var pos = tmp.indexOf(";");
    if (pos < 0) {
      if (alpha != undefined) ctx.globalAlpha = alpha;
      if (doFill)
        ctx.fillStyle = tmp;
      else
        ctx.strokeStyle = tmp;
    } else {
      var vals = tmp.split(";");
      if (vals.length == 2) { // nom de couleur + transparence
        if (alpha == undefined) alpha = 1 * vals[1]; // la valeur d'alpha du fichier n'est valable que si elle n'a pas été spécifiée lors de l'appel)
        if (doFill)
          ctx.fillStyle = vals[0];
        else
          ctx.strokeStyle = vals[0];
        ctx.globalAlpha = alpha;
      } else {
        tmp = "rgb(" + vals[0] + "," + vals[1] + "," + vals[2] + ")";
        // paramètres de couleur RGB
        if (doFill)
          ctx.fillStyle = tmp;
        else
          ctx.strokeStyle = tmp;
        if (vals.length == 4) { // RGB + transparence
          if (alpha)
            ctx.globalAlpha = alpha;
          else
            ctx.globalAlpha = vals[3];
        }
      }
    }
  }

  // Public properties and methods of the iMini object

  this.width = 300;
  this.height = 150;
  //this.maxValue;
  this.margin = 5;

  // initialize the iMini object
  this.initialize = function () {

    init();
    xbarmin = wtot - wbord - e2 - wint;
    xbarmax = xbarmin + wint;

    myData.xmin = 0;
    myData.xmax = 100;
    myData.ymin = 0;
    myData.ymax = 20;
    echelle = computeScale(myData.xmin, myData.xmax, myData.ymin, myData.ymax, wbord, wbord + ecran1.width, hbar, hbar + ecran1.height);
    ecran1.realXmin = getRealX(wbord);
    ecran1.realXmax = getRealX(wbord + ecran1.width);
    ecran1.realYmax = getRealY(hbar); // min et max sont inversés car l'axe y de l'écran est dans l'autre sens
    ecran1.realYmin = getRealY(hbar + ecran1.height);

    //couleurs    
    col.applet = 'LightGray';
    col.screen = 'White,Black';
    col.screen2 = 'Gray,Black';
    col.separator = 'LightGray';
    col.toolbar = 'LightGray,Black';
    col.statusbar = 'LightGray,Gray,Yellow';
    col.statusinput = 'LightGray,Black';
    col.node = 'black,white,magenta,red,green';
  }
  // update method paint all screen components
  this.update = function () {
    drawAll('update');
  }
  // set active mode
  this.setMod = function (mode) {
    mod.mode = mode;
  }
  // set numbering
  this.setNumbers = function (num) {
    mod.numbers = num;
  }
}