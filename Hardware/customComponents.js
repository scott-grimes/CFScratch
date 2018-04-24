!function($s) {

  'use strict';
  //var decls
  var $ = $s.$;
  // red/black
  var defaultLEDColor = '#ff0000';
  var defaultLEDBgColor = '#000000';
  var onValue = 1;
  var offValue = null;
  var isHot = function(v) { return v != null; };
  var intValue = function(v) { return isHot(v)? 1 : 0; };
  var isOn = function(v) { return isHot(v)? true : false; };

  // unit size
  var unit = $s.unit;
    var multiplyColor = function() {
    var HEX = '0123456789abcdef';
    var toIColor = function(sColor) {
      if (!sColor) {
        return 0;
      }
      sColor = sColor.toLowerCase();
      if (sColor.match(/^#[0-9a-f]{3}$/i) ) {
        var iColor = 0;
        for (var i = 0; i < 6; i += 1) {
          iColor = (iColor << 4) | HEX.indexOf(sColor.charAt( (i >> 1) + 1) );
        }
        return iColor;
      } else if (sColor.match(/^#[0-9a-f]{6}$/i) ) {
        var iColor = 0;
        for (var i = 0; i < 6; i += 1) {
          iColor = (iColor << 4) | HEX.indexOf(sColor.charAt(i + 1) );
        }
        return iColor;
      }
      return 0;
    };
    var toSColor = function(iColor) {
      var sColor = '#';
      for (var i = 0; i < 6; i += 1) {
        sColor += HEX.charAt( (iColor >>> (5 - i) * 4) & 0x0f);
      }
      return sColor;
    };
    var toRGB = function(iColor) {
      return {
        r: (iColor >>> 16) & 0xff,
        g: (iColor >>> 8) & 0xff,
        b: iColor & 0xff};
    };
    var multiplyColor = function(iColor1, iColor2, ratio) {
      var c1 = toRGB(iColor1);
      var c2 = toRGB(iColor2);
      var mc = function(v1, v2, ratio) {
        return ~~Math.max(0, Math.min( (v1 - v2) * ratio + v2, 255) );
      };
      return (mc(c1.r, c2.r, ratio) << 16) |
        (mc(c1.g, c2.g, ratio) << 8) | mc(c1.b, c2.b, ratio);
    };
    return function(color1, color2, ratio) {
      return toSColor(multiplyColor(
          toIColor(color1), toIColor(color2), ratio) );
    };
  }();

  // one-bit output as an LED with a value attribute 
  $s.registerDevice('SINGLEOUTPUT', function(device) {
    var in1 = device.addInput();
      device.deviceDef.state = {'on':isOn(in1.getValue() )};
    var super_createUI = device.createUI;
    device.createUI = function() {
      super_createUI();
      var hiColor = device.deviceDef.color || defaultLEDColor;
      var bgColor = device.deviceDef.bgColor || defaultLEDBgColor;
      device.deviceDef.state = {'on':isOn(in1.getValue() )};
      var loColor = multiplyColor(hiColor, bgColor, 0.25);
      var bLoColor = multiplyColor(hiColor, bgColor, 0.2);
      var bHiColor = multiplyColor(hiColor, bgColor, 0.8);
      var size = device.getSize();
      var $ledbase = $s.createSVGElement('circle').
        attr({cx: size.width / 2, cy: size.height / 2, r: size.width / 4}).
        attr('stroke', 'none').
        attr('fill', bLoColor);
      device.$ui.append($ledbase);
      var $led = $s.createSVGElement('circle').
        attr({cx: size.width / 2, cy: size.height / 2, r: size.width / 4 * 0.8}).
        attr('stroke', 'none').
        attr('fill', loColor);
      device.$ui.append($led);
      device.$ui.on('inputValueChange', function() {
        $ledbase.attr('fill', isHot(in1.getValue() )? bHiColor : bLoColor);
        $led.attr('fill', isHot(in1.getValue() )? hiColor : loColor);
        device.deviceDef.state = {'on':isOn(in1.getValue() )};
      });
      device.doc = {
        params: [
          {name: 'color', type: 'string',
            defaultValue: defaultLEDColor,
            description: 'color in hexadecimal.'},
          {name: 'bgColor', type: 'string',
            defaultValue: defaultLEDBgColor,
            description: 'background color in hexadecimal.'}
        ],
        code: '{"type":"' + device.deviceDef.type +
        '","color":"' + defaultLEDColor + '"}'
      };
        
    };
  });

  // multi-bit Input with clickable custom value attribute
  $s.registerDevice('CUSTOMBUSOUT', function(device) {
    var numInputs = Math.max(2, device.deviceDef.numInputs || 16);

    var bin2dec = function(bin){
      return parseInt(bin, 2);
    }
    var dec2bin = function(int) {
      var u = new Uint32Array(1);
      var nbit = 16;
      u[0] = int;
      int = Math.pow(2, 16) - 1;
      var converted = u[0] & int;
      converted.toString(2);
      return converted.toString(2).padStart(16,"0")
    }

    
    device.halfPitch = true;
    device.deviceDef['isBus'] = true;

    if(!device.deviceDef['numInputs']){
      device.deviceDef['numInputs'] = numInputs;
    }

    //if we have a 16 bit bus, allow signed numbers. otherwise use unsigned
    var max = Math.pow(2,numInputs)-1;
    var min = 0;
    //if no value is defined, use 0
    if(! device.deviceDef['value'])
        device.deviceDef['value']= 0;

    //takes an integer and makes sure it fits within the required bits of our bus
    var parseIntVal = function(value){
      //if value is too big for number of bits, set to max possible value
      if(value>max){
        value = max;
      }

      //if a device is a 16bit bus, we allow 2's compliment negative numbers to be defined. they are stored as uints
      if(device.deviceDef['isBus'] && device.deviceDef.numInputs === 16){
        //device can allow signed values
        if( value < 0)
          value = bin2dec( dec2bin( value ) )

      }

      if( value < min )
        value = min;
      return value;
    }

    device.deviceDef['value'] = parseIntVal( device.deviceDef['value'] );

    /*a pop-up box which is used to edit the value of the device */
    var editablebox = function () {
      /*
      if(dest) {
          dest.setAttribute('display', 'none');
      }*/
      var svg = document.getElementsByTagName('svg')[0];
      var myforeign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
      var textdiv = document.createElement("div");
      var text = device.deviceDef['value'];


      var textnode = document.createTextNode(text);
      textdiv.appendChild(textnode);
      textdiv.setAttribute("contentEditable", "true");
      textdiv.setAttribute("width", "auto");
      myforeign.setAttribute("width", "100%");
      myforeign.setAttribute("height", "100%");
      myforeign.classList.add("foreign"); //to make div fit text
      textdiv.classList.add("insideforeign"); //to make div fit text
      
      myforeign.setAttributeNS(null, "transform", "translate(" + device.deviceDef.x + " " + device.deviceDef.y + ")");
      svg.appendChild(myforeign);
      
      myforeign.appendChild(textdiv);
        
      var range = document.createRange();
      range.selectNodeContents(textdiv);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      
      function accept() {
          
          if(textdiv.innerText.length) {
                  //dest.childNodes[0].nodeValue = textdiv.innerText;
                  //dest.setAttribute('display', 'inline-block')
                  var tval = textdiv.innerText;
                  tval = parseInt(tval);
                  //make sure the number the user entered is valid!
                  if(tval!==null && tval!== undefined){
                      tval = parseIntVal(tval)
                      device.deviceDef['value'] = tval;
                      device.$ui.trigger('inputValueChange');
                  }
                  
              }
          
          textdiv.onblur = null;
          myforeign.remove()
          
      }
      function cancel() {
          textdiv.onblur = null;
          myforeign.remove()
      }
      
      textdiv.onkeydown = function(event) {
          if(event.keyCode===13) {
              accept();
          } else if(event.keyCode===27) {
              cancel();
          }
      }
      textdiv.onblur = cancel;

      textdiv.focus();
    }

    

    var $textInput = $s.createSVGElement('text');

    var pushBusValue = function(){
      var busValue = [];
      
      let binvalue = dec2bin(device.deviceDef['value']);
      
      let start = binvalue.length-1;
      let end = start-numInputs;
      for (var i = start; i > end ; i -= 1) {
        let value = binvalue.charAt(i);

        busValue.push( value==='1' ? 1 : null );
      }
      
      device.getOutputs()[0].setValue(
          busValue);
      var tval = device.deviceDef['value'];
      if(numInputs === 16 && tval> 32767){
          tval = tval-Math.pow(2,16);
        }
      $textInput.text( tval )
      
    }

    device.addOutput('', 'x' + numInputs);
    pushBusValue();
    
    device.$ui.on('inputValueChange', function() {
      pushBusValue();
    });
    var super_createUI = device.createUI;
    device.createUI = function() {
      super_createUI();
      var size = device.getSize();
        var w = size.width;
        var h = size.height;
        var tval = device.deviceDef['value'];
        //display signed 2-s complement number if we have 16bits for this bus,
                    //otherwise just display the unsigned value
        if(numInputs === 16 && tval>32767){
          tval = tval-Math.pow(2,16);
        }
          $textInput.
          text(tval).
          css('font-size', 12 + 'px').
          attr('class', 'simcir-device-label').
          attr({x: w / 2, y: h/2 });
          
        device.$ui.append($textInput);

        var button_mouseDownHandler = function(event) {
          event.preventDefault();
          event.stopPropagation();
          
          editablebox();
          //$(document).on('mouseup', button_mouseUpHandler);
          //$(document).on('touchend', button_mouseUpHandler);
        };
          
        
          
        device.$ui.on('deviceAdd', function() {
          $s.enableEvents($textInput, true);
          $textInput.on('mousedown', button_mouseDownHandler);
          $textInput.on('touchstart', button_mouseDownHandler);
        });
        device.$ui.on('deviceRemove', function() {
          $s.enableEvents($textInput, false);
          $textDisplay.off('mousedown', button_mouseDownHandler);
          $textDisplay.off('touchstart', button_mouseDownHandler);
        });

      device.doc = {
        params: [
          {name: 'numInputs', type: 'number', defaultValue: 16,
            description: 'number of inputs.'}
        ],
        code: '{"type":"' + device.deviceDef.type + '","numInputs":8}'
      };
    };
  });

  // clickable single bit input with toggled LED
  var createCustomInputFactory = function(type) {
    return function(device) {
      var out1 = device.addOutput();
      var on = false;
      if(device.deviceDef.state){
          on = device.deviceDef.state.on;
      }
      
      
      device.getState = function() {
        return type == 'Toggle'? { on : on } : null;
      };

      /*device.$ui.on('inputValueChange', function() {
        if (on) {
          out1.setValue(in1.getValue() );
        }
      });
      */
      var updateOutput = function() {
        out1.setValue(on ? on : null);
      };
      updateOutput();

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        var $button = $s.createSVGElement('rect').
          attr({x: size.width / 4, y: size.height / 4,
            width: size.width / 2, height: size.height / 2,
            rx: 2, ry: 2});
        $button.addClass('simcir-basicset-switch-button');
        if (on) {
          $button.addClass('simcir-basicset-switch-button-pressed');
        }
        device.$ui.append($button);
          
        var button_mouseDownHandler = function(event) {
          event.preventDefault();
          event.stopPropagation();
          on = !on;
          $button.addClass('simcir-basicset-switch-button-pressed');
            
          updateOutput();
          $(document).on('mouseup', button_mouseUpHandler);
          $(document).on('touchend', button_mouseUpHandler);
        };
          
        var button_mouseUpHandler = function(event) {
            if (!on) {
              $button.removeClass('simcir-basicset-switch-button-pressed');
            }
          
          updateOutput();
          $(document).off('mouseup', button_mouseUpHandler);
          $(document).off('touchend', button_mouseUpHandler);
        };
          
        device.$ui.on('deviceAdd', function() {
          $s.enableEvents($button, true);
          $button.on('mousedown', button_mouseDownHandler);
          $button.on('touchstart', button_mouseDownHandler);
        });
        device.$ui.on('deviceRemove', function() {
          $s.enableEvents($button, false);
          $button.off('mousedown', button_mouseDownHandler);
          $button.off('touchstart', button_mouseDownHandler);
        });
        device.$ui.addClass('simcir-basicset-switch');
      };
    };
  };
  $s.registerDevice('SINGLEINPUT', createCustomInputFactory('Toggle') );

  // multi-bit Output 
  $s.registerDevice('CUSTOMBUSIN', function(device) {

    var numOutputs = Math.max(2, device.deviceDef.numOutputs || 16);
    device.halfPitch = true;
    device.deviceDef['isBus'] = true;
    device.deviceDef['value']= 0;
    device.addInput('', 'x' + numOutputs);

    if(!device.deviceDef['numOutputs']){
      device.deviceDef['numOutputs'] = numOutputs;
    }

    var $textDisplay = $s.createSVGElement('text');

    device.$ui.on('inputValueChange', function() {
      var busValue = device.getInputs()[0].getValue();
        device.deviceDef['value'] = 0;
      if(busValue!= null && typeof busValue == 'object'){
        let pow = 0;
        let sum = 0;
        for(let i = 0;i<busValue.length;i++){
          if(busValue[i]===1){
            sum+=Math.pow(2,pow)
          }
          else if (busValue[i]===null){

          }
          else{ throw('bus not build correctly')}
          pow+=1;
        }
         if(numOutputs === 16 && sum> 32767){
          sum = sum-Math.pow(2,16);
        }

      device.deviceDef['value'] = sum;
      }
      
      $textDisplay.text(device.deviceDef['value'])   
      
    });

    var super_createUI = device.createUI;
    device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        var w = size.width;
        var h = size.height;
        var tval = device.deviceDef['value'];
          if(numOutputs === 16 && tval> 32767){
          tval = tval-Math.pow(2,16);
        }
          $textDisplay.
          text(tval).
          css('font-size', 12 + 'px').
          attr('class', 'simcir-device-label').
          attr('editable',true).
          attr({x: w / 2, y: h/2 });
          
          device.$ui.append($textDisplay);
        device.doc = {
        params: [
          {name: 'numOutputs', type: 'number', defaultValue: 16,
            description: 'number of outputs.'}
        ],
        code: '{"type":"' + device.deviceDef.type + '","numOutputs":8}'
      };
    }
    
    
      
    });

let muxdata = {
  "width":600,
  "height":400,
  "showToolbox":false,
  "devices":[
    {"type":"NOT","id":"dev0","x":150,"y":250,"label":"NOT"},
    {"type":"AND","id":"dev1","x":150,"y":150,"label":"AND"},
    {"type":"OR","id":"dev2","x":250,"y":150,"label":"OR"},
    {"type":"AND","id":"dev3","x":200,"y":50,"label":"AND"},
    {"type":"Out","id":"dev4","x":344,"y":144,"label":"OUT"},
    {"type":"In","id":"dev5","x":48,"y":56,"label":"A"},
    {"type":"In","id":"dev6","x":40,"y":160,"label":"B"},
    {"type":"In","id":"dev7","x":48,"y":256,"label":"SEL"}
  ],
  "connectors":[
    {"from":"dev0.in0","to":"dev7.out0"},
    {"from":"dev1.in0","to":"dev6.out0"},
    {"from":"dev1.in1","to":"dev7.out0"},
    {"from":"dev2.in0","to":"dev3.out0"},
    {"from":"dev2.in1","to":"dev1.out0"},
    {"from":"dev3.in0","to":"dev5.out0"},
    {"from":"dev3.in1","to":"dev0.out0"},
    {"from":"dev4.in0","to":"dev2.out0"}
  ],
    "layout":{"rows":6,"cols":8,"hideLabelOnWorkspace":false,
    "nodes":{"A":"L1","B":"L3","SEL":"L5","OUT":"R3"}}
}
$s.registerDevice('MUX',muxdata);


let halfadderdata = {
   "devices":[
    {"type":"In","id":"dev0","x":88,"y":168,"label":"A"},
    {"type":"In","id":"dev1","x":88,"y":72,"label":"B"},
    {"type":"XOR","id":"dev2","x":240,"y":72,"label":"XOR"},
    {"type":"AND","id":"dev3","x":248,"y":168,"label":"AND"},
    {"type":"Out","id":"dev4","x":400,"y":72,"label":"SUM"},
    {"type":"Out","id":"dev5","x":400,"y":168,"label":"CARRY"}
   ],
   "connectors":[
    {"from":"dev2.in0","to":"dev1.out0"},
    {"from":"dev2.in1","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev1.out0"},
    {"from":"dev3.in1","to":"dev0.out0"},
    {"from":"dev4.in0","to":"dev2.out0"},
    {"from":"dev5.in0","to":"dev3.out0"}
   ],
    "layout":{"rows":4,"cols":8,"hideLabelOnWorkspace":false,
    "nodes":{"A":"L1","B":"L3","SUM":"R1","CARRY":"R3"}}
}
$s.registerDevice('HALFADDER',halfadderdata)


let fulladderdata = {
   "devices":[
    {"type":"In","id":"dev0","x":56,"y":40,"label":"A"},
    {"type":"In","id":"dev1","x":56,"y":120,"label":"B"},
    {"type":"In","id":"dev2","x":56,"y":200,"label":"C"},
    {"type":"HALFADDER","id":"dev3","x":144,"y":160,"label":"HALFADDER"},
    {"type":"HALFADDER","id":"dev4","x":240,"y":72,"label":"HALFADDER"},
    {"type":"Out","id":"dev5","x":432,"y":160,"label":"CARRY"},
    {"type":"Out","id":"dev6","x":440,"y":64,"label":"SUM"},
    {"type":"OR","id":"dev7","x":344,"y":160,"label":"OR"}
   ],
   "connectors":[
    {"from":"dev3.in0","to":"dev1.out0"},
    {"from":"dev3.in1","to":"dev2.out0"},
    {"from":"dev4.in0","to":"dev0.out0"},
    {"from":"dev4.in1","to":"dev3.out0"},
    {"from":"dev5.in0","to":"dev7.out0"},
    {"from":"dev6.in0","to":"dev4.out0"},
    {"from":"dev7.in0","to":"dev4.out1"},
    {"from":"dev7.in1","to":"dev3.out1"}
   ],
    "layout":{"rows":6,"cols":8,"hideLabelOnWorkspace":false,
    "nodes":{"A":"L1","B":"L3","C":"L5","SUM":"R2","CARRY":"R4"}}
}
$s.registerDevice('FULLADDER',fulladderdata)

//mux16 16

var mux16data = function() {
    return function(device) {
      var numInputs = 3;
      device.halfPitch = numInputs > 2;

      device.addInput('A', 'x' + 16);

      device.addInput('B', 'x' + 16);
      
      device.addInput('SEL');
      
      device.addOutput('OUT', 'x' + 16);


      device.deviceDef['layout'] = {"rows":6,"cols":8,"hideLabelOnWorkspace":false,
    "nodes":{"A":"L1","B":"L3","SEL":"L5","OUT":"R3"}}


      var inputs = device.getInputs();
      var outputs = device.getOutputs();


      device.$ui.on('inputValueChange', function() {
      let selVal = device.getInputs()[2].getValue();


      var aBusVal = device.getInputs()[0].getValue();
      var bBusVal = device.getInputs()[1].getValue();

      if(selVal){
      device.getOutputs()[0].setValue(bBusVal);
      }else{
      device.getOutputs()[0].setValue(aBusVal);
      }
    var super_createUI = device.createUI;

    });

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        //var g = $s.graphics(device.$ui);
        //g.attr['class'] = 'simcir-basicset-symbol';
        //draw(g, 
        //  (size.width - unit) / 2,
        //  (size.height - unit) / 2,
        //  unit, unit);
        
      };
    };
  };
