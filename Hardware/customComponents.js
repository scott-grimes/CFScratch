!function($s) {

  'use strict';

  var $ = $s.$;

  // unit size
  var unit = $s.unit;

  // red/black
  var defaultLEDColor = '#ff0000';
  var defaultLEDBgColor = '#000000';
  
  var onValue = 1;
  var offValue = null;
  var isHot = function(v) { return v != null; };
  var intValue = function(v) { return isHot(v)? 1 : 0; };

    
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

   /*
  // register direct current source
  $s.registerDevice('DC', function(device) {
    device.addOutput();
    var super_createUI = device.createUI;
    device.createUI = function() {
      super_createUI();
      device.$ui.addClass('simcir-basicset-dc');
    };
    device.$ui.on('deviceAdd', function() {
      device.getOutputs()[0].setValue(onValue);
    });
    device.$ui.on('deviceRemove', function() {
      device.getOutputs()[0].setValue(null);
    });
  });
*/
  

}(simcir);
