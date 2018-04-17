// given an array of vm files {fileName: 'name', data: 'data'}
// outputs an assembly file 

class Parser{
    
    constructor(files){
        this.UniqueLabelID = 0;
        this.output = [];
        //if Sys.vm is in our files, bootstrap Sys.init call
        for(var i = 0;i<files.length;i++){
            if (files[i].fileName=== 'Sys.vm'){
                this.writeInit();
                break;
            }
        }
        
        // for each file, open it and write our assembly code
        for(var i = 0;i<files.length;i++){
            this.fileName = files[i].fileName;
            var lines = files[i].data.split('\n');
            for(var j = 0;j<lines.length;j++){
                this.currentReadingLine = j; //used to debug throws
                var line = lines[j].split('//')[0];
                if(lines!=='')
                    this.buildLine(line)
            }
            
            
        }
        
    }
    
    arg1(line){
        var parts = line.split(' ');
        if(this.commandType(line)=== 'arithmetic'){
            return parts[0];
        }
        return parts[1];
    }
        arg2(line){
            var parts = line.split(' ')
            return parseInt(parts[2]);
        }
    
    buildLine(line){
        
        var c = this.commandType(line);
        if(c === 'push' || c === 'pop')
            this.writePushPop(line)
            
        else if (c === 'arithmetic')
            this.writeArithmetic(line)
        
        else if (c === 'label')
            this.writeLabel(this.arg1(line))
        else if (c === 'goto')
            this.writeGoto(this.arg1(line))
        
        else if (c === 'function')
            this.writeFunction(this.arg1(line),this.arg2(line))
        else if (c === 'if')
            this.writeIf(this.arg1(line))
        else if (c === 'return')
            this.writeReturn()
        else if (c === 'call')
            this.writeCall(this.arg1(line),this.arg2(line))
        else 
            throw("Line:"+ this.currentReadingLine+" Unknown command type!")
        
    }        
    
    //maybe be explicit about location of string? don't just look for includes
    commandType(line){
        if (line.includes('push')) return 'push';
        if (line.includes('pop')) return 'pop';
        if (line.includes('label')) return 'label';
        if (line.includes('if')) return 'if';
        if (line.includes('goto')) return 'goto';
        if (line.includes('function')) return 'function';
        if (line.includes('return')) return 'return';
        if (line.includes('call')) return 'call';
        
        return 'arithmetic';
    }
        
     writeArithmetic(line){
        // add, sub, neg, eq, gt, lt, and, or not
        this.output.push("@SP")
        this.output.push("M=M-1")
        this.output.push("A=M")
        this.output.push("D=M")
        this.output.push("M=0")
        var parsed = line.replace(' ','')
        // D is now the top number in stack. sp points to blank "top of stack"
        if( parsed.includes('add') ){
            this.output.push("@SP")
            this.output.push("M=M-1")
            this.output.push("A=M")
            this.output.push("M=M+D")
        }
            
        
        if( parsed.includes('sub') ){
            this.output.push("@SP")
            this.output.push("M=M-1")
            this.output.push("A=M")
            this.output.push("M=M-D")
        }
            
        
        if( parsed.includes('neg') ){
            this.output.push("M=-D")
        }
            
        //what about other comparisons?
        if( parsed.includes('eq') || parsed.includes('gt') || parsed.includes('lt') ){
             // equal to, greater than, or less than by subtracting D and M
            this.output.push("@SP")
            this.output.push("M=M-1")
            this.output.push("A=M")
            this.output.push("D=M-D") // D has the stack subtraction
            this.output.push("@LogicWasTrue"+this.UniqueLabelID)
            this.writeLogicTest(parsed)
            this.output.push("@SP")
            this.output.push("A=M")
            this.output.push("M=0")
            this.output.push("@EndLogic"+this.UniqueLabelID)
            this.output.push("0;JMP")
            this.output.push("(LogicWasTrue"+this.UniqueLabelID+")")
            this.output.push("@SP")
            this.output.push("A=M")
            this.output.push("M=-1")
            this.output.push("(EndLogic"+this.UniqueLabelID+")")
            this.UniqueLabelID+=1
        }
           
       
        if(parsed.includes('and')){
            this.output.push("@SP")
            this.output.push("M=M-1")
            this.output.push("A=M")
            this.output.push("M=M&D")
        }
            
        
        if(parsed.includes('or')){
            this.output.push("@SP")
            this.output.push("M=M-1")
            this.output.push("A=M")
            this.output.push("M=M|D")
        }
            
        
        if(parsed.includes('not')){
            this.output.push("M =!D")
        }
          
    
        // increments SP, to tpoint to blank part of top of stack
        this.output.push("@SP")
        this.output.push("M=M+1")
        this.output.push("A=M")
    
         
         
     }
    
