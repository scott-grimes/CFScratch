// dff test is unique, cannot just set initial values. instead use calls to "update inputs"
var clearClock = function(clockDevice){
    clockDevice.trigger(true);
    clockDevice.trigger(false);
}

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

        var data;
        var updateData = function(){
            data = simcir.controller($('#circuitBox').find('.simcir-workspace')).data();
        }
        updateData();

        var boolToBin = function(x){ return (x? 1:0); };
        

        var getIndexOfLabel = function(label){
            for(var i = 0;i<data.devices.length;i++){
                if (data.devices[i]['label']===label)
                    return i;
            }
            return null;
        };
        //returns the device with a given id
        var device = function(id){ return simcir.controller($('#circuitBox').find('.simcir-workspace')).data().deviceFuncts[id]; }

        var getState  = function(label){
            var i = getIndexOfLabel(label);
            let isBus = deviceIsBus(label);

            let d = device(i).deviceDef;
            if( isBus ){
                //2s compliment
                
                if(d.value>32768 && ( d['numInputs']===16 || d['numOutputs']===16 )  ){
                    
                    return d.value-Math.pow(2,15);
                }

                return d.value;
            }

            i = d.state['on']
            return boolToBin(i)
        };
        
        var setState = function(label,value){

            return new Promise(function(resolve, reject) {
                var i = getIndexOfLabel(label);
                device(i).trigger(value);
                //console.log('uploading new circuit data')
                    setTimeout(() => { //console.log(simcir.controller($('#circuitBox').find('.simcir-workspace')).data() );
                     resolve()}, 60); // (*)
            });  
        };

        var deviceIsBus = function(label){
            let i = getIndexOfLabel(label);
            if(i===null) throw('device with label '+label+' not found')
            if( data.devices[i]['isBus'] ) {
                return data.devices[i]['isBus'];
            }
            return false;
        }


        
        var runSingleTest =function(i){
                return new Promise(function(resolve, reject) {
                    let promiseArray = [];
                    //pushing set pins into results object
                    for(let j = 0;j<devicesToSet.length;j++){

                        let valueToSet;
                        let isBus = deviceIsBus( devicesToSet[j]);
                        

                        if( isBus ){
                            valueToSet = testobj[ devicesToSet[j] ][i];
                        }else{
                            valueToSet = testobj[ devicesToSet[j] ][i] ? true : false;
                        }

                        promiseArray.push( setState(devicesToSet[j],  valueToSet) )

                        if(! isBus )
                            valueToSet = boolToBin(valueToSet);

                        output[ devicesToSet[j] ].push( valueToSet )  ;
                    }
                   //console.log('starting to set circuit data');
                   Promise.all( promiseArray ).then( ()=> {
                        return new Promise(function(resolve, reject) {
                            //adding set pin to output
                            for(let j = 0;j<devicesToCheck.length;j++){
                                
                                output[ devicesToCheck[j] ].push(getState(devicesToCheck[j]));
                                
                            }resolve();
                        }); 
                    })
                    .then(()=> resolve() );
            });
            };

    var chain = Promise.resolve();
    //check each test, push the values into our output 


    //check for DFF test, because of recursion the outpin is set incorrect at the beginning
    if(testobj['CLK']){
        let clockPin = device( getIndexOfLabel("CLK") )
        clearClock( clockPin );
    }



    //run all our tests
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


var runClockedTest = function(testobj){
    
}





        
        
        
    


  

