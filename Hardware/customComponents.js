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
  var extractValue = function(busValue, i) {
      return (busValue != null && typeof busValue == 'object' &&
          typeof busValue[i] != 'undefined')? busValue[i] : null;
  };
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
  var busToSignedInt = function(busVal){
          let value = 0;
          for(let i = 0; i<16;i++){
            let bitOn = isHot( extractValue(busVal,i) )
            value+= bitOn ? Math.pow(2,i) : 0;
          }

          if(value>32767)
            value-= Math.pow(2,16)

          return value;
        }

  var dec2bus = function(decimalValue){
          let binary = dec2bin(decimalValue);
          let outVal = [];
            for(let i = 15;i>=0;i--){
              outVal.push(  binary[i]==='1'? 1 : null )
            }
          return outVal;

  }

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
        device.deviceDef.state = {'on': false };
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
      device.trigger = function(newValue){
        if(numInputs === 16 && newValue> 32767){
            newValue = newValue-Math.pow(2,16);
          }
            device.deviceDef['value'] = newValue;
            pushBusValue();
      }

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
        if(text> 32767)
          text-=Math.pow(2,16);

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
        var $button;
        
        device.getState = function() {
          return type == 'Toggle'? { on : on } : null;
        };

        var updateOutput = function() {
          out1.setValue(on ? on : null);

          $button.attr('fill', on? defaultLEDColor : defaultLEDBgColor);
          

        };
        out1.setValue(on ? on : null);
        var super_createUI = device.createUI;
        device.createUI = function() {
          super_createUI();
          var size = device.getSize();
          $button = $s.createSVGElement('rect').
            attr({x: size.width / 4, y: size.height / 4,
              width: size.width / 2, height: size.height / 2,
              rx: 2, ry: 2})
            .attr('fill', on? defaultLEDColor : defaultLEDBgColor);
          //.addClass('simcir-basicset-switch-button');
         
          device.$ui.append($button);

            
          var button_mouseDownHandler = function(event) {
          
            event.preventDefault();
            event.stopPropagation();
            on = !on;
            //$button.addClass('simcir-basicset-switch-button-pressed');
              
            updateOutput();
            $(document).on('mouseup', button_mouseUpHandler);
            $(document).on('touchend', button_mouseUpHandler);
          };
            
          var button_mouseUpHandler = function(event) {
              //if (!on) {
              //  $button.removeClass('simcir-basicset-switch-button-pressed');
              //}
            
            updateOutput();
            $(document).off('mouseup', button_mouseUpHandler);
            $(document).off('touchend', button_mouseUpHandler);
          };

          // null is off, 1 is on
          device.trigger = function(newValue){
            if(newValue === true || newValue === 1){
              on = true;
              updateOutput();
            }
            if(newValue ===null || newValue === false || newValue === 0){
              updateOutput();
            }
          }
            
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

  var not16funct = function(inputs){
    //expects inputs to have one array

    let in0 = inputs[0];
    let buff = [];
      for(let i = 0;i<16;i++){
          let invali = extractValue(in0, i);
          buff.push(  isOn(invali)? null : 1 )
        }
      return buff;
  }
  var not16connectionNames = [ ['IN','x16'] , ['OUT','x16']];

  var create16BitLogicGateFactory = function(connectionNames, logicfunct, draw) {
      return function(device) {
        var numInputs = connectionNames.length-1;

        device.halfPitch = numInputs > 2;

        for (var i = 0; i < numInputs; i += 1) {
          device.addInput(connectionNames[i][0],connectionNames[i][1]);
        }

        device.addOutput(connectionNames[numInputs][0] , connectionNames[numInputs][1] );

        var inputs = device.getInputs();
        var outputs = device.getOutputs();
        device.$ui.on('inputValueChange', function() {
        let inputsArray = [];

          for(let i = 0;i<numInputs;i++)
            inputsArray.push( inputs[i].getValue() )

          let parsedOutput = logicfunct( inputsArray );
          outputs[0].setValue( parsedOutput );


        });
        var super_createUI = device.createUI;
        device.createUI = function() {
          super_createUI();
          var size = device.getSize();
          var g = $s.graphics(device.$ui);
          g.attr['class'] = 'simcir-basicset-symbol';

          /*draw(g, 
            (size.width - unit) / 2,
            (size.height - unit) / 2,
            unit, unit);
            */
          
        };
      };
  };

  var and16funct = function(inputs){
    //expects inputs to have one array

    let a = inputs[0];
    let b = inputs[1];
    let buff = [];

      for(let i = 0;i<16;i++){

          let avali = extractValue(a, i);
          let bvali = extractValue(b, i);

          buff.push(  isOn(avali)&&isOn(bvali) ? 1 : null )

        }
      
      return buff;
  }
  var and16connectionNames = [ ['A','x16'] , ['B','x16'] , ['OUT','x16']];

  var add16funct = function(inputs){
    //expects inputs to have one array

    let a = inputs[0];
    let b = inputs[1];
    let buff = [];
    let carry = 0;

      for(let i = 0;i<16;i++){

          let avali = intValue ( extractValue(a, i) );
          let bvali = intValue ( extractValue(b, i) );
          let sum = avali+bvali+carry;
          //if sum = 0: sum0/carry0, sum=1: sum1/carry0:sum=2 sum0/carry1, sum==3 sum1, carry1
          carry = sum>1? 1:0;
          sum = sum%2===1? 1:0;
          
          buff.push(  sum===1 ? 1 : null )

        }
      
      return buff;
  }
  var add16connectionNames = [ ['A','x16'] , ['B','x16'] , ['OUT','x16']];

  var mux16funct = function(inputs){
    //expects inputs to have one array

    let a = inputs[0];
    let b = inputs[1];
    let m = inputs[2];
    m = isOn(m);
    let buff = [];
      for(let i = 0;i<16;i++){
          let avali = extractValue(a, i);
          let bvali = extractValue(b, i);
          
          buff.push( m  ? bvali : avali )

        }
      
      return buff;
  }

  var mux16connectionNames = [ ['A','x16'] , ['B','x16'] , ['SEL',''] , ['OUT','x16']];

  var inc16funct = function(inputs){
    //expects inputs to have one array

    let a = inputs[0];
    let buff = [];
    let carry = 0;

      for(let i = 0;i<16;i++){

          let avali = intValue ( extractValue(a, i) );
          let bvali = (i===0? 1:0);
          let sum = avali+bvali+carry;
          //if sum = 0: sum0/carry0, sum=1: sum1/carry0:sum=2 sum0/carry1, sum==3 sum1, carry1
          carry = sum>1? 1:0;
          sum = sum%2===1? 1:0;
          
          buff.push(  sum===1 ? 1 : null )

        }
      
      return buff;
  }

  var inc16connectionNames = [ ['IN','x16'] , ['OUT','x16']];

  var muxmultiway16funct = function(inputs){
    //expects inputs to have one array

    let m = inputs[ inputs.length-1 ];
    let bitnums = parseInt( Math.log(inputs.length-1)/Math.log(2) ) ;
    let choice = 0;
    for(let i = 0;i<bitnums;i++){
      let mvali = extractValue(m,i);
      
      if (isHot(mvali)){
        choice+=Math.pow(2,i);
      }

    }

      let buff = [];
      for(let i = 0;i<16;i++){
          let bitval = extractValue( inputs[choice] , i);
          buff.push( bitval )
        }
      return buff;
  }


  var createDmuxFactory = function(connectionNames, logicfunct, draw) {
      return function(device) {
        var numInputs = 2;
        var numOutputs = connectionNames.length-2;

        device.halfPitch = numInputs > 2;
        device.addInput(connectionNames[0][0],connectionNames[0][1]); //IN
        device.addInput(connectionNames[1][0],connectionNames[1][1]); //SEL xX

        for (var i = 2; i < numOutputs+2; i += 1) {
          device.addOutput(connectionNames[i][0],connectionNames[i][1]);
        }

        var inputs = device.getInputs();
        var outputs = device.getOutputs();
        device.$ui.on('inputValueChange', function() {
        let inputsArray = [];

          for(let i = 0;i<numInputs;i++)
            inputsArray.push( inputs[i].getValue() )

          let parsedOutput = logicfunct( inputsArray, numOutputs );
          for(let i = 0;i<numOutputs;i++)
            outputs[i].setValue( parsedOutput[i]);

        });
        var super_createUI = device.createUI;
        device.createUI = function() {
          super_createUI();
          var size = device.getSize();
          var g = $s.graphics(device.$ui);
          g.attr['class'] = 'simcir-basicset-symbol';

          /*draw(g, 
            (size.width - unit) / 2,
            (size.height - unit) / 2,
            unit, unit);
            */
          
        };
      };
  };

  var dmuxmultiwayfunct = function(inputs,numOutputs){
    
    let inVal = inputs[0];
    let sel = inputs[1]
    let bitnums = parseInt( Math.log(numOutputs)/Math.log(2) ) ;
    let choice = 0;
    for(let i = 0;i<bitnums;i++){
      let mvali = extractValue(sel,i);
      if (isHot(mvali)){
        choice+=Math.pow(2,i);
      }

    }
    let buff = [];
    for(let i = 0;i<numOutputs;i++){
        if(i===choice){

          buff.push( isHot(inVal)? 1:null )
        }
        else{
        buff.push( null )
        }
    }
    return buff;
  }

  var dmux4wayconnectionNames = [ ['IN',''] , ['SEL','x2'] ,['A',''] , ['B',''] , ['C',''] , ['D','']];
  var dmux8wayconnectionNames = [ ['IN',''] , ['SEL','x3'] ,['A',''] , ['B',''] , ['C',''] , ['D',''],['E',''] , ['F',''] , ['G',''] , ['H','']];
  var mux4way16connectionNames = [ ['A','x16'] , ['B','x16'] , ['C','x16'] , ['D','x16'] ,['SEL','x2'] , ['OUT','x16']];
  var mux8way16connectionNames = [ ['A','x16'] , ['B','x16'] , ['C','x16'] , ['D','x16'] , ['E','x16'] , ['F','x16'] , ['G','x16'] , ['H','x16'], ['SEL','x3'] , ['OUT','x16']];

  $s.registerDevice('NOT16', create16BitLogicGateFactory(not16connectionNames, not16funct, null) );
  $s.registerDevice('AND16', create16BitLogicGateFactory(and16connectionNames, and16funct, null) );
  $s.registerDevice('ADD16', create16BitLogicGateFactory(add16connectionNames, add16funct, null) );
  $s.registerDevice('MUX16', create16BitLogicGateFactory(mux16connectionNames, mux16funct, null) );
  $s.registerDevice('MUX4WAY16', create16BitLogicGateFactory(mux4way16connectionNames, muxmultiway16funct, null) );
  $s.registerDevice('MUX8WAY16', create16BitLogicGateFactory(mux8way16connectionNames, muxmultiway16funct, null) );
  $s.registerDevice('INC16', create16BitLogicGateFactory(inc16connectionNames, inc16funct, null) );
  $s.registerDevice('DMUX4WAY', createDmuxFactory(dmux4wayconnectionNames, dmuxmultiwayfunct, null) );
  $s.registerDevice('DMUX8WAY', createDmuxFactory(dmux8wayconnectionNames, dmuxmultiwayfunct, null) );

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
        

        for(let i = 0;i<8;i++){
          let in_i = device.getInputs()[i].getValue();
          if( isOn( in_i ) ){
            device.getOutputs()[0].setValue(1);
            device.createUI;
            return;
          }

        }


        device.getOutputs()[0].setValue(null);
          
        
      device.createUI;

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

  let dmuxdata = { "devices":[
    {"type":"In","immobile":false,"id":"dev0","x":50,"y":50,"label":"IN","state":{"on":false}},
    {"type":"In","immobile":false,"id":"dev1","x":50,"y":250,"label":"SEL","state":{"on":false}},
    {"type":"NOT","id":"dev2","x":150,"y":250,"label":"NOT"},
    {"type":"AND","id":"dev3","x":200,"y":50,"label":"AND"},
    {"type":"AND","id":"dev4","x":200,"y":150,"label":"AND"},
    {"type":"Out","immobile":false,"id":"dev5","x":350,"y":100,"label":"A","state":{"on":false}},
    {"type":"Out","immobile":false,"id":"dev6","x":350,"y":200,"label":"B","state":{"on":false}}
    ],
    "connectors":[
    {"from":"dev2.in0","to":"dev1.out0"},
    {"from":"dev3.in0","to":"dev0.out0"},
    {"from":"dev3.in1","to":"dev1.out0"},
    {"from":"dev4.in0","to":"dev0.out0"},
    {"from":"dev4.in1","to":"dev2.out0"},
    {"from":"dev5.in0","to":"dev4.out0"},
    {"from":"dev6.in0","to":"dev3.out0"}
    ]
  }
  $s.registerDevice('DMUX',dmuxdata)


  $s.registerDevice('BIT', function(device) {
        var numInputs = 3;

        device.halfPitch = numInputs > 2;
        device.addInput('IN')
        device.addInput('LOAD')
        device.addInput('CLOCK')

        device.addOutput('OUT');
        var storedValue = null;

        var inputs = device.getInputs();
        var outputs = device.getOutputs();

        device.createUI();
        device.$ui.on('inputValueChange', function() {
          let clockOn = isHot ( inputs[2].getValue() );
          let loadOn = isHot ( inputs[1].getValue() );
          let inVal = inputs[0].getValue();
          if(clockOn){
            if(loadOn){
              storedValue = inVal;
            }
          }

          outputs[0].setValue(storedValue);

        });
        var super_createUI = device.createUI;
        device.createUI = function() {
          super_createUI();
          var size = device.getSize();
          var g = $s.graphics(device.$ui);
          g.attr['class'] = 'simcir-basicset-symbol';

          /*draw(g, 
            (size.width - unit) / 2,
            (size.height - unit) / 2,
            unit, unit);
            */
          
        };
      }
  );


  $s.registerDevice('DFF', function(device) {
        var numInputs = 2;

        device.halfPitch = numInputs > 2;
        device.addInput('IN')
        device.addInput('CLOCK')

        device.addOutput('OUT');
        var storedValue = null;

        var inputs = device.getInputs();
        var outputs = device.getOutputs();

        device.$ui.on('inputValueChange', function() {
          let clockOn = isHot ( inputs[1].getValue() );
          let inVal = isHot ( inputs[0].getValue() );

          if(clockOn){
              storedValue = inVal? 1 : null;
            
          }

          outputs[0].setValue(storedValue);

        });
        var super_createUI = device.createUI;
        device.createUI = function() {
          super_createUI();
          var size = device.getSize();
          var g = $s.graphics(device.$ui);
          g.attr['class'] = 'simcir-basicset-symbol';

          /*draw(g, 
            (size.width - unit) / 2,
            (size.height - unit) / 2,
            unit, unit);
            */
          
        };
      }
  );

  
  var ALUFactory = function() {
      return function(device) {
        var numInputs = 8;
        var numOutputs = 3;

        device.halfPitch = numInputs > 2;

        
        device.addInput('X','x16');
        device.addInput('Y','x16');
        device.addInput('ZX');
        device.addInput('NX');
        device.addInput('ZY');
        device.addInput('NY');
        device.addInput('F');
        device.addInput('NO');
        
        device.addOutput('OUT','x16');
        device.addOutput('ZR');
        device.addOutput('NG');

        var inputs = device.getInputs();
        var outputs = device.getOutputs();

        device.$ui.on('inputValueChange', function() {
       
          let xIn = inputs[0].getValue();
          let yIn = inputs[1].getValue();
          let x = [];
          let y = [];
          //convert x and y into 16bit arrays
          for(let i = 0;i<16;i++){
            x.push( extractValue(xIn,i) );
            y.push( extractValue(yIn,i) );

          }

          //get values from 6 command pins
          let zx = isHot( inputs[2].getValue() );
          let nx = isHot( inputs[3].getValue() );
          let zy = isHot( inputs[4].getValue() );
          let ny = isHot( inputs[5].getValue() );
          let f = isHot( inputs[6].getValue() );
          let no = isHot( inputs[7].getValue() );
          

          // prep our outputs
          let out = [];
          let zr = null;
          let ng = null;
          if(zx) {x = x.map(i => null);}
          if(nx) {x = x.map(i => (i===1? null: 1));}
          if(zy) {y = y.map(i => null);}
          if(ny) {y = y.map(i => (i===1? null: 1));}
          let inputArr = [x,y];
          if(f){
            // add  
            out = add16funct(inputArr);
          }else{
            // and 
            out = and16funct(inputArr);
          }

          if(no) {out = out.map(i => (i===1? null: 1));}

          if(out[15]===1) ng = 1;
          const sumHotBits = (acc, currVal) => acc + currVal;
          let hotBitCount = out.reduce(sumHotBits)
          if(hotBitCount===0) zr = 1;

          outputs[0].setValue( out );
          outputs[1].setValue( zr );
          outputs[2].setValue( ng );

          device.createUI;

        });

        var super_createUI = device.createUI;

        device.createUI = function() {
          super_createUI();
          var size = device.getSize();
          var g = $s.graphics(device.$ui);
          g.attr['class'] = 'simcir-basicset-symbol';

          /*draw(g, 
            (size.width - unit) / 2,
            (size.height - unit) / 2,
            unit, unit);
            */
          
        };
      };
  };

  $s.registerDevice('ALU',ALUFactory())


  //only updates output when clock is ON
  // waits for clock to cycle back to OFF so that a continually ON clock does not speed ahead and cycle too fast
  $s.registerDevice('REGISTER', function(device) {
        var numInputs = 3;
        let storedValue = 0;
        
        device.halfPitch = numInputs > 2;

        device.addInput('IN','x16');
        device.addInput('LOAD');
        device.addInput('CLK');
        let waitingForClockOn = true;
        device.addOutput('OUT','x16');

        var inputs = device.getInputs();
        var outputs = device.getOutputs();

        device.$ui.on('inputValueChange', function() {
       
          let inVal = inputs[0].getValue();
          let loadOn = isHot ( inputs[1].getValue() );
          let clockOn = isHot (inputs[2].getValue() );

          if(clockOn && waitingForClockOn){
            if(loadOn) {
              let inValDec = busToSignedInt(inVal);
              storedValue = inValDec;
              outputs[0].setValue( inVal );
          }
            waitingForClockOn = false;
            device.createUI;
            return;
          }
          
          if(!clockOn){
            waitingForClockOn = true;
          }
        });

        var super_createUI = device.createUI;

        device.createUI = function() {
          super_createUI();
          var size = device.getSize();
          var g = $s.graphics(device.$ui);
          g.attr['class'] = 'simcir-basicset-symbol';

          /*draw(g, 
            (size.width - unit) / 2,
            (size.height - unit) / 2,
            unit, unit);
            */
          
        };
      }
  );



  $s.registerDevice('PC', function(device) {
        var numInputs = 5;
        let storedValue = 0;
        
        device.halfPitch = numInputs > 2;
        let waitingForClockOn = true;
        device.addInput('IN','x16');
        device.addInput('LOAD');
        device.addInput('INC');
        device.addInput('RESET');
        device.addInput('CLK');

        device.addOutput('OUT','x16');

        var inputs = device.getInputs();
        var outputs = device.getOutputs();

        device.$ui.on('inputValueChange', function() {
       
          let inVal = inputs[0].getValue();
          let loadOn = isHot ( inputs[1].getValue() );
          let incOn = isHot (inputs[2].getValue() );
          let resetOn = isHot (inputs[3].getValue() );
          let clockOn = isHot (inputs[4].getValue() );

          if(clockOn && waitingForClockOn){
            
            if(resetOn){
              storedValue = 0;
            }
            else if(loadOn) {
              let inValDec = busToSignedInt(inVal);
              storedValue = inValDec;
              
            }
            else if(incOn){
              storedValue+=1;
              
            }
            waitingForClockOn = false;
            let outVal = dec2bus(storedValue);
            outputs[0].setValue( outVal );
            device.createUI;
            return;
          }
          
          if(!clockOn){
            waitingForClockOn = true;
          }
        });


        var super_createUI = device.createUI;

        device.createUI = function() {
          super_createUI();
          var size = device.getSize();
          var g = $s.graphics(device.$ui);
          g.attr['class'] = 'simcir-basicset-symbol';

          /*draw(g, 
            (size.width - unit) / 2,
            (size.height - unit) / 2,
            unit, unit);
            */
          
        };
      }
  );


  var RAMFactory = function(numRegisters){

      return function(device) {
        
        var RAM = {};
        var lastValidAddress = numRegisters-1;
        var addressBits = parseInt(Math.log(numRegisters)/Math.log(2));

        var pop = function(a){
          if(RAM[a]) return RAM[a];
          return 0;
        }

        var poke = function(a,value){
          RAM[a] = value;
        }

        device.getRAM = function(){
          return RAM;
        }

        device.halfPitch = true;

        device.addInput('IN','x16');
        device.addInput('LOAD');
        device.addInput('ADDRESS','x'+addressBits);
        device.addInput('CLK')
        
        device.addOutput('OUT','x16');

        var inputs = device.getInputs();
        var outputs = device.getOutputs();

        device.$ui.on('inputValueChange', function() {
       
          let loadOn = isHot ( inputs[1].getValue() );
          let addVal = inputs[2].getValue();
          let clockOn = isHot (inputs[3].getValue() )

          //set address
            let addressDec = 0;
            for(let i = 0;i<addressBits;i++){
              let bitOn = isHot( extractValue(addVal,i) );
              addressDec += bitOn ? Math.pow(2,i) : 0;
            }

          let outVal = [];

          if(loadOn && clockOn) { 

            let inVal = inputs[0].getValue();
            let inValDec = busToSignedInt(inVal);
            poke(addressDec,inValDec); 
          }
          
            // pull the old value from RAM and conver to bus
            let oldM = pop(addressDec);
            outVal = dec2bus(oldM); 
          outputs[0].setValue( outVal );
          device.createUI;

        });

        var super_createUI = device.createUI;

        device.createUI = function() {
          super_createUI();
          var size = device.getSize();
          var g = $s.graphics(device.$ui);
          g.attr['class'] = 'simcir-basicset-symbol';

          /*draw(g, 
            (size.width - unit) / 2,
            (size.height - unit) / 2,
            unit, unit);
            */
          
        };
      };
};
  
  $s.registerDevice('RAM8',RAMFactory(8));
  $s.registerDevice('RAM64',RAMFactory(64));
  $s.registerDevice('RAM512',RAMFactory(512));
  $s.registerDevice('RAM4K',RAMFactory(4096));
  $s.registerDevice('RAM16K',RAMFactory(32768));
  /*
  //$s.registerDevice('SCREEN',RAMFactory())
  //$s.registerDevice('KBD',RAMFactory(1))
  //$s.registerDevice('MEMORY')
  */

}(simcir);



  
