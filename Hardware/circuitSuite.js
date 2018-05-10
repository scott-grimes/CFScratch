
var CIRCUITSUITE = function(boardobject){
	
	// prevent clicking test while a test is already in progress
	var $s = simcir;
	var $mysim = boardobject;
	var self = this;

    // returns the current state of the circuit board/
	// all the devices and connections, etc
    var getCircuitData = function(){
    	return $s.controller( $mysim .find('.simcir-workspace') ).data();
  	};    
    // given a data object, replace the current board with all of the
    // connections and devices in our data object
    var setCircuitData = function(data){
    	$s.setupSimcir( $mysim , data );
    };

    var clearTestResults = function(){

        let table = window.document.getElementById("testresultstable");
        table.innerHTML = '';

    };

    // runs a single step. if there is output, display the output.
    //if this step terminates testing mode (if the test failed, or was the last instruction), call stoptestingmode
    this.step = function(){
    	return new Promise(function(resolve, reject) {
    		if(self.TEST.testOver){
    			return self.stopTestingMode();
    		} 

        	self.TEST.runSingleTest()
        	.then( (testoutput)=>{
        		if(testoutput){
        			return showStepResult(testoutput);
        		}
        		return self.stopTestingMode();
        	})
        	.then(()=>{resolve();})
    	});

    };
    

    this.fastForward = function(){
    	return new Promise(function(resolve, reject) {
        //if(!this.ALLOW_CLICKS) return;
        //tnis.ALLOW_CLICKS = false;

        window.document.getElementById("stepButton").disabled = true;
        window.document.getElementById("fastForwardButton").disabled = true;
        var chain = Promise.resolve();
        var start = self.TEST.instructionIndex;
        var end = self.TEST.instructions.length;
        for(let i = start;i<end;i++)
        {
        	 chain = chain.then(()=>{return self.step();});
        }
       	chain = chain.then(()=>{resolve();})
        });
    };

    // takes a row of output and logs it something with it. 
    // if returns false if nothing was printed
    var showStepResult = function(testoutput){
		return new Promise(function(resolve, reject) {
			if(!testoutput) resolve();
    		let table = window.document.getElementById("testresultstable");
    		console.log(testoutput.toString())

    		if(self.TEST.killed){
    			setTestingMessage('Test Halted');
                return self.stopTestingMode();
    		}
            else if(self.TEST.testOver){
                let resultsMessage = self.TEST.passed ? 'Passed All Tests ✓' : 'One or More Tests Failed X';
                setTestingMessage(resultsMessage);
                return self.stopTestingMode();
            }

            resolve(); 
            /*
            let row = table.insertRow();
            let cell = row.insertCell(-1);
            cell.innerHTML = resultsOfTest.head;
            
            for(let i = 0;i<resultsOfTest.results.length;i++){
                let row = table.insertRow(-1);
                let cell = row.insertCell(-1);

                cell.innerHTML = resultsOfTest.results[i]
            }
            */
    	});
    };

    var setTestingMessage = function(message){

        window.document.getElementById("testResultsMessage").innerHTML = message;
    };

    //user triggered stop of testing mode

    this.killTestingMode = function(){
        self.TEST.testOver=true;
        self.TEST.killed = true;
        setTestingMessage('Testing Halted')
        self.stopTestingMode();
    };

    // disables testing mode
    this.stopTestingMode = function(){
    	return new Promise(function(resolve, reject) {
            window.document.getElementById("startTestButton").disabled = false;
            window.document.getElementById("stopTestButton").disabled = true;
            window.document.getElementById("stepButton").disabled = true;
            window.document.getElementById("fastForwardButton").disabled = true;
            self.ALLOW_CLICKS = true;
            resolve();
        });
    };
    
    this.startTestingMode = function(){
        try{
            self.TEST = new TEST();

            setTestingMessage('Click Step or Fast Forward');

            self.ALLOW_CLICKS = false;

            window.document.getElementById("startTestButton").disabled = true;
            window.document.getElementById("stopTestButton").disabled = false;
            window.document.getElementById("stepButton").disabled = false;
            window.document.getElementById("fastForwardButton").disabled = false;

            let data = getCircuitData();

            loadJSON('tests/'+data['deviceName']).then( testobj => {
                 return self.TEST.startTest(testobj);

            })
            .then((head)=>{
            	showStepResult(head);
            });

        }catch(err){
                console.log('error',err); 
                self.stopTestingMode();
        }
    };

    //sets the device with the given label to value  
    var setDevice = function(label,value){
        let data = getCircuitData();
        let triggerDevice = function(id){ simcir.controller(boardobject.find('.simcir-workspace')).data().deviceFuncts[id].trigger(value);} 
            return new Promise(function(resolve, reject) {
                var id = null;
                // get the index of the device based on the label
                for(let i = 0;i<data.devices.length;i++){
                if (data.devices[i]['label']===label){
                    id = i;
                    break;
                }
                }
                triggerDevice(id);
                
                setTimeout(() => { 
                     resolve()}, 60); // (*)
            }); 
    };
  
    this.setLibrary = function(deviceName){
        self.stopTestingMode();
        let data = null;
        loadJSON(deviceName).then( returned => {
            data = returned;
        })
        .then( () => {return loadJSON('toolboxes/'+deviceName); } )
        .then((toolboxObj) =>{

            setTestingMessage('Click Start to test your device');
            data['deviceName'] = deviceName;
            data["width"] = 900;
            data["height"]=600;
            data["toolbox"] = toolboxObj;
            $s.setupSimcir($mysim,data)
            // erases the base table of given and expected values for this device
            let table = window.document.getElementById("testresultstable")
            table.innerHTML = "";


            // if the device we are checking is the DFF, 
            // clear the clock. due to the recursive nature of the output of DFF
            // it is incorrectly set upon loading
            if(data['deviceName']==='DFF'){
                setDevice("CLOCK",0)
                .then( () => {return setDevice("CLOCK",1);} )
                .then( () => {return setDevice("CLOCK",0);} )
            }

        });

        
            return;
        };

        
        
    

    //hacky  method to load json. need to fix
    var loadJSON = function(deviceName) {
    return new Promise(function(resolve,reject){
        var request = new XMLHttpRequest();
        var loc = window.location.pathname;
        var dir = loc.substring(0, loc.lastIndexOf('/')); //hacky method of geting local file
    request.open("GET", dir+"/devices/"+deviceName+'.json');
    request.onreadystatechange = function() {
        if (this.readyState ===4) { //done
            if (this.responseText) { 
                resolve(JSON.parse(this.responseText))
            }
            else {
                throw('data is empty')
                reject()
            }
        }
    };
    request.send();
});         
    };
};
