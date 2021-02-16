// Type definitions for node_modules/sexp/index.js

declare namespace sexp {
  var SPACE : RegExp;
  var ATOM : RegExp;
  var NUMBER : RegExp;

  interface Options {
    translateSymbol?: (sym: string) => any;
    translateString?: (str: string) => any;
    translateNumber?: (str: string) => any; 
  }
}

declare function sexp(source : string, opts? : sexp.Options): any[];

export = sexp
