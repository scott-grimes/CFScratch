!function($s) {

  'use strict';

  var $ = $s.$;

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

  // red/black
  var defaultLEDColor = '#ff0000';
  var defaultLEDBgColor = '#000000';
  
  var onValue = 1;
  var offValue = null;
  var isHot = function(v) { return v != null; };
  var intValue = function(v) { return isHot(v)? 1 : 0; };
  var isOn = function(v) { return isHot(v)? true : false; };
    
    
     // register simple LED
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


  $s.registerDevice('CUSTOMBUSOUT', function(device) {
    var numInputs = Math.max(2, device.deviceDef.numInputs || 16);
    device.halfPitch = true;
    device.deviceDef['isBus'] = true;

    var max = Math.pow(2,numInputs-1)-1;

        device.deviceDef['value']= 0;    

    if(!device.deviceDef['value'])
        device.deviceDef['value']= 0;
    else if(device.deviceDef['value']>max)
      device.deviceDef['value']= max;


    var dec2bin = function(int) {
      var u = new Uint32Array(1);
      var nbit = 16;
      u[0] = int;
      int = Math.pow(2, 16) - 1;
      var converted = u[0] & int;
      converted.toString(2);
      return converted.toString(2).padStart(16,"0")
    }

    var $textInput = $s.createSVGElement('text');

    var pushBusValue = function(){
      var busValue = [];
      
      let binvalue = dec2bin(device.deviceDef['value']);
      for (var i = numInputs-1; i >=0; i -= 1) {
        let value = binvalue.charAt(i);

        busValue.push( value==='1' ? 1 : null );
      }

      device.getOutputs()[0].setValue(
          busValue);
      $textInput.text(device.deviceDef['value'])
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
          $textInput.
          text(device.deviceDef['value']).
          css('font-size', 12 + 'px').
          attr('class', 'simcir-device-label').
          attr({x: w / 2, y: h/2 });
          
        device.$ui.append($textInput);

      device.doc = {
        params: [
          {name: 'numInputs', type: 'number', defaultValue: 16,
            description: 'number of inputs.'}
        ],
        code: '{"type":"' + device.deviceDef.type + '","numInputs":8}'
      };
    };
  });

    
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





  $s.registerDevice('CUSTOMBUSIN', function(device) {

    var numOutputs = Math.max(2, device.deviceDef.numOutputs || 16);
    device.halfPitch = true;
    device.deviceDef['isBus'] = true;
    device.deviceDef['value']= 0;
    device.addInput('', 'x' + numOutputs);
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
          $textDisplay.
          text(device.deviceDef['value']).
          css('font-size', 12 + 'px').
          attr('class', 'simcir-device-label').
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

let mux16data = {

  "width":600,
  "height":400,
  "showToolbox":false,


       "devices":[
    {"type":"In","immobile":true,"isBus":true,"id":"dev0","x":48,"y":40,"label":"A"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev1","x":168,"y":16,"label":"BusIn"},
    {"type":"In","immobile":true,"isBus":true,"id":"dev2","x":48,"y":232,"label":"B"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev3","x":168,"y":184,"label":"BusIn"},
    {"type":"Out","immobile":true,"isBus":true,"id":"dev4","x":650,"y":144,"label":"OUT"},
    {"type":"BusOut","numInputs":16,"immobile":true,"id":"dev5","x":536,"y":88,"label":"BusOut"},
    {"type":"In","immobile":true,"id":"dev6","x":48,"y":328,"label":"SEL"},
    {"type":"MUX","id":"dev7","x":336,"y":0,"label":"MUX"},
    {"type":"MUX","id":"dev8","x":336,"y":100,"label":"MUX"},
    {"type":"MUX","id":"dev9","x":336,"y":200,"label":"MUX"},
    {"type":"MUX","id":"dev10","x":336,"y":300,"label":"MUX"},
    {"type":"MUX","id":"dev11","x":336,"y":400,"label":"MUX"},
    {"type":"MUX","id":"dev12","x":336,"y":500,"label":"MUX"},
    {"type":"MUX","id":"dev13","x":336,"y":600,"label":"MUX"},
    {"type":"MUX","id":"dev14","x":336,"y":700,"label":"MUX"},
    {"type":"MUX","id":"dev15","x":336,"y":800,"label":"MUX"},
    {"type":"MUX","id":"dev16","x":336,"y":900,"label":"MUX"},
    {"type":"MUX","id":"dev17","x":336,"y":1000,"label":"MUX"},
    {"type":"MUX","id":"dev18","x":336,"y":1100,"label":"MUX"},
    {"type":"MUX","id":"dev19","x":336,"y":1200,"label":"MUX"},
    {"type":"MUX","id":"dev20","x":336,"y":1300,"label":"MUX"},
    {"type":"MUX","id":"dev21","x":336,"y":1400,"label":"MUX"},
    {"type":"MUX","id":"dev22","x":336,"y":1500,"label":"MUX"}
  ],
  "connectors":[
    {"from":"dev1.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev2.out0"},
    {"from":"dev4.in0","to":"dev5.out0"},
    {"from":"dev5.in0","to":"dev7.out0"},
    {"from":"dev5.in1","to":"dev8.out0"},
    {"from":"dev5.in2","to":"dev9.out0"},
    {"from":"dev5.in3","to":"dev10.out0"},
    {"from":"dev5.in4","to":"dev11.out0"},
    {"from":"dev5.in5","to":"dev12.out0"},
    {"from":"dev5.in6","to":"dev13.out0"},
    {"from":"dev5.in7","to":"dev14.out0"},
    {"from":"dev5.in8","to":"dev15.out0"},
    {"from":"dev5.in9","to":"dev16.out0"},
    {"from":"dev5.in10","to":"dev17.out0"},
    {"from":"dev5.in11","to":"dev18.out0"},
    {"from":"dev5.in12","to":"dev19.out0"},
    {"from":"dev5.in13","to":"dev20.out0"},
    {"from":"dev5.in14","to":"dev21.out0"},
    {"from":"dev5.in15","to":"dev22.out0"},
    {"from":"dev7.in0","to":"dev1.out0"},
    {"from":"dev7.in1","to":"dev3.out0"},
    {"from":"dev7.in2","to":"dev6.out0"},
    {"from":"dev8.in0","to":"dev1.out1"},
    {"from":"dev8.in1","to":"dev3.out1"},
    {"from":"dev8.in2","to":"dev6.out0"},
    {"from":"dev9.in0","to":"dev1.out2"},
    {"from":"dev9.in1","to":"dev3.out2"},
    {"from":"dev9.in2","to":"dev6.out0"},
    {"from":"dev10.in0","to":"dev1.out3"},
    {"from":"dev10.in1","to":"dev3.out3"},
    {"from":"dev10.in2","to":"dev6.out0"},
    {"from":"dev11.in0","to":"dev1.out4"},
    {"from":"dev11.in1","to":"dev3.out4"},
    {"from":"dev11.in2","to":"dev6.out0"},
    {"from":"dev12.in0","to":"dev1.out5"},
    {"from":"dev12.in1","to":"dev3.out5"},
    {"from":"dev12.in2","to":"dev6.out0"},
    {"from":"dev13.in0","to":"dev1.out6"},
    {"from":"dev13.in1","to":"dev3.out6"},
    {"from":"dev13.in2","to":"dev6.out0"},
    {"from":"dev14.in0","to":"dev1.out7"},
    {"from":"dev14.in1","to":"dev3.out7"},
    {"from":"dev14.in2","to":"dev6.out0"},
    {"from":"dev15.in0","to":"dev1.out8"},
    {"from":"dev15.in1","to":"dev3.out8"},
    {"from":"dev15.in2","to":"dev6.out0"},
    {"from":"dev16.in0","to":"dev1.out9"},
    {"from":"dev16.in1","to":"dev3.out9"},
    {"from":"dev16.in2","to":"dev6.out0"},
    {"from":"dev17.in0","to":"dev1.out10"},
    {"from":"dev17.in1","to":"dev3.out10"},
    {"from":"dev17.in2","to":"dev6.out0"},
    {"from":"dev18.in0","to":"dev1.out11"},
    {"from":"dev18.in1","to":"dev3.out11"},
    {"from":"dev18.in2","to":"dev6.out0"},
    {"from":"dev19.in0","to":"dev1.out12"},
    {"from":"dev19.in1","to":"dev3.out12"},
    {"from":"dev19.in2","to":"dev6.out0"},
    {"from":"dev20.in0","to":"dev1.out13"},
    {"from":"dev20.in1","to":"dev3.out13"},
    {"from":"dev20.in2","to":"dev6.out0"},
    {"from":"dev21.in0","to":"dev1.out14"},
    {"from":"dev21.in1","to":"dev3.out14"},
    {"from":"dev21.in2","to":"dev6.out0"},
    {"from":"dev22.in0","to":"dev1.out15"},
    {"from":"dev22.in1","to":"dev3.out15"},
    {"from":"dev22.in2","to":"dev6.out0"}
  ]
}
$s.registerDevice('MUX16',mux16data);






}(simcir);



  
