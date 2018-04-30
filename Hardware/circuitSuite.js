
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
    
    test : function(deviceName){
        loadJSON()
        this.setTestingMessage('Testing...')
        if(this.TESTING) { return; }

        this.TESTING = true;

        var data = this.getCircuitData();

        runTest(data.tests)
        .then((results)=>{
            
            this.createTestResults(results);
            this.TESTING = false;

        })
        .catch(err=>{
        	console.log('error',err); 
        	this.TESTING = false;
        })
        
    },
  
    setLibrary : function(deviceName){

        this.loadJSON(deviceName).then( data => {
            console.log(data);

        this.setTestingMessage('Click Start to test your device');

        data["width"] = 900;
        data["height"]=600;
        this.$s.setupSimcir(this.$mysim,data)
        // erases the base table of given and expected values for this device
        let table = window.document.getElementById("testresultstable")
        table.innerHTML = "";

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
