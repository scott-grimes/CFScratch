//reads in a .jack file, compiles it into a .vm file, prints the results to stdout

class Analyzer {
    
    constructor(f){
          this.keywords = ['class',
        'constructor',
        'function',
        'method',
        'field','static',
        'var',
        'int','char','boolean','void',
        'true','false','null',
        'this','let','do','if','else',
        'while','return'
        ] 
    
        this.symbols = ['(',')','{','}','[',']',
        '.',',',';','+','-','*','/','&','|',
        '<','>','=','~']
    
      
        
        var lines = f.split('\n')
        var parsed = [];
       
        for(var i = 0;i<lines.length;i++){
            //replace tabs with spaces
            var line = lines[i].replace('\t',' ')
            //remove single line comments
            var startSingleComment = line.indexOf('//')
            if(startSingleComment !== -1)
                line = line.slice(0,startSingleComment)
            //ignore blank lines
            if(line !== '')
                parsed.push(line)
        }
        
        
        //joins the lines together into one string
        var inputStream = parsed.join('')
        
        //number of multi-line comments remaining in the file
        var numberOfComments = (inputStream.match(/\/\*/g) || []).length; // searches for '/*'
        
        
        // removes multiline comments
        while(numberOfComments>0){
            var startCut = inputStream.indexOf('/*')
            var endCut = inputStream.indexOf('*/')+2
            inputStream = inputStream.slice(0,startCut)+inputStream.slice(endCut);
            numberOfComments-=1
        }
            
        // removes newlines
        this.inputStream = inputStream.replace('\n',' ')
        
    }
       
    hasMoreTokens(){
         return this.inputStream.replace(' ','').length > 0;
    }
    
    advance(){
        //returns the next token. If no tokens left,
        //returns null
        
        if(!this.hasMoreTokens())
            return null;
        
        //removes leading whitespace
        this.inputStream = this.inputStream.trim()
        
        //checks to see if we are looking at a string (leading char is \")
        // if so, pull the entire string as a token
        if (this.inputStream.charAt(0) == '"'){
            var closing_index = this.inputStream.indexOf('"',1) 
            var token = this.inputStream.slice(0,closing_index+1)
            this.inputStream = this.inputStream.slice(token.length)
            return token
        }
            
        
        //checks to see if we are looking at a symbol
        if( this.symbols.includes( this.inputStream.charAt(0) ) ){
            var token = this.inputStream.charAt(0);
            this.inputStream=this.inputStream.slice(1);
            return token
        }
            
        
        // gets a potential token, read up to the next whitespace character
        // this potential token requires further parsing as it might contain a symbol inside, which
        // should delimit the token instead of the whitespace
        // example:   "A=M+3;" returns foundInside = [';','+','=']
        
        var potential_token= this.inputStream.split(' ',1)[0];
        var foundInside = [];
        
        // add one of each symbol found inside the potential token to the list of "found inside"
        for(var i = 0;i<potential_token.length;i++){
            if( this.symbols.includes( potential_token.charAt(i) ) & !foundInside.includes( potential_token.charAt(i) )  )
                foundInside.push( potential_token.charAt(i) );
        }
        
        //if there is a symbol inside, use it to delimit our token, always slicing to the first token
        if (foundInside.length>0){
            for(var i = 0;i<foundInside.length;i++)
                potential_token = potential_token.split( foundInside[i] ,1)[0];
        }
        
        //chops out the token from our input stream and returns it
        var token = potential_token
        this.inputStream = this.inputStream.slice(token.length).trim();
        return token
        
    }
        
        
    peek(){
        // returns the next symbol without removing it from the stream
        if(!this.hasMoreTokens())
            return null;
        token = this.advance();
        this.inputStream = token+" "+this.inputStream;
        return token;
    }
        
            
    tokenType(token){
        //returns the type of token we have obtained
        
        if ( token.charAt(0) == '"' )
            return 'stringConstant';
        
        if (this.keywords.contains(token))
            return 'keyword';
        if (this.symbols.contains(token))
            return 'symbol'
        if ( '0123456789'.contains(token.charAt(0)))
            return 'integerConstant';
        
        return 'identifier';
    }
        
        
    keyWord(token){
        //returns the keyword of the current 
        //token
        return token
    }

