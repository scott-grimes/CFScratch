// dff test is unique, cannot just set initial values. instead use calls to "update inputs"

var boolToBin = function(x){ return (x? 1:0); };

var data;

var getIndexOfLabel = function(label){
            for(var i = 0;i<data.devices.length;i++){
                if (data.devices[i]['label']===label)
                    return i;
            }
            return null;
        };
        //returns the device with a given id
var getDevice = function(id){ return simcir.controller($('#circuitBox').find('.simcir-workspace')).data().deviceFuncts[id]; }

var getState  = function(label){
            var i = getIndexOfLabel(label);
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

   
var setClock = function(value){
            
            return new Promise(function(resolve, reject) {
                var i = getIndexOfLabel('CLOCK');
                getDevice(i).trigger(value);
                    setTimeout(() => { 
                     resolve()}, 10); // (*)
            }); 
};
        
var setState = function(label,value){
            
            return new Promise(function(resolve, reject) {
                var i = getIndexOfLabel(label);
                getDevice(i).trigger(value);
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

// a call to tester returns a results object as follows:
// passed:true/false if all tests ran correctly
// head: a string of the form DEVICE(in1,in2,in3) = (out1,out2,out3)
// test results[], where each element is a string which describes the expected and actual values, followed by a check or x for pass/fail

// using a promise chain, evaluate each test. reject the chain on the first failed test. 

//builds the resulting string from a given test
var buildTestString = function(name, inputs, expected, actual){

    // device(inputs) = expectedouts | actualouts
    let str = name + '( ';
    for(let i = 0;i<inputs.length;i++){
        str+=inputs[i]+' , '
    }
    str = str.substring(0, str.length - 2); //remove last comma, replace with close of function
    str+= ') = ';

    if(expected.length>1){
        str+= '( '
    }

    for(let i = 0;i<expected.length;i++){
        str+=expected[i]+' ,'
    }
    str = str.substring(0, str.length - 1); //remove last comma, replace with close of function

    if(expected.length>1){
        str+= ')'
    }

    if(!actual) return str;

    str+=' | '

    if(actual.length>1){
        str+= '( '
    }

    for(let i = 0;i<actual.length;i++){
        str+=actual[i]+' ,'
    }
    str = str.substring(0, str.length - 1); //remove last comma, replace with close of function

    if(actual.length>1){
        str+= ')'
    }

    return str;

}

//returns an array of the expected outputs for a given test
var expectedOutputs = function(testobj,i){
    let outputs = []
    for(let j = 0;j<testobj['devicesToCheck'].length ;j++){
        var devName = testobj['devicesToCheck'][j];
        outputs.push( testobj[devName][i] );
    }
    return outputs;
}

var runTest = function(testobj){
    return new Promise(function(resolve,reject){
        // if we are using a device with a clock, run the alternate testing function
        if(testobj['clockedTest']) { 
            runClockedTest(testobj).then( (results) =>  {resolve(results) ;});
        }
        return;

        var numTests = testobj["number"];
        var devicesToSet = testobj["toSet"];
        var devicesToCheck = testobj["toCheck"];
        let output = {};
        output['head'] = buildTestString( testobj['name'], devicesToSet, devicesToCheck , null);
        output['results'] = [];
        output['passed'] = true;

        data = simcir.controller($('#circuitBox').find('.simcir-workspace')).data();
        
               

       
        
        var runSingleTest =function(i){
                return new Promise(function(resolve, reject) {
                    let promiseArray = [];
                    //pushing set pins into results object
                    let inputs = [];
                    let expected = [];
                    let actual = [];
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
                        inputs.push(valueToSet)
                    
                    }
                   // get all results from the test
                   Promise.all( promiseArray )
                   .then( ()=> {
                        return new Promise(function(resolve, reject) {
                            //adding set pin to output
                            for(let j = 0;j<devicesToCheck.length;j++){
                                let device = devicesToCheck[j];
                                let actualValue = getState(device); 
                                actual.push( actualValue )
                                let expectedValue = testobj[ device ][i];
                                expected.push ( expectedValue )
                                if(actualValue !== expectedValue ){
                                    output['passed'] = false;
                                }
                            }
                            resolve();
                        }); 
                    })
                    .then(()=> {

                        output['results'].push (buildTestString(testobj['name'],inputs,actual,expected) ); 
                        if(!output['passed'])
                            reject(); 
                        resolve();
                    });
                });
        };
        //promise chain of each test value
        var chain = Promise.resolve();

        //check each test, push the values into our output 
        //run all our tests
        for(let i = 0;i<numTests;i++){
            chain=chain.then( ()=> {
                return runSingleTest(i) 
            } );

        }
            chain=chain.then( () => {
                resolve ( output );
            });
            chain.catch((err)=>{
                resolve (output);
            });
    

    });
    
}


var runClockedTest = function(testobj){
    return new Promise(function(resolve,reject){
        
        let numTests = testobj["testArr"].length;
        let devicesToSet = testobj["toSet"];
        let devicesToCheck = testobj["toCheck"];
        let output = {};
        output['head'] = buildTestString( testobj['name'], devicesToSet, devicesToCheck , null);
        output['results'] = [];
        output['passed'] = true;
        output['clockedTest'] = true;
        
        data = simcir.controller($('#circuitBox').find('.simcir-workspace')).data();

        let indOfLabel = {};
        for(let i = 1;i<testobj['labels'].length;i++){
           let devName = testobj['labels'][i];
            indOfLabel[devName] = testobj['labels'].indexOf(devName);
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
                            valueToSet = testobj['testArr'][i][ z ];
                        }else{
                            valueToSet = testobj['testArr'][i][ z ] ? true : false;
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
                                let expectedValue = testobj['testArr'][i][z]; // look at our array of tests. find the i'th test, element z is our output
                                expected.push ( expectedValue )
                                if(actualValue !== expectedValue ){
                                    output['passed'] = false;
                                }
                            }
                            resolve();
                        }); 
                    })
                    .then(()=> {
                        
                        output['results'].push ( buildTestString(testobj['name'],inputs,actual,expected) ); 
                        
                        if(!output['passed'])
                            reject(); 
                        resolve();
                    });
                });
        };

        let clockOn = function(){ return setClock(1); };
        let clockOff = function(){ return setClock(0); };

        var chain = Promise.resolve();

        //clear the clock and any leftover outputs
        chain = chain
        .then( () => {return clockOff();} )
        .then( () => {return clockOn();} )
        .then( () => {return clockOff();} )

        //check each test, push the values into our output 
        //run all our tests
        for(let i = 0;i<numTests;i++){
            // set pins
            chain=chain.then( ()=> {
                return runSingleTest(i) 
            } );

            //tick tock
            chain = chain.then( ()=> {
                if(i%2===0){
                    return clockOn();
                }
                return clockOff();
            });

        }
            chain=chain.then( () => {
                resolve ( output );
            });
            chain.catch((err)=>{
                resolve ( output );
            });
    });
}





        
        
        
    


  

