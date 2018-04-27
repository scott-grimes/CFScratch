
var CIRCUITESUITE = function(boardobject){return {
	
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

    setUpResultsTable : function(testobj){
    	// erases the base table of given and expected values for this device
        let table = window.document.getElementById("testresultstable");
        table.innerHTML = '';
        this.setTestingMessage('')
        //set up head of table

        // add column titles for all pin names to set
        let row = table.insertRow(0);
        for(let i = 0;i<testobj.toSet.length;i++){
            let cell = row.insertCell(-1);
            cell.innerHTML = testobj.toSet[i];
        }

        // add column titles for all pin names to check (expected values)
        for(let i = 0;i<testobj.toCheck.length;i++){
            let cell = row.insertCell(-1);
            cell.innerHTML = testobj.toCheck[i]+'<sub>exp</sub>';   
        }
        // add column titles for all pin names to check (actual values)
        for(let i = 0;i<testobj.toCheck.length;i++){ 
            let cell = row.insertCell(-1);
            cell.innerHTML = testobj.toCheck[i]+'<sub>act</sub>';   
        }
        //results cell for checkboxes
        row.insertCell(-1);


        
        //set up cells in our table to display what inputs are being used
        //fill setter cells
        for(let test = 0;test<testobj.number;test++){
            let row = table.insertRow(-1);
            for(let i = 0;i<testobj.toSet.length;i++){
                let cell = row.insertCell(-1);
                cell.innerHTML = testobj[ testobj.toSet[i] ][test];
            }
            //fill checker cells with expected value
            for(let i = 0;i<testobj.toCheck.length;i++){
                let cell = row.insertCell(-1);
                cell.innerHTML = testobj[ testobj.toCheck[i] ][test];
                
            }
            //create blank checker cells for actual value
            for(let i = 0;i<testobj.toCheck.length;i++){
                let cell = row.insertCell(-1);
                cell.innerHTML = ' ';
                cell.id = testobj.toCheck[i]+'_'+test;

            }
            row.insertCell(-1); //box at end for checkboxes
        }
        
        
    },

    // takes a given testobject and the results of the tests and builds a table
    createTestResults : function(testobj,results){
    		this.setUpResultsTable(testobj);

            let t = window.document.getElementById("testresultstable");
            
            var passedAll = true;
            var rowlen = t.rows[1].cells.length; 
            
            for(let testNumber = 0;testNumber<results["number"];testNumber++){
                let row = t.rows[testNumber+1];
                for(let i = 0;i<results["devicesToCheck"].length;i++){
                    
                    let dev = results["devicesToCheck"][i];
                    if( results[dev][testNumber] !== testobj[dev][testNumber]){

                        passedAll=false;
                        row.cells[rowlen-1].innerHTML = "X";

                    }else{

                        row.cells[rowlen-1].innerHTML = "✓";

                    }

                    row.cells.namedItem( dev+'_'+testNumber).innerHTML = results[ dev ][testNumber];
                }
            }

            var resultsMessage = window.document.getElementById("testResultsMessage");
            resultsMessage.innerHTML = passedAll ? 'Passed All Tests ✓' : 'One or More Tests Failed X';
    },

    setTestingMessage : function(message){

        window.document.getElementById("testResultsMessage").innerHTML = message;
    },
    
    test : function(){

        this.setTestingMessage('Testing...')
        if(this.TESTING) { return; }

        this.TESTING = true;

        var data = this.getCircuitData();

        runTest(data.tests)
        .then(results=>{
            this.createTestResults(data.tests,results);
            this.TESTING = false;

        })
        .catch(err=>{
        	console.log('error',err); 
        	this.TESTING = false;
        })
        
    },
  
    setLibrary : function(deviceName){
       
        this.setTestingMessage('Click Start to test your device');
        var data = {};
        data["width"] = 900;
        data["height"]=600;

        if(devices[deviceName]){
            	data["toolbox"] =toolboxes[deviceName];
            	data["devices"] = devices[deviceName]["devices"];
                data["connectors"] = devices[deviceName]["connectors"]
                data["tests"] = devices[deviceName]["tests"]
        }
        this.$s.setupSimcir(this.$mysim,data)

        // erases the base table of given and expected values for this device
        let table = window.document.getElementById("testresultstable")
        table.innerHTML = "";

         //If we are looking at the DFF circuit, get the clock device and trigger twice to clear the output pin (recursion issue)
        if(deviceName=== "DFF"){
            //get device index for the Clock
            let i;
            for(i = 0;i<data.devices.length;i++){
                if (data.devices[i]['label']==='CLK')
                    break;
            }
            //trigger the clock twice to zero out the circuit, with a delay to allow the values to propigate
            window.setTimeout(function(){this.$s.controller(this.$mysim.find('.simcir-workspace')).data().deviceFuncts[4].trigger();}, 30);
            window.setTimeout(function(){this.$s.controller(this.$mysim.find('.simcir-workspace')).data().deviceFuncts[4].trigger();}, 60);
        }

        return;
    },

}
}
