
var CIRCUITSUITE = function(boardobject){return {
	
	// prevent clicking test while a test is already in progress
	$s : simcir,
	$mysim : boardobject,

    // returns the current state of the circuit board/
	// all the devices and connections, etc
    getCircuitData : function(){
    	return this.$s.controller( this.$mysim .find('.simcir-workspace') ).data();
  	},
    
    // given a data object, replace the current board with all of the
    // connections and devices in our data object
    setCircuitData : function(data){
    	this.$s.setupSimcir( this.$mysim , data );
    },

    clearTestResults : function(){

        let table = window.document.getElementById("testresultstable");
        table.innerHTML = '';

    },

    step : function(){
        //=if(!this.ALLOW_CLICKS) return;
        //this.ALLOW_CLICKS = false;
        window.document.getElementById("fastForwardButton").disabled = true;
        window.document.getElementById("stepButton").disabled = true;

        this.TEST.runSingleTest().then( ()=>{
            window.document.getElementById("fastForwardButton").disabled = false;
            window.document.getElementById("stepButton").disabled = false;
        	this.addTestResult();
        }).catch((err)=>{ console.log(err); 
			window.document.getElementById("fastForwardButton").disabled = false;
            window.document.getElementById("stepButton").disabled = false;
        })

    },

    fastForward : function(){
        if(!this.ALLOW_CLICKS) return;
        this.ALLOW_CLICKS = false;
        window.document.getElementById("stepButton").disabled = true;
        window.document.getElementById("fastForwardButton").disabled = true;
        this.TEST.runAllTests().then(()=>{
        	return this.stopTestingMode();
        });
    },

    // takes a given testobject and the results of the tests and builds a table
    addTestResult : function(){
    		let table = window.document.getElementById("testresultstable");
            if(this.TEST.testOver){
            	console.log('test is stopping!')
                let resultsMessage = this.TEST.passed ? 'Passed All Tests ✓' : 'One or More Tests Failed X';
                this.setTestingMessage(resultsMessage);
                this.stopTestingMode();
                return;
            }
        	this.ALLOW_CLICKS = true;
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
    },

    setTestingMessage : function(message){

        window.document.getElementById("testResultsMessage").innerHTML = message;
    },

    stopTestingMode : function(){

            window.document.getElementById("startTestButton").disabled = false;
            window.document.getElementById("stopTestButton").disabled = true;
            window.document.getElementById("stepButton").disabled = true;
            window.document.getElementById("fastForwardButton").disabled = true;
            this.ALLOW_CLICKS = true;
            console.log('ended')

    },
    
    startTestingMode : function(){
        try{
            this.TEST = new TEST();

            this.setTestingMessage('Click Step or Fast Forward');

            this.ALLOW_CLICKS = false;

            window.document.getElementById("startTestButton").disabled = true;
            window.document.getElementById("stopTestButton").disabled = false;
            window.document.getElementById("stepButton").disabled = false;
            window.document.getElementById("fastForwardButton").disabled = false;

            let data = this.getCircuitData();

            this.loadJSON('tests/'+data['deviceName']).then( testobj => {
                 this.TEST.startTest(testobj)
            });

        }catch(err){
                console.log('error',err); 
                this.stopTestingMode();
        }
    },

    //sets the device with the given label to value  
    setDevice : function(label,value){
        let data = this.getCircuitData();
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
    },
  
    setLibrary : function(deviceName){
        this.stopTestingMode();
        let data = null;
        this.loadJSON(deviceName).then( returned => {
            data = returned;
        })
        .then( () => {return this.loadJSON('toolboxes/'+deviceName); } )
        .then((toolboxObj) =>{

            this.setTestingMessage('Click Start to test your device');
            data['deviceName'] = deviceName;
            data["width"] = 900;
            data["height"]=600;
            data["toolbox"] = toolboxObj;
            this.$s.setupSimcir(this.$mysim,data)
            // erases the base table of given and expected values for this device
            let table = window.document.getElementById("testresultstable")
            table.innerHTML = "";


            // if the device we are checking is the DFF, 
            // clear the clock. due to the recursive nature of the output of DFF
            // it is incorrectly set upon loading
            if(data['deviceName']==='DFF'){
                this.setDevice("CLOCK",0)
                .then( () => {return this.setDevice("CLOCK",1);} )
                .then( () => {return this.setDevice("CLOCK",0);} )
            }

        });

        
            return;
        }

        
        
    ,

    //hacky  method to load json. need to fix
    loadJSON : function(deviceName) {
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
    }
}
};
