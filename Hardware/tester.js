var TEST = function(){ 
var self = this;

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
        while(self.instructionIndex<self.instructions.length && !self.testOver){
            
            self.chain=self.chain.then( ()=> { return runSingleTest() } );
        }


        self.chain=self.chain.then( () => {
                resolve ( output );
            });
            self.chain.catch((err)=>{
            	console.log(err)
                resolve ( output );
            });

};

var tickTock = function(){
        	//set the clock
            if(self.isClockedTest){
                //tick tock
                chain = chain.then( ()=> {
                // If the time label has a '+', we are on clock-high, and should enable the clock so that
                // clocked chips can have their outputs updated. 
                if( self.instruction[self.instructionIndex].includes('+') ){ 
                    return clockOn();
                }
                return clockOff();
            });

            }
        };
var setAllDevices = function(){
	return new Promise(function(resolve, reject) {

		let promiseChain = Promise.resolve();
        let j = self.instructionIndex;
		for(let i = 0;i<self.devicesToSet.length;i++){
            let valueToSet;
            let devLabel = self.devicesToSet[i];
            let z = self.indOfLabel[devLabel]; // the index in our instruction row of this device
            let isBus = deviceIsBus( devLabel );

            if( isBus ){
                valueToSet = self.instructions[j][ z ];
            }else{
                valueToSet = self.instructions[j][ z ] ? true : false;
            }
            
            if(! isBus )
                valueToSet = boolToBin(valueToSet);

            promiseChain = promiseChain.then( () => {return setState( devLabel ,  valueToSet);} );
        }
        promiseChain = promiseChain.then( () => { resolve(); } );
        promiseChain.catch( (err) => {console.log(err); reject(); } );
	});
};

var getAllOutputs = function(){
	// get all results from the test
	return new Promise(function(resolve, reject) {
        let outputs = [];
		try{
			let promiseChain = Promise.resolve();
	        
	        //adding set pin to output
	        for(let i = 0;i<self.devicesToCheck.length;i++){
	            let devLabel = self.devicesToCheck[i];
	            let actualValue = getState(devLabel); 
	            outputs.push( actualValue )
	        }
            self.outputs.push(outputs);
	        resolve();
		}catch(err) {console.log(err); reject();}
	});
        
};

var checkActualAgainstExpectedOuts = function(){
	return new Promise(function(resolve, reject) {
		try{
			let j = self.instructionIndex;
			let expectedValues = [];
            let actualLine = self.outputs[ self.outputs.length-1 ];

			for(let i = 0;i<self.devicesToCheck.length;i++){
		            let devLabel = self.devicesToCheck[i];
		            let z = self.indOfLabel[devLabel]; //index in our test row
		            let expectedValue = self.instructions[ j ][ z ]; // look at our array of tests. find the j'th test, element z is our output
	                expectedValues.push(expectedValue)
	            if(actualLine[i] !== expectedValue && expectedValue!=='*' ){ //'*' is wildcard, any value is acceptable

	                self.passed = false;
                    self.outputs.push(expectedValues);
	            }
	        }
	        
	    	resolve();
		}catch(err) {console.log(err); reject();}
	});
};

        //returns the results of a single run of testing
        //test are as follows [clock, in0, in1, in2, in_n, out1, out2, out_n]
this.runSingleTest =function(){
                return new Promise(function(resolve, reject) {
                    
                    
                    let promiseChain = self.chain;

                    // set all input devices
                    promiseChain = promiseChain.then( ()=> {return setAllDevices();} );

                    // get all output devices state
                    promiseChain = promiseChain.then( ()=> {return getAllOutputs();} );

                    // log the output of our circuit and check against expected values
                    promiseChain = promiseChain.then( () => {
                    	
                    	return checkActualAgainstExpectedOuts(); 
                    });

                    // resolve after logging 
                    promiseChain = promiseChain.then( ()=>{

                        console.log(self);
                    	if(!self.passed || self.instructionIndex === self.instructions.length-1){
                    		self.testOver = true;
                            resolve();
                    	}

                        self.instructionIndex+=1;
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

        self.numTests = testobj.length-1;
        self.devicesToSet = getPinsToSet(testobj);
        self.devicesToCheck = getPinsToCheck(testobj);
        self.outputs = [];
        self.head = testobj[0];
        self.results = [];
        self.passed = true;
        self.isClockedTest = testobj[0].includes("CLOCK");
        self.instructions = testobj.slice(1);
        self.instructionIndex = 0;
        self.testOver = false;
        //indOfLabel in our answer row
        self.indOfLabel = {}; 
        for(let i = 0;i<self.head.length;i++){
           let devName = self.head[i];
            self.indOfLabel[devName] = self.head.indexOf(devName);
        }
        
        let clockOn; 
        let clockOff;

        self.chain = Promise.resolve();

        // clear any input pins to 0;
        for(let i in self.devicesToSet){
        	let devLabel = self.devicesToSet[i]
        	let zeroVal = deviceIsBus(devLabel) ? 0 : null;
        	self.chain=self.chain.then( ()=> {
                return setState(devLabel,zeroVal);
            } );
        }

        // if we have a clocked test, clean the clock to reset any lingering values
        if(self.isClockedTest){
            clockOn = function(){ return setClock(1); };
            clockOff = function(){ return setClock(0); };
            console.log('herro')
        }
        
        
    });
};





        
        }
        
    


  

