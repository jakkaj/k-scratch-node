class stringHelpers{
     trim(s:string, charlist:string){

        s = s.replace(new RegExp("[" + charlist + "]+$"), "");
        s = s.replace(new RegExp("^[" + charlist + "]+"), "");

        return s; 
    }
}

export {stringHelpers};