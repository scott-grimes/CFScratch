
class Computer{
    
    constructor(){
        this.CPU = new CpuEmulator();
        this.mFrameStart = 0;
        this.mFrameSize = 20;
        this.DEBUG = false;
        this.KEYBOARD = new Keyboard();
        this.screenChanges = []; //screen is updated every few thousand cycles instead of every cycle to improve smoothness
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
    
    executeWithoutScreenUpdate(){
        this.CPU.execute();
        if(this.CPU.screenChanged){
            this.CPU.screenChanged = false;
            //console.log(this.CPU.screenChange)
            if(!this.screenChanges.includes(this.CPU.screenChange))
                this.screenChanges.push(this.CPU.screenChange);
            
        }
    }
    
    //called when there is a large list of screen changes to go through
    updateScreen(){
        for(var i = 0;i<this.screenChanges.length;i++){
            var m = this.CPU.M[ this.screenChanges[i] ];
            this.SCREEN.poke(this.screenChanges[i], this.CPU.dec2bin( m ))
        }
        this.screenChanges = [];
    }
    
    execute(){
        this.CPU.execute();
        if(this.CPU.screenChanged){
            this.CPU.screenChanged = false;
            var m = this.CPU.M[ this.CPU.screenChange ];
            this.SCREEN.poke(this.CPU.screenChange , this.CPU.dec2bin( m ));
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
