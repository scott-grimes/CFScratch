#reads in a .jack file, compiles it into a .vm file, prints the results to stdout
import sys
from _operator import add

class Analyzer:
    
    def __init__(self,file_with_path):
        self.keywords = ['class',
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
    
        self.symbols = ['(',')','{','}','[',']',
        '.',',',';','+','-','*','/','&','|',
        '<','>','=','~']
        
        self.lines = []
        
        fileName = file_with_path.split('\\')[-1]
        
        with open(file_with_path) as f:
            
            for line in f:
                #replaces tabs with single spaces
                line = line.replace('\t',' ')
                #removes comments with two slashes
                line = line.split('//')[0]
                #ignore blank lines
                if line != '':
                    self.lines.append(line)
        #joins the lines together into one big string
        inputStream = ''.join(self.lines)
        
        #number of comments remaining in the file
        numberOfComments = inputStream.count('/*')
        #removes remaining comments
        while(numberOfComments>0):
            before = inputStream.split('/*',1)[0]
            after = inputStream.split('*/',1)[1]
            inputStream = before+after
            numberOfComments-=1
        
        #removes newlines
        self.inputStream = inputStream.replace('\n',' ')
        
        #redirects stdout to our file
        outputFile = file_with_path.replace('.jack','.vm')
        #sys.stdout=open(outputFile,"w")
       
    def hasMoreTokens(self):
        return (len(self.inputStream.replace(' ',''))>0)
    
    def advance(self):
        #returns the next token. If no tokens left,
        #returns None
        
        if(not self.hasMoreTokens()):
            return None
        
        #removes leading whitespace
        self.inputStream = self.inputStream.lstrip()
        
        #checks to see if we are looking at a string (leading char is \")
        if self.inputStream[0] == "\"":
            closing_index = self.inputStream.index("\"",1) 
            token = self.inputStream[:closing_index+1]
            self.inputStream = self.inputStream[len(token):]
            return token
        
        #checks to see if we are looking at a symbol
        if self.inputStream[0] in self.symbols:
            token = self.inputStream[0]
            self.inputStream=self.inputStream[1:]
            return token
        
        #gets a potential token, read up to the next whitespace character
        #this potential token requires further parsing as it might contain a symbol inside, which
        #should delimit the token instead of the whitespace
        
        potential_token= self.inputStream.split(' ',1)[0]
        foundInside = [i for i in self.symbols if i in potential_token]
        
        #if there is a symbol inside, use it to delimit our symbol
        if len(foundInside)>0:
            for i in foundInside:
                potential_token = potential_token.split(i,1)[0]
        
        #chops out the token from our input stream and returns it
        token = potential_token
        self.inputStream = self.inputStream[len(token):].lstrip()
        return token
    
    def peek(self):
        #returns the next symbol without removing it from the stream
        if(not self.hasMoreTokens()):
            return None
        token = self.advance()
        self.inputStream = token+" "+self.inputStream
        return token
            
    def tokenType(self,token):
        #returns the type of token we have obtained
        
        if token[0] == "\"":
            return 'stringConstant'
        
        if token in self.keywords:
            return 'keyword'
        if token in self.symbols:
            return 'symbol'
        if token[0].isdigit():
            return 'integerConstant'
        
        
        return 'identifier'
        
    def keyWord(self,token):
        #returns the keyword of the current 
        #token
        return token

    def intVal(self,token):
        return int(token)
    
    def stringVal(self,token):
        return token[1:-1] #strips the quotes off of our token
    
    def symbolOperator(self,token):
        if token == '+':
            return 'add'
        elif  token == '-':
            return 'sub'
        elif  token == '*':
            return 'call Math.multiply 2'
        elif  token == '/':
            return 'call Math.divide 2'
        elif  token == '&':
            return 'and'
        elif  token == '|':
            return 'or'
        elif  token == '<':
            return 'lt'
        elif  token == '>':
            return 'gt'
        elif  token == '=':
            return 'eq'
        
        
        return None
        
class CompileJack:
    
    def __init__(self,file_with_path):
        self.fetch = Analyzer(file_with_path)
        self.symbol = SymbolTable()
        self.indent = 0
        self.whileCount = -1
        self.ifCount = -1
        self.CompileClass()
        return
    
    def print_tag(self,tag): 
        for i in range(self.indent):
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
        for i in range(self.indent):
            print('  ',end='')
            
        #check if we have an int
        if(isinstance( token, int )):
           type = self.fetch.tokenType(str(token))
           print("<"+type+"> "+str(token)+" </"+type+">")
        
        #we have a string
        else:
            type = self.fetch.tokenType(token)
            
            #remove quotes form string constants, otherwise just print the type and string
            if type == 'stringConstant':
                token = self.fetch.stringVal(token)
                
            #removes non-xml-compatable characters from our token
            token = self.xml_ify(token)
            print("<"+type+"> "+token+" </"+type+">")
        
    
    def CompileClass(self):
        self.indent +=1
        f = self.fetch
        f.advance() #encountered a class "class"
        
        self.class_name = f.advance() 
        
        f.advance() #opens the class '{'
        
        
        peek = f.peek() #class Var Dec
        classVars = 0
        self.staticVarCount = 0
        while(peek in ['static','field']):
            classVars+=self.CompileClassVarDec()
            peek = f.peek()
        
        #class subroutine Dec
        while(peek in ['constructor','function',
                    'method','void']):
            self.CompileSubroutine(classVars)
            peek = f.peek()
            
         
            
        f.advance() #ends the class '}'
        
        self.indent-=1
        
        return
    
    def CompileClassVarDec(self):
        #self.print_tag('<classVarDec>')
        #KIND IS FIELD
        self.indent +=1
        f = self.fetch
        num_of_vars = 1
        f_or_s = f.advance()   #field or static
        type = f.advance()  
        varName = f.advance() 
        self.symbol.define(varName,type,f_or_s)
        peek = f.peek()
        while peek == ',':
            f.advance() #','
            varName = f.advance()#varName
            self.symbol.define(varName,type,f_or_s)
            peek = f.peek()
            num_of_vars+=1
            
        f.advance()#';'
        if f_or_s != 'static':
            return num_of_vars
        return 0
        
    def CompileSubroutine(self,classVariables = 0):
        self.indent +=1
        f = self.fetch
        
        self.whileCount = -1
        self.ifCount = -1
        self.symbol.startSubroutine()
        sub_type = f.advance() #constructor/function/method
        
        if sub_type == 'method':
            #first arg pushed is 'this'
            
            self.symbol.define('this','object','arg')
        
        
        return_type = f.advance() #return type or void
        if(return_type == 'void'):
            self.voidReturn = True
        else:
            self.voidReturn = False
        sub_name = f.advance() #subroutineName 
       
        f.advance() # '('
        
        parameter_count = self.CompileParameterList()
        
        f.advance() # ')'
        
        f.advance() # '{' starts the body of the subroutine
        
        num_of_method_vars = 0
        peek = f.peek()
        while(peek == 'var'):
                num_of_method_vars+=self.CompileVarDec()
                peek = f.peek()
        functionName = self.class_name+'.'+sub_name
        #find num of variables declared!
        VMWriter.writeFunction(functionName,num_of_method_vars)
        
        
        
        if sub_type == 'constructor':
            print ('push constant '+str(classVariables))
            print('call Memory.alloc 1')
            print('pop pointer 0')
        if sub_type == 'method':
            
            print('push argument '+str(0))
            print('pop pointer 0')
        
        self.CompileSubroutineBody()
        
        self.indent -=1
        
        return
    
    def CompileParameterList(self):
        #((type varName)(','type varName)*)?
        parameter_count = 0
        self.indent +=1
        f= self.fetch
        peek = f.peek()
        while peek != ')':
            parameter_count+=1
            type = f.advance()# type or varName
            varName = f.advance()
            self.symbol.define(varName,type,'arg')
            peek = f.peek()
            if peek == ',':
                f.advance()
        self.indent -=1
        return parameter_count
            
    def CompileSubroutineBody(self):
        self.indent +=1
        f = self.fetch
        num_of_vars = 0
        peek = f.peek()
        while(peek != '}'):
            self.CompileStatements()
            peek = f.peek()
        close_brace = f.advance() #'}' end of our function
        #print('i had '+str(num_of_vars)+ ' variables')
        self.indent -=1

    def CompileVarDec(self):
        self.indent +=1
        f = self.fetch
        num_of_vars = 1
        var = f.advance()  
        type = f.advance()  
        varName = f.advance() 
        self.symbol.define(varName,type,'var')
        peek = f.peek()
        while peek == ',':
            token = f.advance() #','
            varName = f.advance()#varName
            self.symbol.define(varName,type,'var')
            
            #is the var type not built-in? allocate a new object!
            if varName not in ['int','char','boolean']:
                pass
                
                
            
            peek = f.peek()
            num_of_vars+=1
        f.advance() #';' ends declaration
        self.indent -=1
        return num_of_vars
            
    def CompileStatements(self):
        self.indent +=1
        f = self.fetch
        peek = f.peek()
        while(peek in ['let','if','while','do','return']):
            self.CompileStatement()
            peek = f.peek()
        
        self.indent -=1
        
    def CompileStatement(self):
        f = self.fetch
        peek = f.peek()
        if peek == 'let': self.CompileLet()
        if peek == 'if': self.CompileIf()
        if peek == 'while': self.CompileWhile()
        if peek == 'do': self.CompileDo()
        if peek == 'return': self.CompileReturn()
        
        
    def CompileDo(self):
        self.indent +=1
        f = self.fetch
        token = f.advance() #do command
        peek = f.peek()
        while(peek != ';'):
            self.CompileSubroutineCall()
            peek = f.peek()
        token = f.advance()# ';' end of do command
        VMWriter.pop('temp',0) #all do commands pop and ignore local 0
        self.indent -=1
        
    def CompileLet(self):
       
        self.indent +=1
        f = self.fetch
        f.advance()# let keyword
        varName = f.advance()
        
        peek = f.peek()
        array = False
        if(peek == '['):
            array = True
            f.advance() #'[' array open bracket
            peek = f.peek()
            if(peek !=']'):
                self.CompileExpression()
            f.advance()#']' array close bracket
            
            array_var_number = str(self.symbol.indexOf(varName))
            kind = self.symbol.kindOf(varName)
            VMWriter.push(kind,array_var_number)
            print('add')
            
            
        
        f.advance()# '=' 
        self.CompileExpression()
        
        f.advance()# ';'
        var_symbol_num = self.symbol.indexOf(varName)
        kind = self.symbol.kindOf(varName)
        
        if array:
            print('pop temp 0')
            print('pop pointer 1')
            print('push temp 0')
            print('pop that 0')
        else:
            VMWriter.pop(kind,var_symbol_num)
        self.indent -=1
        
    def CompileWhile(self):
        #while(cond){ stuff}
        #
        #Label1
        # ~(cond)
        #if-goto Label2
        #stuff
        #goto Label1
        #Label2
        self.indent +=1
        self.whileCount+=1
        wCount = str(self.whileCount)
        VMWriter.writeLabel('WHILE_EXP'+wCount)
        
        f = self.fetch
        f.advance() #while
        token = f.advance()#'('
        peek = f.peek()
        while(peek != ')'):
            self.CompileExpression()
            peek = f.peek()
        f.advance()# ')'
        print('not')
        
        print('if-goto '+'WHILE_END'+wCount)
       
        f.advance()# '{'
        peek = f.peek()
        while(peek !='}'):
            self.CompileStatements()
            peek = f.peek()
        f.advance()# '}'
        print('goto '+'WHILE_EXP'+wCount)
        VMWriter.writeLabel('WHILE_END'+wCount)
        
        self.indent -=1
        
    def CompileReturn(self):
        self.indent +=1
        f = self.fetch
        f.advance()# 'return'
        peek = f.peek()
        while(peek != ';'):
            self.CompileExpression()
            peek = f.peek()
           
        f.advance()# ';' end of return statement
        if(self.voidReturn):
            print('push constant 0')
        
        
            
        
        print('return')
        
        
        self.indent -=1
        
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
        self.indent +=1
        f = self.fetch
        f.advance()#'if
        f.advance()#'('
        peek = f.peek()
        self.ifCount+=1
        ifCount = str(self.ifCount)
        
        while(peek != ')'):
            self.CompileExpression()
            peek = f.peek()
        f.advance()#')'
        print('if-goto IF_TRUE'+ifCount)
        print('goto IF_FALSE'+ifCount)
        print('label IF_TRUE'+ifCount)
        f.advance()# '{'
        
        peek = f.peek()
        while(peek!= '}'):
            self.CompileStatements()
            peek = f.peek()
        f.advance()# '}'
        
        
        peek = f.peek()
        if peek == 'else':
            print('goto IF_END'+ifCount)
            print('label IF_FALSE'+ifCount)
            f.advance()#'else'
            f.advance()# '{'
            while(peek!= '}'):
                self.CompileStatements()
                peek = f.peek()
            f.advance()# '}'
            
            print('label IF_END'+ifCount)
        else:
            print('label IF_FALSE'+ifCount)
        self.indent -=1
        
    def CompileExpression(self):
       
        self.indent +=1
        #term (op term)*
        f = self.fetch
        peek = f.peek()
        self.CompileTerm()
        peek = f.peek()
        while peek in ['+','-','*','/','&','|',
                    '<','>','=']:
            token = f.advance()
            operator_statement = f.symbolOperator(token)# operator symbol
            self.CompileTerm()
            print(operator_statement)
            peek = f.peek()
        
        self.indent -=1
        
    def CompileTerm(self):
        #term (op term)*
        #if term is identifier, distinguish between
        #[ ( or .
        self.indent +=1
        f = self.fetch
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
            
            self.CompileExpression()
            token = f.advance()#) end of parenthisis
            
        elif token in ['-','~']:
            self.CompileTerm()
            if token == '-':
                print('neg')
            if token == '~':
                print('not')
            
            
       
        elif type == 'identifier':
            peek = f.peek()
           
           #subroutine call
            if peek =='.':
                self.CompileSubroutineCall(token)
                
            #varName [ expression ]
            elif peek == '[':
                varName = token
                kind = self.symbol.kindOf(varName)
                
                f.advance()#[
                self.CompileExpression()
                f.advance()# ]
                
                var_symbol_num = self.symbol.indexOf(varName)
                VMWriter.push(kind, var_symbol_num)
                print('add')
                print('pop pointer 1')
                print('push that 0')
                
            
            
            
            #variable
            else:
                varName = token
                var_symbol_num = self.symbol.indexOf(varName)
                kind = self.symbol.kindOf(varName)
                VMWriter.push(kind, var_symbol_num)
        
        self.indent -=1
                
    def CompileExpressionList(self):
        
        self.indent+=1
        f = self.fetch
        peek = f.peek()
        num_of_expressions = 0
        while(peek != ')'):
            num_of_expressions += 1
            self.CompileExpression()
            peek = f.peek()
            if(peek == ','):
                token = f.advance()# ',' seperates another expression
                peek = f.peek()
                
        
        self.indent-=1
        return num_of_expressions
    
    def CompileSubroutineCall(self,className = ''):
        
        f = self.fetch
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
        if self.symbol.getTableOf(className) != None:
            index = self.symbol.indexOf(className)
            kind = self.symbol.kindOf(className)
            type = self.symbol.typeOf(className)
            subroutine_name = type+'.'+subroutine_name.split('.',1)[1]
            VMWriter.push(kind,index)
            num_subroutine_arguments+=1
        
        if '.' not in subroutine_name:
            #we have a call to this object's method. 
            subroutine_name = self.class_name+'.'+subroutine_name
            print('push pointer 0')
            num_subroutine_arguments+=1
        
        num_subroutine_arguments += self.CompileExpressionList()
        token = f.advance() #')' end of subroutine call's arguments
        
        
        

        #self.symbol.printTables()
        

        
            
        
        VMWriter.writeCall(subroutine_name, num_subroutine_arguments)
        return
    
class Symbol:
    def __init__(self,name,type,kind):
        self.name = name
        self.type = type
        if kind == 'var':
            self.kind = 'local'
        elif kind == 'field':
            self.kind='field'
        else:
            self.kind = kind
        
    def __repr__(self):
        return '['+self.name+','+self.type+','+self.kind+']'
        
class SymbolTable:
    #subroutine variables are accessed by *local
    #subroutine argument variables are accessed by *argument
    #static class variables are accessed by *static
    #access to class fields in a subroutine are found by pointing to 
    #the "this" segment, then accessing the field via this index reference
    
    def __init__(self):
        self.classTable = []
        self.subroutineTable = []
    
    def startSubroutine(self):
        self.subroutineTable = []
    
    def define(self,name,type,kind):
        
        newSymbol = Symbol(name,type,kind)
        if kind in ['arg','var']:
            self.subroutineTable.append(newSymbol)
        if kind in ['static','field']:
            self.classTable.append(newSymbol)
        
    def varCount(self,kind):
        num = 0
        if kind in ['arg','var']:
            table = self.subroutineTable
        if kind in ['static','field']:
            table = self.classTable
        for i in table:
            if i.kind == kind:
                num+=1
        return num
            
            
    def kindOf(self,name):
        #what kind of variable is name
        table = self.getTableOf(name)
        if table != None:
            names = [i.name for i in table]
            if name in names:
                kind =  table[names.index(name)].kind
                return kind
        return None
        
        
    def typeOf(self,name):
       #what type of variable is name
        table = self.getTableOf(name)
        if table != None:
            names = [i.name for i in table]
            if name in names:
                return table[names.index(name)].type
        return None
    
    def getTableOf(self,name):
        #returns the table which contains our variable
        #is our name in the subroutine
        names = [i.name for i in self.subroutineTable]
        if name in names:
            return self.subroutineTable
        
        #is our name a class var?
        names = [i.name for i in self.classTable]
        if name in names:
            return self.classTable
    
    def indexOf(self,name):
        #what is the index of name
        table = self.getTableOf(name)
        if table != None:
            nameKind = self.kindOf(name)
            names = [i.name for i in table if i.kind == nameKind]
            if name in names:
                return names.index(name)

        return None
    def printTables(self):    
        print('classTable',self.classTable)
        print('subroutineTable',self.subroutineTable)
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
