var TEST = function(){ 

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

var runAllTests = function(){

		//check each test, push the values into our output 
        //run all our tests
        while(this.instructionIndex<this.instructions.length && !this.testOver){
            
            this.chain=this.chain.then( ()=> { return runSingleTest() } );
        }


        chain=chain.then( () => {
                resolve ( output );
            });
            chain.catch((err)=>{
            	console.log(err)
                resolve ( output );
            });

}

var tickTock = function(){
        	//set the clock
            if(this.isClockedTest){
                //tick tock
                chain = chain.then( ()=> {
                // If the time label has a '+', we are on clock-high, and should enable the clock so that
                // clocked chips can have their outputs updated. 
                if( this.instruction[this.instructionIndex].includes('+') ){ 
                    return clockOn();
                }
                return clockOff();
            });

            }
        };
var setAllDevices = function(){
	return new Promise(function(resolve, reject) {

		let promiseChain = Promise.resolve();
        let j = this.instructionIndex;

		for(let i = 0;i<this.devicesToSet.length;i++){
            let valueToSet;
            let devLabel = devicesToSet[i];
            let z = indOfLabel[devLabel]; // the index in our instruction row of this device
            let isBus = deviceIsBus( devLabel );

            if( isBus ){
                valueToSet = testobj[j][ z ];
            }else{
                valueToSet = testobj[j][ z ] ? true : false;
            }
            
            if(! isBus )
                valueToSet = boolToBin(valueToSet);

            promiseChain = promiseChain.then( () => {return setState( devLabel ,  valueToSet);} );
        }
        promiseChain = promiseChain.then( () => { resolve(); } );
        promiseChain.catch( (err) => {console.log(err); reject(); } );
	});
}

var getAllOutputs = function(){
	// get all results from the test
	return new Promise(function(resolve, reject) {
		try{
			let promiseChain = Promise.resolve();
	        let j = this.instructionIndex;
	        let outputs = [];
	        //adding set pin to output
	        for(let i = 0;i<this.devicesToCheck.length;i++){
	            let devLabel = devicesToCheck[j];
	            let actualValue = getState(devLabel); 
	            outputs.push( actualValue )
	        }
	        resolve(outputs);
		}catch(err) {console.log(err); reject();}
	});
        
}

var checkActualAgainstExpectedOuts = function(actual){
	return new Promise(function(resolve, reject) {
		try{
			let j = this.instructionIndex;
			let passed = true;
			let expectedValues = [];
			for(let i = 0;i<this.devicesToCheck.length;i++){
		            let devLabel = devicesToCheck[j];
		            let z = indOfLabel[devLabel]; //index in our test row
		            let expectedValue = this.instructions[ j ][ z ]; // look at our array of tests. find the i'th test, element z is our output
	                expectedValues.push(expectedValue)
	            if(actualValue[i] !== expectedValue && expectedValue!=='*' ){ //'*' is wildcard, any value is acceptable
	                console.log('expected',expectedValue,'actual',actualValue)
	                passed = false;
	            }
	        }
	        
	        let returnObj = {};
	    	returnObj['passed'] = passed;
	    	returnObj['expected'] = expectedValues;
	    	resolve(returnObj);
		}catch(err) {console.log(err); reject();}
	});
};




        //returns the results of a single run of testing
        //test are as follows [clock, in0, in1, in2, in_n, out1, out2, out_n]
this.runSingleTest =function(){
                return new Promise(function(resolve, reject) {
                    let promiseArray = [];
                    

                    let promiseChain = Promise.resolve();

                    // set all input devices
                    promiseChain.then( ()=> {return setAllDevices();} );

                    // get all output devices state
                    promiseChain.then( ()=> {return getAllOutputs();} );

                    // log the output of our circuit and check against expected values
                    promiseChain.then( (actualOuts) => {
                    	this.output.push(actualOuts);
                    	return checkActualAgainstExpectedOuts(actualOuts); 
                    });

                    // resolve after logging 
                    promiseChain.then( (results)=>{

                    	this.instructionIndex+=1;

                    	if(!results.passed){
                    		this.testOver = true;
                    		this.passed = false;
                    		this.output.push(results.expected);
                    	}
                    	resolve();
                    });
                });
            };

// a call to tester returns a results object as follows:
// passed:true/false if all tests ran correctly
// head: an array of strings which are the labels of the devices in our circuit
// test results[], where each element is a string which describes the expected and actual values, followed by a check or x for pass/fail

//testobj is formatted as follows:
// first line ['label0','label1','labeln']
// if the first device is labeled "clock", we must run a clocked test
// each subsequent line is the expected values for each label

// this works using a promise chain, evaluating each test. reject the chain on the first failed test. 

this.startTest = function(testobj){
    return new Promise(function(resolve,reject){

        // get the current state of the board (devices and connections)
        data = simcir.controller($('#circuitBox').find('.simcir-workspace')).data();

        this.numTests = testobj.length-1;
        this.devicesToSet = getPinsToSet(testobj);
        this.devicesToCheck = getPinsToCheck(testobj);
        this.output = [];
        this.head = testobj[0];
        this.results = [];
        this.passed = true;
        this.isClockedTest = testobj[0].includes("CLOCK");
        this.instructions = testobj.slice(1);
        this.instructionIndex = 0;
        this.testOver = false;

        //indOfLabel in our answer row
        let indOfLabel = {}; 
        for(let i = 0;i<testobj[0].length;i++){
           let devName = testobj[0][i];
            indOfLabel[devName] = testobj[0].indexOf(devName);
        }
        
        let clockOn; 
        let clockOff;

        this.chain = Promise.resolve();

        // clear any input pins to 0;
        for(let i in this.devicesToSet){
        	let devLabel = this.devicesToSet[i]
        	let zeroVal = deviceIsBus(devLabel) ? 0 : null;
        	this.chain=this.chain.then( ()=> {
                console.log('setting',devLabel,'to',zeroVal);
                return setState(devLabel,zeroVal);
            } );
        }

        // if we have a clocked test, clean the clock to reset any lingering values
        if(this.isClockedTest){
            clockOn = function(){ return setClock(1); };
            clockOff = function(){ return setClock(0); };
            console.log('herro')
        }
        
        
    });
}





        
        }
        
    


  