$s.registerDevice('MUX16', mux16data() );


var not16data = function() {
    return function(device) {
      var numInputs = 1;
      device.halfPitch = numInputs > 2;

      device.addInput('IN', 'x' + 16);
      
      device.addOutput('OUT', 'x' + 16);

      var inputs = device.getInputs();
      var outputs = device.getOutputs();


      device.$ui.on('inputValueChange', function() {
      var inValBuff = device.getInputs()[0].getValue();
      let buff = []
      if(!inValBuff)
        return;
      
      for(let i = 0;i<inValBuff.length;i++){
        buff.push(inValBuff[i]?null:true)
      }

      device.getOutputs()[0].setValue(buff);
      
    var super_createUI = device.createUI;

    });

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        //var g = $s.graphics(device.$ui);
        //g.attr['class'] = 'simcir-basicset-symbol';
        //draw(g, 
        //  (size.width - unit) / 2,
        //  (size.height - unit) / 2,
        //  unit, unit);
        
      };
    };
  };
$s.registerDevice('NOT16', not16data() );


var and16data = function() {
    return function(device) {
      var numInputs = 2;
      device.halfPitch = numInputs > 2;

      device.addInput('A', 'x' + 16);
      device.addInput('B', 'x' + 16);
      
      device.addOutput('OUT', 'x' + 16);

      var inputs = device.getInputs();
      var outputs = device.getOutputs();

      var extractValue = function(busValue, i) {
      return (busValue != null && typeof busValue == 'object' &&
          typeof busValue[i] != 'undefined')? busValue[i] : null;
    };

      device.$ui.on('inputValueChange', function() {
      console.log(device.getInputs()[0].getValue())
      var aValBuff = device.getInputs()[0].getValue();
      var bValBuff = device.getInputs()[1].getValue();
      let buff = []
      if(!aValBuff && !bValBuff)
        return;
      for(let i = 0;i<aValBuff.length;i++){
        buff.push( extractValue(aValBuff,i)& extractValue(bValBuff,i))
      }

      device.getOutputs()[0].setValue(buff);
      
    var super_createUI = device.createUI;

    });

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        //var g = $s.graphics(device.$ui);
        //g.attr['class'] = 'simcir-basicset-symbol';
        //draw(g, 
        //  (size.width - unit) / 2,
        //  (size.height - unit) / 2,
        //  unit, unit);
        
      };
    };
  };
