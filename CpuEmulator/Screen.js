class Screen{
    
    constructor(ctx){
        //this.image = context.createImageData(512, 256);
        this.ctx = ctx;
        this.ctx.clearRect(0, 0, 512, 256);
        this.BLACK = "rgba("+0+","+0+","+255+","+(255/255)+")";
        this.WHITE = "rgba("+255+","+255+","+255+","+(255/255)+")";
        
    }
    
    poke(addr,value){
        //base 16384 [0-32 first row]. [33-64] second row
        //word row = (addr-16384)/32
        //word col = (16384+row*32)/16
        //console.log(addr)
        var row = parseInt((addr-16384)/32);
        var col = parseInt((addr-16384)%32*16);
        //console.log(col,row);
        for(var i = 0;i<16;i++){
            //set the bits
            //r,g,b,a
            if(value[i]==='1'){
                this.ctx.fillStyle = this.BLACK;
            }else{
                this.ctx.fillStyle = this.WHITE;
            }
            
            this.ctx.fillRect( col+i, row, 1, 1 );
        }
    }
}