    //what about other logics? 
        writeLogicTest(logic){
            if (logic === 'eq')
            this.output.push("D;JEQ")
        else if (logic ==='gt')
            this.output.push("D;JGT")
        else if (logic === 'lt')
            this.output.push("D;JLT")
        }
    
    writePushPop(line){
        //push command
        if(this.commandType(line)=== 'push'){
            //pushes a variable onto the stack
            if(this.arg1(line) === "constant"){
                //if pushing a constant...
                this.output.push("@"+this.arg2(line))
                this.output.push("D=A")
                this.output.push("@SP")
                this.output.push("M=M+1")
                this.output.push("A=M-1")
                this.output.push("M=D")
                return
            }
                
            
            if(this.arg1(line) === 'static'){
                this.output.push("@"+this.fileName+"."+this.arg2(line))
                this.output.push("D=M")
                this.output.push("@SP")
                this.output.push("M=M+1")
                this.output.push("A=M-1")
                this.output.push("M=D")
                return
            }
                
        
            
            //pushing some value in a location onto the stack
            this.output.push("@"+this.arg2(line)) //A = index of segment
            this.output.push("D=A")
            var arg1 = this.arg1(line)
            
            if(arg1 === "argument") this.output.push("@ARG")
            if(arg1 === "local")    this.output.push("@LCL")
            if(arg1 === "this")     this.output.push("@THIS")
            if(arg1 === "that")     this.output.push("@THAT")
            if(arg1 === "pointer")  this.output.push("@THIS")
            if(arg1 === "temp")     this.output.push("@5")
            if(arg1 === "temp" || arg1 === "pointer")
                this.output.push("A=A+D")
            else
                this.output.push("A=M+D")
            
            this.output.push("D=M")
            this.output.push("@SP")
            this.output.push("A=M")
            this.output.push("M=D")
            
            //pushed onto stack, now increment sp
            this.output.push("@SP")
            this.output.push("M=M+1")
            this.output.push("A=M")
            
            return
        }
        else if(this.commandType(line) === 'pop' ){
            
            // command was a pop command
            
            // pops the current value into D
            this.output.push("@SP")
            this.output.push("M=M-1")
            this.output.push("A=M")
            this.output.push("D=M")
            this.output.push("M=0")
            
            // find the storage location and store D into it
            var arg1 = this.arg1(line)
            if(arg1 === "argument")  this.output.push("@ARG")
            if(arg1 === "local")     this.output.push("@LCL")
            if(arg1 === "this")      this.output.push("@THIS")
            if(arg1 === "that")      this.output.push("@THAT")
            if(arg1 === "pointer")   this.output.push("@THIS")
            if(arg1 === "temp")      this.output.push("@5")
            if(arg1 === "static"){
                this.output.push("@"+this.fileName+"."+this.arg2(line))
                this.output.push("M=D")
                return
            }
                
            
            if(!(arg1 === "temp" || arg1 === "pointer"))
                this.output.push("A=M")
            for(var i = 0;i<this.arg2(line);i++)
               this.output.push("A=A+1") //finds the index inside the segment needed
            
            this.output.push("M=D")
        return
        }
        throw("not a push or pop");
    }
        
    writeLabel(label){
        this.output.push('('+this.fileName+"$"+label+')')
    }
    
    writeInit(){
        this.output.push('@256')
        this.output.push('D=A')
        this.output.push('@SP')
        this.output.push('M=D')
        this.writeCall('Sys.init',0)
    }
    
    writeGoto(label){
        this.output.push('@'+this.fileName+'$'+label)
        this.output.push("0;JMP")
    }
    