$s.registerDevice('AND16', and16data() );

var add16data = function() {
    return function(device) {
      var bin2dec = function(bin){
      return parseInt(bin, 2);
    }
    var dec2bin = function(int) {
      var u = new Uint32Array(1);
      var nbit = 16;
      u[0] = int;
      int = Math.pow(2, 16) - 1;
      var converted = u[0] & int;
      converted.toString(2);
      return converted.toString(2).padStart(16,"0")
    }
      var numInputs = 2;
      device.halfPitch = numInputs > 2;

      device.addInput('A', 'x' + 16);
      device.addInput('B', 'x' + 16);
      
      device.addOutput('OUT', 'x' + 16);

      var inputs = device.getInputs();
      var outputs = device.getOutputs();


      device.$ui.on('inputValueChange', function() {
      var aValBuff = device.getInputs()[0].getValue();
      var bValBuff = device.getInputs()[1].getValue();
      let avaldec = 0;
      let bvaldec = 0;
      let pow = 0;
      for(let i = aValBuff.length-1;i>0;i++){
        avaldec+= aValBuff[i]? Math.pow(2,pow) : 0; 
        bvaldec+= bValBuff[i]? Math.pow(2,pow) : 0; 
        pow++;
      }

      let sum = avaldec+bvaldec;
      sum = dec2bin(sum);
      sum = bin2dec(sum);

      let buff = [];

      for(let i = aValBuff.length-1;i>0;i++){
        buff.push(sum[i]==='1'? true: null)
      }

      device.getOutputs()[0].setValue(buff);
      
    var super_createUI = device.createUI;

    });

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        //var g = $s.graphics(device.$ui);
        //g.attr['class'] = 'simcir-basicset-symbol';
        //draw(g, 
        //  (size.width - unit) / 2,
        //  (size.height - unit) / 2,
        //  unit, unit);
        
      };
    };
  };