    intVal(token){
        return parseInt(token)
    }
        
    
    stringVal(token){
        //strips the quotes off of our token
        return token.slice(1,token.length-1); 
    }
        
    
    symbolOperator(token){
       if ( token === '+')
            return 'add'
        else if (token === '-')
            return 'sub'
        else if (token === '*')
            return 'call Math.multiply 2'
        else if (token === '/')
            return 'call Math.divide 2'
        else if (token === '&')
            return 'and'
        else if (token === '|')
            return 'or'
        else if (token === '<')
            return 'lt'
        else if (token === '>')
            return 'gt'
        else if (token === '=')
            return 'eq'
        
        return null 
    }
        
}
/*
class CompileJack{
    
    constructor(file_with_path){
        this.fetch = Analyzer(file_with_path)
        this.symbol = SymbolTable()
        this.indent = 0
        this.whileCount = -1
        this.ifCount = -1
        this.CompileClass()
    }
    

    
    def print_tag(self,tag): 
        for i in range(this.indent):
            print('  ',end='')
        print(tag)
        
        
    def xml_ify(self,token):
        #replaces the characters <,>,",and " with their xml equivalants
        token = token.replace("&",'&amp;')
        token = token.replace('<','&lt;')
        token = token.replace('>','&gt;')
        token = token.replace("\"",'&quot;')
        return token
    
    def out(self,token):
        #prints out the parsed XML line
        
        #indent for readability
        for i in range(this.indent):
            print('  ',end='')
            
        #check if we have an int
        if(isinstance( token, int )):
           type = this.fetch.tokenType(str(token))
           print("<"+type+"> "+str(token)+" </"+type+">")
        
        #we have a string
        else:
            type = this.fetch.tokenType(token)
            
            #remove quotes form string constants, otherwise just print the type and string
            if type == 'stringConstant':
                token = this.fetch.stringVal(token)
                
            #removes non-xml-compatable characters from our token
            token = this.xml_ify(token)
            print("<"+type+"> "+token+" </"+type+">")
        
    
    def CompileClass(self):
        this.indent +=1
        f = this.fetch
        f.advance() #encountered a class "class"
        
        this.class_name = f.advance() 
        
        f.advance() #opens the class '{'
        
        
        peek = f.peek() #class Var Dec
        classVars = 0
        this.staticVarCount = 0
        while(peek in ['static','field']):
            classVars+=this.CompileClassVarDec()
            peek = f.peek()
        
        #class subroutine Dec
        while(peek in ['constructor','function',
                    'method','void']):
            this.CompileSubroutine(classVars)
            peek = f.peek()
            
         
            
        f.advance() #ends the class '}'
        
        this.indent-=1
        
        return
    
    def CompileClassVarDec(self):
        #this.print_tag('<classVarDec>')
        #KIND IS FIELD
        this.indent +=1
        f = this.fetch
        num_of_vars = 1
        f_or_s = f.advance()   #field or static
        type = f.advance()  
        varName = f.advance() 
        this.symbol.define(varName,type,f_or_s)
        peek = f.peek()
        while peek == ',':
            f.advance() #','
            varName = f.advance()#varName
            this.symbol.define(varName,type,f_or_s)
            peek = f.peek()
            num_of_vars+=1
            
        f.advance()#';'
        if f_or_s != 'static':
            return num_of_vars
        return 0
        
    def CompileSubroutine(self,classVariables = 0):
        this.indent +=1
        f = this.fetch
        
        this.whileCount = -1
        this.ifCount = -1
        this.symbol.startSubroutine()
        sub_type = f.advance() #constructor/function/method
        
        if sub_type == 'method':
            #first arg pushed is 'this'
            
            this.symbol.define('this','object','arg')
        
        
        return_type = f.advance() #return type or void
        if(return_type == 'void'):
            this.voidReturn = True
        else:
            this.voidReturn = False
        sub_name = f.advance() #subroutineName 
       
        f.advance() # '('
        
        parameter_count = this.CompileParameterList()
        
        f.advance() # ')'
        
        f.advance() # '{' starts the body of the subroutine
        
        num_of_method_vars = 0
        peek = f.peek()
        while(peek == 'var'):
                num_of_method_vars+=this.CompileVarDec()
                peek = f.peek()
        functionName = this.class_name+'.'+sub_name
        #find num of variables declared!
        VMWriter.writeFunction(functionName,num_of_method_vars)
        
        
        
        if sub_type == 'constructor':
            print ('push constant '+str(classVariables))
            print('call Memory.alloc 1')
            print('pop pointer 0')
        if sub_type == 'method':
            
            print('push argument '+str(0))
            print('pop pointer 0')
        
        this.CompileSubroutineBody()
        
        this.indent -=1
        
        return
    
    def CompileParameterList(self):
        #((type varName)(','type varName)*)?
        parameter_count = 0
        this.indent +=1
        f= this.fetch
        peek = f.peek()
        while peek != ')':
            parameter_count+=1
            type = f.advance()# type or varName
            varName = f.advance()
            this.symbol.define(varName,type,'arg')
            peek = f.peek()
            if peek == ',':
                f.advance()
        this.indent -=1
        return parameter_count
            
    def CompileSubroutineBody(self):
        this.indent +=1
        f = this.fetch
        num_of_vars = 0
        peek = f.peek()
        while(peek != '}'):
            this.CompileStatements()
            peek = f.peek()
        close_brace = f.advance() #'}' end of our function
        #print('i had '+str(num_of_vars)+ ' variables')
        this.indent -=1

    def CompileVarDec(self):
        this.indent +=1
        f = this.fetch
        num_of_vars = 1
        var = f.advance()  
        type = f.advance()  
        varName = f.advance() 
        this.symbol.define(varName,type,'var')
        peek = f.peek()
        while peek == ',':
            token = f.advance() #','
            varName = f.advance()#varName
            this.symbol.define(varName,type,'var')
            
            #is the var type not built-in? allocate a new object!
            if varName not in ['int','char','boolean']:
                pass
                
                
            
            peek = f.peek()
            num_of_vars+=1
        f.advance() #';' ends declaration
        this.indent -=1
        return num_of_vars
            
    def CompileStatements(self):
        this.indent +=1
        f = this.fetch
        peek = f.peek()
        while(peek in ['let','if','while','do','return']):
            this.CompileStatement()
            peek = f.peek()
        
        this.indent -=1
        
    def CompileStatement(self):
        f = this.fetch
        peek = f.peek()
        if peek == 'let': this.CompileLet()
        if peek == 'if': this.CompileIf()
        if peek == 'while': this.CompileWhile()
        if peek == 'do': this.CompileDo()
        if peek == 'return': this.CompileReturn()
        
        
    def CompileDo(self):
        this.indent +=1
        f = this.fetch
        token = f.advance() #do command
        peek = f.peek()
        while(peek != ';'):
            this.CompileSubroutineCall()
            peek = f.peek()
        token = f.advance()# ';' end of do command
        VMWriter.pop('temp',0) #all do commands pop and ignore local 0
        this.indent -=1
        
    def CompileLet(self):
       
        this.indent +=1
        f = this.fetch
        f.advance()# let keyword
        varName = f.advance()
        
        peek = f.peek()
        array = False
        if(peek == '['):
            array = True
            f.advance() #'[' array open bracket
            peek = f.peek()
            if(peek !=']'):
                this.CompileExpression()
            f.advance()#']' array close bracket
            
            array_var_number = str(this.symbol.indexOf(varName))
            kind = this.symbol.kindOf(varName)
            VMWriter.push(kind,array_var_number)
            print('add')
            
            
        
        f.advance()# '=' 
        this.CompileExpression()
        
        f.advance()# ';'
        var_symbol_num = this.symbol.indexOf(varName)
        kind = this.symbol.kindOf(varName)
        
        if array:
            print('pop temp 0')
            print('pop pointer 1')
            print('push temp 0')
            print('pop that 0')
        else:
            VMWriter.pop(kind,var_symbol_num)
        this.indent -=1
        
    def CompileWhile(self):
        #while(cond){ stuff}
        #
        #Label1
        # ~(cond)
        #if-goto Label2
        #stuff
        #goto Label1
        #Label2
        this.indent +=1
        this.whileCount+=1
        wCount = str(this.whileCount)
        VMWriter.writeLabel('WHILE_EXP'+wCount)
        
        f = this.fetch
        f.advance() #while
        token = f.advance()#'('
        peek = f.peek()
        while(peek != ')'):
            this.CompileExpression()
            peek = f.peek()
        f.advance()# ')'
        print('not')
        
        print('if-goto '+'WHILE_END'+wCount)
       
        f.advance()# '{'
        peek = f.peek()
        while(peek !='}'):
            this.CompileStatements()
            peek = f.peek()
        f.advance()# '}'
        print('goto '+'WHILE_EXP'+wCount)
        VMWriter.writeLabel('WHILE_END'+wCount)
        
        this.indent -=1
        
    def CompileReturn(self):
        this.indent +=1
        f = this.fetch
        f.advance()# 'return'
        peek = f.peek()
        while(peek != ';'):
            this.CompileExpression()
            peek = f.peek()
           
        f.advance()# ';' end of return statement
        if(this.voidReturn):
            print('push constant 0')
        
        
            
        
        print('return')
        
        
        this.indent -=1
        
    def CompileIf(self):
        #if(cond)
        #s1
        #else
        #s2
        #
        #~(cond)
        #if-goto Label1
        #s1
        #goto Label2
        #Label1
        #s2
        #Label2
        this.indent +=1
        f = this.fetch
        f.advance()#'if
        f.advance()#'('
        peek = f.peek()
        this.ifCount+=1
        ifCount = str(this.ifCount)
        
        while(peek != ')'):
            this.CompileExpression()
            peek = f.peek()
        f.advance()#')'
        print('if-goto IF_TRUE'+ifCount)
        print('goto IF_FALSE'+ifCount)
        print('label IF_TRUE'+ifCount)
        f.advance()# '{'
        
        peek = f.peek()
        while(peek!= '}'):
            this.CompileStatements()
            peek = f.peek()
        f.advance()# '}'
        
        
        peek = f.peek()
        if peek == 'else':
            print('goto IF_END'+ifCount)
            print('label IF_FALSE'+ifCount)
            f.advance()#'else'
            f.advance()# '{'
            while(peek!= '}'):
                this.CompileStatements()
                peek = f.peek()
            f.advance()# '}'
            
            print('label IF_END'+ifCount)
        else:
            print('label IF_FALSE'+ifCount)
        this.indent -=1
        
    def CompileExpression(self):
       
        this.indent +=1
        #term (op term)*
        f = this.fetch
        peek = f.peek()
        this.CompileTerm()
        peek = f.peek()
        while peek in ['+','-','*','/','&','|',
                    '<','>','=']:
            token = f.advance()
            operator_statement = f.symbolOperator(token)# operator symbol
            this.CompileTerm()
            print(operator_statement)
            peek = f.peek()
        
        this.indent -=1
        
    def CompileTerm(self):
        #term (op term)*
        #if term is identifier, distinguish between
        #[ ( or .
        this.indent +=1
        f = this.fetch
        token = f.advance()
        type = f.tokenType(token)
        if type =='integerConstant':
            VMWriter.push('constant',token)
            
        elif type == 'stringConstant':
            VMWriter.writeString(token)
        elif type =='keyword':
            VMWriter.writeKeyword(token)
            
        #( expression )
        elif token == '(':
            
            this.CompileExpression()
            token = f.advance()#) end of parenthisis
            
        elif token in ['-','~']:
            this.CompileTerm()
            if token == '-':
                print('neg')
            if token == '~':
                print('not')
            
            
       
        elif type == 'identifier':
            peek = f.peek()
           
           #subroutine call
            if peek =='.':
                this.CompileSubroutineCall(token)
                
            #varName [ expression ]
            elif peek == '[':
                varName = token
                kind = this.symbol.kindOf(varName)
                
                f.advance()#[
                this.CompileExpression()
                f.advance()# ]
                
                var_symbol_num = this.symbol.indexOf(varName)
                VMWriter.push(kind, var_symbol_num)
                print('add')
                print('pop pointer 1')
                print('push that 0')
                
            
            
            
            #variable
            else:
                varName = token
                var_symbol_num = this.symbol.indexOf(varName)
                kind = this.symbol.kindOf(varName)
                VMWriter.push(kind, var_symbol_num)
        
        this.indent -=1
                
    def CompileExpressionList(self):
        
        this.indent+=1
        f = this.fetch
        peek = f.peek()
        num_of_expressions = 0
        while(peek != ')'):
            num_of_expressions += 1
            this.CompileExpression()
            peek = f.peek()
            if(peek == ','):
                token = f.advance()# ',' seperates another expression
                peek = f.peek()
                
        
        this.indent-=1
        return num_of_expressions
    
    def CompileSubroutineCall(self,className = ''):
        
        f = this.fetch
        token = f.advance() #could be a '.' or (
        num_subroutine_arguments = 0
        if className != '':
            subroutine_name = className+'.'
        else:
            subroutine_name = token
            className = token
            
        while(token!= '('):
            token = f.advance()
            if(token!='('):
                subroutine_name += token
                
        #if we are calling a method in another object, push the first arg to be
        #a reference to the base of that object. write a call to the class's subroutine
        #if we are calling a method in this object, push our pointer to this object, then
        #write a call to the class method        
        if this.symbol.getTableOf(className) != None:
            index = this.symbol.indexOf(className)
            kind = this.symbol.kindOf(className)
            type = this.symbol.typeOf(className)
            subroutine_name = type+'.'+subroutine_name.split('.',1)[1]
            VMWriter.push(kind,index)
            num_subroutine_arguments+=1
        
        if '.' not in subroutine_name:
            #we have a call to this object's method. 
            subroutine_name = this.class_name+'.'+subroutine_name
            print('push pointer 0')
            num_subroutine_arguments+=1
        
        num_subroutine_arguments += this.CompileExpressionList()
        token = f.advance() #')' end of subroutine call's arguments
        
        
        

        #this.symbol.printTables()
        

        
            
        
        VMWriter.writeCall(subroutine_name, num_subroutine_arguments)
        return
}
    
class Symbol:
    def __init__(self,name,type,kind):
        this.name = name
        this.type = type
        if kind == 'var':
            this.kind = 'local'
        elif kind == 'field':
            this.kind='field'
        else:
            this.kind = kind
        
    def __repr__(self):
        return '['+this.name+','+this.type+','+this.kind+']'
        
class SymbolTable:
    #subroutine variables are accessed by *local
    #subroutine argument variables are accessed by *argument
    #static class variables are accessed by *static
    #access to class fields in a subroutine are found by pointing to 
    #the "this" segment, then accessing the field via this index reference
    
    def __init__(self):
        this.classTable = []
        this.subroutineTable = []
    
    def startSubroutine(self):
        this.subroutineTable = []
    
    def define(self,name,type,kind):
        
        newSymbol = Symbol(name,type,kind)
        if kind in ['arg','var']:
            this.subroutineTable.append(newSymbol)
        if kind in ['static','field']:
            this.classTable.append(newSymbol)
        
    def varCount(self,kind):
        num = 0
        if kind in ['arg','var']:
            table = this.subroutineTable
        if kind in ['static','field']:
            table = this.classTable
        for i in table:
            if i.kind == kind:
                num+=1
        return num
            
            
    def kindOf(self,name):
        #what kind of variable is name
        table = this.getTableOf(name)
        if table != None:
            names = [i.name for i in table]
            if name in names:
                kind =  table[names.index(name)].kind
                return kind
        return None
        
        
    def typeOf(self,name):
       #what type of variable is name
        table = this.getTableOf(name)
        if table != None:
            names = [i.name for i in table]
            if name in names:
                return table[names.index(name)].type
        return None
    
    def getTableOf(self,name):
        #returns the table which contains our variable
        #is our name in the subroutine
        names = [i.name for i in this.subroutineTable]
        if name in names:
            return this.subroutineTable
        
        #is our name a class var?
        names = [i.name for i in this.classTable]
        if name in names:
            return this.classTable
    
    def indexOf(self,name):
        #what is the index of name
        table = this.getTableOf(name)
        if table != None:
            nameKind = this.kindOf(name)
            names = [i.name for i in table if i.kind == nameKind]
            if name in names:
                return names.index(name)

        return None
    def printTables(self):    
        print('classTable',this.classTable)
        print('subroutineTable',this.subroutineTable)
class VMWriter:
    def __init__(self):
        pass
    @staticmethod
    def push(segment,index):
        if segment == 'arg':
            segment = 'argument'
        if segment == 'field':
            segment = 'this'
        print('push '+segment+' '+str(index))
        
    @staticmethod
    def pop(segment,index):
        if segment == 'arg':
            segment = 'argument'
        if segment == 'field':
            segment = 'this'
        print('pop '+segment+' '+str(index))
    @staticmethod
    def writeLabel(label):
        print('label '+label)
    @staticmethod
    def writeCall(name,nArgs):
        
        print('call '+name+' '+str(nArgs))
        
    @staticmethod
    def writeFunction(name,nLocals):
        print('function '+name+' '+str(nLocals))
    
    @staticmethod
    def writeKeyword(keyword):
        if keyword == 'true':
            print('push constant 0')
            print('not')
        elif keyword=='false' or keyword == 'null':
            print('push constant 0')
        elif keyword =='this':
            print('push pointer 0')
        else:
            print(keyword)
            
    @staticmethod
    def writeString(string):
        string = string[1:-1]
        length = len(string)
        print('push constant '+str(length))
        print('call String.new 1')
        for i in string:
            print('push constant '+str(ord(i)))
            print('call String.appendChar 2')
    
    
    
if __name__ == "__main__":
    try:
        if(len(sys.argv)<2):
            print('No input file specified!')
        else:
            CompilationEngine(sys.argv[1])
    except Exception as e:
        print(e)
        input()
        sys.exit()
        */