    writeIf(label){
        this.output.push("@SP")
        this.output.push("M=M-1")
        this.output.push("A=M")
        this.output.push("D=M")
        this.output.push("M=0")
        //if D==0 continue on, otherwise jump to the requesteddestination
        this.output.push("@gotoif."+this.UniqueLabelID)
        this.output.push("D;JEQ")
        this.output.push("@"+this.fileName+"$"+label)
        this.output.push("0;JMP")
        this.output.push("(gotoif."+this.UniqueLabelID+")")
        this.UniqueLabelID+=1
    }
    
    writeCall(functionName,numArgs){
        // before this is called n arguments should have been pushed onto stack
        //
        // push a return address using label declared at bottom 
        this.output.push("@returnNum"+this.UniqueLabelID)
        this.output.push("D=A")
        this.output.push("@SP")
        this.output.push("M=M+1")
        this.output.push("A=M-1")
        this.output.push("M=D")
        //push lcl
        this.output.push("@LCL")
        this.pushM()
        //push arg
        this.output.push("@ARG")
        this.pushM()
        //push this
        this.output.push("@THIS")
        this.pushM()
        //push that
        this.output.push("@THAT")
        this.pushM()
        //arg = SP-n-5 (n is the number of arguments for the new function
        this.output.push("@SP")
        this.output.push("D=M")
        this.output.push("@"+(5+numArgs))
        this.output.push("D=D-A")
        this.output.push("@ARG")
        this.output.push("M=D")
        //lcl = sp
        this.output.push("@SP")
        this.output.push("D=M")
        this.output.push("@LCL")
        this.output.push("M=D")
        //goto f (the function)
        this.output.push("@"+functionName)
        this.output.push("0;JMP")
        //(return address label)
        this.output.push("(returnNum"+this.UniqueLabelID+")")
        this.UniqueLabelID+=1
    }
    
    pushM(){
        this.output.push("D=M")
        this.output.push("@SP")
        this.output.push("M=M+1")
        this.output.push("A=M-1")
        this.output.push("M=D")
        }
    
    writeReturn(){
        // FRAME = LCL
        this.output.push("@LCL")
        this.output.push("D=M")
        this.output.push("@FRAME")
        this.output.push("M=D")
        
        // RET = *(Frame-5)
        this.output.push("@5")
        this.output.push("D=A")
        this.output.push("@FRAME")
        this.output.push("A=M-D")
        this.output.push("D=M") // D not has the return address saved
        this.output.push("@RET")
        this.output.push("M=D")
        
        // *ARG = pop()
        this.output.push("@SP")
        this.output.push("A=M-1")
        this.output.push("D=M") // d is the return value now
        this.output.push("M=0")
        this.output.push("@ARG")
        this.output.push("A=M")
        this.output.push("M=D")
        
        // SP = ARG+1
        this.output.push("@ARG")
        this.output.push("D=M+1")
        this.output.push("@SP")
        this.output.push("M=D")
        
        // that = *(frame-1)
        this.output.push("@1")
        this.output.push("D=A")
        this.output.push("@FRAME")
        this.output.push("A=M-D")
        this.output.push("D=M") 
        this.output.push("@THAT")
        this.output.push("M=D")
        
        // this = *(frame-2)
        this.output.push("@2")
        this.output.push("D=A")
        this.output.push("@FRAME")
        this.output.push("A=M-D")
        this.output.push("D=M") 
        this.output.push("@THIS")
        this.output.push("M=D")
        
        // arg = *(frame-3)
        this.output.push("@3")
        this.output.push("D=A")
        this.output.push("@FRAME")
        this.output.push("A=M-D")
        this.output.push("D=M") 
        this.output.push("@ARG")
        this.output.push("M=D")
        
        // lcl = *(frame-4)
        this.output.push("@4")
        this.output.push("D=A")
        this.output.push("@FRAME")
        this.output.push("A=M-D")
        this.output.push("D=M") 
        this.output.push("@LCL")
        this.output.push("M=D")
        
        // go to RET
        this.output.push("@RET")
        this.output.push("A=M")
        this.output.push("0;JMP")
    }
    
    writeFunction(functionName,numLocals){
        // label f (the function)
        this.output.push('('+functionName+')')
        for(var i = 0;i<numLocals;i++){
            this.output.push('@SP')
            this.output.push('M=M+1')
            this.output.push('A=M-1')
            this.output.push('M=0')
        }
            
    }
}
