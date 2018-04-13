
class Computer{
    
    constructor(){
        this.CPU = new CpuEmulator();
        this.mFrameStart = 0;
        this.mFrameSize = 10;
        this.DEBUG = false;
    }
    
    loadRom(rom){
        this.CPU.loadRom(rom);
    }
    
    screenStart(context){
        
    }
    
    poke(addr,val){
        this.CPU.M[addr] = val;
    }
    
    //returns an image of the screen
    screen(context){
        if(!this.SCREEN){
            this.screenStart();
        }
        if(this.CPU.screenChanged){
            this.CPU.screenChanged = false;
            console.log(this.CPU.screenChange)
        }
        
    }
    
    execute(){
        
        this.CPU.execute();
        
    }
        
        
        getMemory(){
            if(this.DEBUG){
                console.log(this.CPU.M);
            }
            var m = {};
            for(var i = this.mFrameStart;i<this.mFrameSize;i++){
                m[i] = this.CPU.getM(i);
            }
            return m;
        }
    
    
    machineToAssembly(command){
        
        //A instruction
        if(command[0] === '0'){
            var dec = this.CPU.bin2dec(command);
            return '@'+dec;
        }
        else
        {
            if(command.slice(0,3)!=='111')
                throw("invalid command");
            //C instruction
            var cmp = command.slice(3,10);
            var dst = command.slice(10,13);
            var jmp = command.slice(13);
            
            
            jmp = this.CPU.bin2dec(jmp);
            jmp = this.CPU.jmp[jmp];
            cmp = this.CPU.cmd[cmp];
            if(!cmp){
                throw("Invalid Command")
            }
            dst = this.CPU.dst[dst];
            if(dst===''){
                return cmp+';'+jmp;
            }
                
            else{
                return dst+'='+cmp;
            }        
            }
            
            
            
    }
    
    
    
}
