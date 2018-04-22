

var runTest = function(testobj){
    return new Promise(function(resolve,reject){

        var numTests = testobj["number"];
        var devicesToSet = testobj["toSet"];
        var devicesToCheck = testobj["toCheck"];
        var output = {};

        output["number"] = numTests;
        output["devicesToSet"] = devicesToSet;
        output["devicesToCheck"] = devicesToCheck;

        for(let i = 0;i<devicesToCheck.length;i++){
            output[ devicesToCheck[i] ] = [];
        }
        for(let i = 0;i<devicesToSet.length;i++){
            output[ devicesToSet[i] ] = [];
        }

        var data = simcir.controller($('#circuitBox').find('.simcir-workspace')).data();
        var boolToBin = function(x){ return (x? 1:0); };
        

        var setCircuitData = function(data){

            return new Promise(function(resolve, reject) {
                simcir.setupSimcir( $('#circuitBox'), data );
                //console.log('uploading new circuit data')
                    setTimeout(() => {//console.log('returning from uploading');
                     resolve()}, 50); // (*)
            });  
        };  

        var getIndexOfLabel = function(label){
            for(var i = 0;i<data.devices.length;i++){
                if (data.devices[i]['label']===label)
                    return i;
            }
            return null;
        };
        var getState  = function(label){
            data = simcir.controller($('#circuitBox').find('.simcir-workspace')).data();
            var i = getIndexOfLabel(label);
            i = data.devices[i].state['on']
            return boolToBin(i)
        };
        
        var setState = function(label,value){
            var i = getIndexOfLabel(label);
            data.devices[i].state['on'] = value;
        };


        
        var runSingleTest =function(i){
                return new Promise(function(resolve, reject) {
                    
                    //pushing set pins into results object
                    for(let j = 0;j<devicesToSet.length;j++){
                        var valueToSet = testobj[devicesToSet[j]][i] ? true : false;
                        setState(devicesToSet[j],  valueToSet)
                        valueToSet = boolToBin(valueToSet);
                        output[ devicesToSet[j] ].push( valueToSet )  ;
                    }
                   //console.log('starting to set circuit data');

                    setCircuitData(data)
                    .then( ()=> {
                        return new Promise(function(resolve, reject) {
                            //adding set pin to output
                            for(let j = 0;j<devicesToCheck.length;j++){
                                
                                output[ devicesToCheck[j] ].push(getState(devicesToCheck[j]));
                                
                            }resolve();
                        }); 
                    })
                    .then(()=> resolve() );
            });
            }

    var chain = Promise.resolve();
    //check each test, push the values into our output 

    for(let i = 0;i<numTests;i++){
        chain=chain.then( ()=> {
            return runSingleTest(i) 
        } );

    }
        chain=chain.then( () => {
            //console.log('all output finished')
            resolve ( output );
        });   
    



    });
}







        
        
        
    


  