$s.registerDevice('ADD16', and16data() );

var or8waydata = function() {
    return function(device) {

      var numInputs = 8;
      device.halfPitch = numInputs > 2;

      for(let i = 0;i<numInputs;i++)
        device.addInput();
      
      device.addOutput();

      var inputs = device.getInputs();
      var outputs = device.getOutputs();


      device.$ui.on('inputValueChange', function() {

      var invals = device.getInputs()[0].getValue();
      
      for(let i = 0;i<numInputs.length;i++){
        if(invals[i]){
          device.getOutputs()[0].setValue(true);
          device.createUI
          return;
        }

      }



      device.getOutputs()[0].setValue(null);
        
      
    var super_createUI = device.createUI;

    });

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        //var g = $s.graphics(device.$ui);
        //g.attr['class'] = 'simcir-basicset-symbol';
        //draw(g, 
        //  (size.width - unit) / 2,
        //  (size.height - unit) / 2,
        //  unit, unit);
        
      };
    };
  };
$s.registerDevice('OR8WAY', or8waydata() );


let inc16data = {"devices":[
    {"type":"DC","id":"dev0","x":56,"y":176,"label":"DC"},
    {"type":"BusOut","numInputs":16,"id":"dev1","x":168,"y":184,"label":"BusOut"},
    {"type":"In","id":"dev2","x":56,"y":64,"label":"In"},
    {"type":"ADD16","id":"dev3","x":304,"y":112,"label":"ADD16"},
    {"type":"Out","id":"dev4","x":464,"y":112,"label":"Out"}
   ],
   "connectors":[
    {"from":"dev1.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev2.out0"},
    {"from":"dev3.in1","to":"dev1.out0"},
    {"from":"dev4.in0","to":"dev3.out0"}
   ]
}
$s.registerDevice('INC16',inc16data)

