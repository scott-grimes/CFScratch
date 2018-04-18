

var runTest = function(testobj){
    var numTests = testobj["number"];
    var devicesToSet = testobj["toSet"];
    var devicesToCheck = testobj["toCheck"];
    var output = [];
    var line = [];
    var data = simcir.controller($('#circuitBox').find('.simcir-workspace')).data();
    
    var boolToBin = function(x){ return (x? 1:0); };
    
    var getIndexOfLabel = function(label){
        for(var i = 0;i<data.devices.length;i++){
            if (data.devices[i]['label']===label)
                return i;
        }
        return null;
    }
        var getState  = function(label){
            data = simcir.controller($('#circuitBox').find('.simcir-workspace')).data();
            var i = getIndexOfLabel(label);
            i = data.devices[i].state['on']
            return boolToBin(i)
        }
        
        var setState = function(label,value){
            console.log(label,'to',value)
            var i = getIndexOfLabel(label);
            data.devices[i].state['on'] = value;
            
        }
    
    //add the label of the devices to the first row of our output
    for(var i = 0;i<devicesToSet.length;i++)
        {
            line.push(devicesToSet[i])
        }
    for(var i = 0;i<devicesToCheck.length;i++)
        {   
            line.push(devicesToCheck[i])
        }
    output.push(line);
    
    //check each test, push the values into our output row
    for(var i = 0;i<numTests;i++){
        line = [];
        for(var j = 0;j<devicesToSet.length;j++){
            var valueToSet = testobj[devicesToSet[j]][i] ? true : false;
            setState(devicesToSet[j],  valueToSet)
            valueToSet = boolToBin(valueToSet);
            line.push(valueToSet)
        }
        setCircuitData(data); 
        
        for(var j = 0;j<devicesToCheck.length;j++){
            line.push( getState(devicesToCheck[j]) );
        }
        output.push(line);
    }
    
    
    return output;
}


var setCircuitData = function(data){
        
    simcir.setupSimcir( $('#circuitBox'), data );
  
    }
