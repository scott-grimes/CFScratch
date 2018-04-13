
class Computer{
    
    constructor(){
        this.CPU = new CpuEmulator();
        this.mFrameStart = 0;
        this.mFrameSize = 20;
        this.DEBUG = false;
        this.KEYBOARD = new Keyboard();
    }
    
    createScreen(ctx){
        this.SCREEN = new Screen(ctx);
    }
    
    linkKeyboard(canvas,keyvaluebox){
        canvas.addEventListener('keydown', (e) => {this.handlekeydown(e)}, false); //needed to keep 'this' context correct in handleeventfunctions
        canvas.addEventListener('keyup', (e) => {this.handlekeyup(e)}, false);
        this.keyvaluebox = keyvaluebox;
        this.keyvaluebox.value = this.KEYBOARD.getKeyChar();
    }
    
    loadRom(rom){
        this.CPU.loadRom(rom);
    }
    
    
    poke(addr,val){
        this.CPU.M[addr] = val;
    }
    
    
    execute(){
        
        this.CPU.execute();
        if(this.CPU.screenChanged){
            this.CPU.screenChanged = false;
            //console.log(this.CPU.screenChange)
            this.SCREEN.poke(this.CPU.screenChange[0],this.CPU.screenChange[1])
            this.CPU.screenChange = [];
        }
    }
    
    handlekeydown(event){
        var k = event.keyCode;
        this.KEYBOARD.handlekeydown(k);
        this.keyboardInterupt();
        
        
    }
    
    handlekeyup(event){
       
        this.KEYBOARD.handlekeyup();
        this.keyboardInterupt();
        
        
    }
    
    keyboardInterupt(){
        if(this.KEYBOARD.keyChanged){
            this.KEYBOARD.keyChanged = false;
            this.poke(24576,this.KEYBOARD.key)
            this.keyvaluebox.value = this.KEYBOARD.getKeyChar();
        }
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