let dffdata = {
  "devices":[
    {"type":"NAND","id":"dev0","x":240,"y":184,"label":"NAND"},
    {"type":"NAND","id":"dev1","x":176,"y":88,"label":"NAND"},
    {"type":"NAND","id":"dev2","x":336,"y":80,"label":"NAND"},
    {"type":"NOT","id":"dev3","x":160,"y":160,"label":"NOT"},
    {"type":"NAND","id":"dev4","x":336,"y":176,"label":"NAND"},
    {"type":"In","immobile":true,"id":"dev5","x":40,"y":80,"label":"IN","state":{"on":false}},
    {"type":"In","freq":10,"id":"dev6","x":40,"y":200,"label":"CLK"},
    {"type":"Out","immobile":true,"id":"dev7","x":456,"y":136,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev0.in0","to":"dev3.out0"},
    {"from":"dev0.in1","to":"dev6.out0"},
    {"from":"dev1.in0","to":"dev5.out0"},
    {"from":"dev1.in1","to":"dev6.out0"},
    {"from":"dev2.in0","to":"dev1.out0"},
    {"from":"dev2.in1","to":"dev4.out0"},
    {"from":"dev3.in0","to":"dev5.out0"},
    {"from":"dev4.in0","to":"dev2.out0"},
    {"from":"dev4.in1","to":"dev0.out0"},
    {"from":"dev7.in0","to":"dev2.out0"}
  ]
}
$s.registerDevice('DFF',dffdata)

let bitdata = {"devices":[
    {"type":"Out","immobile":true,"id":"dev0","x":456,"y":136,"label":"OUT"},
    {"type":"D-FF","id":"dev1","x":304,"y":208,"label":"D-FF"},
    {"type":"In","immobile":true,"freq":10,"id":"dev2","x":32,"y":224,"label":"CLK"},
    {"type":"In","immobile":true,"id":"dev3","x":32,"y":40,"label":"IN","state":{"on":false}},
    {"type":"In","immobile":true,"id":"dev4","x":32,"y":120,"label":"LOAD","state":{"on":true}},
    {"type":"MUX","id":"dev5","x":208,"y":112,"label":"MUX"}
  ],
  "connectors":[
    {"from":"dev0.in0","to":"dev1.out0"},
    {"from":"dev1.in0","to":"dev5.out0"},
    {"from":"dev1.in1","to":"dev2.out0"},
    {"from":"dev5.in0","to":"dev1.out0"},
    {"from":"dev5.in1","to":"dev3.out0"},
    {"from":"dev5.in2","to":"dev4.out0"}
  ]}
$s.registerDevice('BIT',bitdata)

}(simcir);



  
