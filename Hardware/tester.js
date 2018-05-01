// dff test is unique, cannot just set initial values. instead use calls to "update inputs"

var boolToBin = function(x){ return (x? 1:0); };

var data;

var inputPinTypes = ['SINGLEINPUT','CUSTOMBUSOUT']; // if a labeled pin has this type, set it. otherwise we have an output pin to check the value of

// the data object contains an array of devices. given a label, what is the index of the device?
var iOfLabelInData = function(label){
            for(var i = 0;i<data.devices.length;i++){
                if (data.devices[i]['label']===label)
                    return i;
            }
            return null;
        };

//returns the simcir device with a given index (data.devices[id])
var getDevice = function(id){ return simcir.controller($('#circuitBox').find('.simcir-workspace')).data().deviceFuncts[id]; }

//returns the stored value of a given device.  
var getState  = function(label){
            var i = iOfLabelInData(label);
            let isBus = deviceIsBus(label);

            let d = getDevice(i).deviceDef;
            if( isBus ){
                //2s compliment
                
                if(d.value>32768 && ( d['numInputs']===16 || d['numOutputs']===16 )  ){
                    
                    return d.value-Math.pow(2,15);
                }

                return d.value;
            }

            i = d.state['on']
            return boolToBin(i);
};

// sets the device with label "CLOCK" to the specified value
var setClock = function(value){
            return new Promise(function(resolve, reject) {
                var i = iOfLabelInData('CLOCK');
                getDevice(i).trigger(value);
                    setTimeout(() => { 
                     resolve()}, 10); // (*)
            }); 
};
      
//sets the device with the given label to value  
var setState = function(label,value){
            
            return new Promise(function(resolve, reject) {
                var i = iOfLabelInData(label);
                getDevice(i).trigger(value);
                //console.log('uploading new circuit data')
                    setTimeout(() => { //console.log(simcir.controller($('#circuitBox').find('.simcir-workspace')).data() );
                     resolve()}, 60); // (*)
            }); 
};

// returns true if the device is a bus, false if otherwise. buses must have their outputs converted form an array of 1/null values
// into a decimal value for reading
var deviceIsBus = function(label){
            let i = iOfLabelInData(label);
            if(i===null) throw('device with label '+label+' not found')
            if( data.devices[i]['isBus'] ) {
                return data.devices[i]['isBus'];
            }
            return false;
};

//returns the labels of all the pins which need to be set for this test
var getPinsToSet = function(testobj){
    var labels = testobj[0];
    var answer = [];
    for(var i in labels){
        var pinLabel = labels[i];
        var pinIndex = iOfLabelInData( pinLabel )
        if(inputPinTypes.includes( data.devices[pinIndex].type ) && labels[i]!=="CLOCK")
            answer.push(labels[i])
    }
    return answer;
}

//returns the labels of all the pins we need to check for this test
var getPinsToCheck = function(testobj){
var labels = testobj[0];
    var answer = [];
    for(var i in labels){
        var pinLabel = labels[i];
        var pinIndex = iOfLabelInData( pinLabel )
        if(!inputPinTypes.includes( data.devices[pinIndex].type ))
            answer.push(labels[i])
    }
    return answer;
}

// a call to tester returns a results object as follows:
// passed:true/false if all tests ran correctly
// head: an array of strings which are the labels of the devices in our circuit
// test results[], where each element is a string which describes the expected and actual values, followed by a check or x for pass/fail

//testobj is formatted as follows:
// first line ['label0','label1','labeln']
// if the first device is labeled "clock", we must run a clocked test
// each subsequent line is the expected values for each label

// this works using a promise chain, evaluating each test. reject the chain on the first failed test. 

var runTest = function(testobj){
    return new Promise(function(resolve,reject){
        // get the current state of the board (devices and connections)
        data = simcir.controller($('#circuitBox').find('.simcir-workspace')).data();

        let numTests = testobj.length-1;
        let devicesToSet = getPinsToSet(testobj);
        let devicesToCheck = getPinsToCheck(testobj);
        let output = {};
        output['head'] = testobj[0];
        output['results'] = [];
        output['passed'] = true;
        let isClockedTest = testobj[0].includes("CLOCK");


        //indOfLabel in our answer row
        let indOfLabel = {}; 
        for(let i = 0;i<testobj[0].length;i++){
           let devName = testobj[0][i];
            indOfLabel[devName] = testobj[0].indexOf(devName);
        }
        
       
        
        //test are as follows [clock, in0, in1, in2, in_n, out1, out2, out_n]
        var runSingleTest =function(i){
                return new Promise(function(resolve, reject) {
                    let promiseArray = [];
                    //pushing set pins into results object
                    let inputs = [];
                    let expected = [];
                    let actual = [];

                    for(let j = 0;j<devicesToSet.length;j++){
                        
                        let valueToSet;
                        let devLabel = devicesToSet[j];
                        let z = indOfLabel[devLabel]; //index in our test row
                        let isBus = deviceIsBus( devLabel );

                        if( isBus ){
                            valueToSet = testobj[i][ z ];
                        }else{
                            valueToSet = testobj[i][ z ] ? true : false;
                        }
                        
                        if(! isBus )
                            valueToSet = boolToBin(valueToSet);
                        inputs.push(valueToSet);
                        promiseArray.push( setState( devLabel ,  valueToSet) )
                    }
                   // get all results from the test
                   Promise.all( promiseArray )
                   .then( ()=> {
                        return new Promise(function(resolve, reject) {
                            //adding set pin to output
                            for(let j = 0;j<devicesToCheck.length;j++){
                                let devLabel = devicesToCheck[j];
                                let actualValue = getState(devLabel); 
                                actual.push( actualValue );
                                let z = indOfLabel[devLabel]; //index in our test row
                                let expectedValue = testobj[i][z]; // look at our array of tests. find the i'th test, element z is our output
                                expected.push ( expectedValue )
                                if(actualValue !== expectedValue && expectedValue!=='*' ){ //'*' is wildcard, any value is acceptable
                                    output['passed'] = false;
                                }
                            }
                            resolve();
                        }); 
                    })
                    .then(()=> {
                        
                        
                        
                        if(!output['passed']){
                            output['results'].push ('Expected: '+testobj[i].toString());
                            output['results'].push ('Recieved: '+ [inputs,actual].toString() ); 
                            reject(); 
                        }else{
                            output['results'].push ( testobj[i].toString() ); 
                            resolve();
                        }
                        
                    });
                });
        };

        let clockOn; 
        let clockOff;

        let chain = Promise.resolve();

        if(isClockedTest){
            clockOn = function(){ return setClock(1); };
            clockOff = function(){ return setClock(0); };


        
        
        }
        
        //check each test, push the values into our output 
        //run all our tests
        for(let i = 1;i<testobj.length-1;i++){
            
            // set input pins
            chain=chain.then( ()=> {
                return runSingleTest(i) 
            } );
            //console.log(i)
            
        //set the clock
            if(isClockedTest){
                //tick tock
                chain = chain.then( ()=> {
                // If the time label has a '+', we are on clock-high, and should enable the clock so that
                // clocked chips can have their outputs updated. 
                if( testobj[i][0].includes('+') ){ 
                    return clockOn();
                }
                return clockOff();
            });

            }
            
            

        }
            chain=chain.then( () => {
                resolve ( output );
            });
            chain.catch((err)=>{
                resolve ( output );
            });
    });
}





        
        
        
    


  

