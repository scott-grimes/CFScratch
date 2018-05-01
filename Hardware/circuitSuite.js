
var CIRCUITSUITE = function(boardobject){return {
	
	// prevent clicking test while a test is already in progress
	TESTING : false,
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

 

    // takes a given testobject and the results of the tests and builds a table
    createTestResults : function(resultsOfTest){
    		let table = window.document.getElementById("testresultstable");
            table.innerHTML = '';
            let resultsMessage = resultsOfTest.passed ? 'Passed All Tests ✓' : 'One or More Tests Failed X';
            this.setTestingMessage(resultsMessage)
            console.log(resultsOfTest);
            return;
            let row = table.insertRow(0);
            let cell = row.insertCell(-1);
            cell.innerHTML = resultsOfTest.head;
            
            for(let i = 0;i<resultsOfTest.results.length;i++){
                let row = table.insertRow(-1);
                let cell = row.insertCell(-1);

                cell.innerHTML = resultsOfTest.results[i]
            }
    },

    setTestingMessage : function(message){

        window.document.getElementById("testResultsMessage").innerHTML = message;
    },
    
    test : function(){
        let data = this.getCircuitData();
        this.loadJSON('tests/'+data['deviceName']).then( testobj => {
            this.setTestingMessage('Testing...')
            if(this.TESTING) { return; }

            this.TESTING = true;
            runTest(testobj)
            .then((results)=>{
            
                this.createTestResults(results);
                    this.TESTING = false;

        })
        .catch(err=>{
            console.log('error',err); 
            this.TESTING = false;
        })



        })
        
        
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

        this.loadJSON(deviceName).then( data => {

        this.setTestingMessage('Click Start to test your device');
        data['deviceName'] = deviceName;
        data["width"] = 900;
        data["height"]=600;
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
    },

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
