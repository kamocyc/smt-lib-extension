const sexp = require('sexp');
const vscode = require('vscode');

function getFullDocRange(document) {
	return document.validateRange(
		new vscode.Range(
			new vscode.Position(0, 0),
			new vscode.Position(Number.MAX_VALUE, Number.MAX_VALUE)
		)
	);
}

function format(text) {
  const exp = sexp("(" + text + ")");
  const indentDepth = "  ";
  
  function format_inner2(exp) {
    return "(" + exp.map((s, i) => {
      if(Array.isArray(s)) {
        s = format_inner2(s);
      }
      
      return (i === 0 ? "" : " ") + s;
    }).join("") + ")";
  }
  
  function format_inner(exp, indent) {
    if(exp.length >= 1 && ["declare-fun", "declare-const"].indexOf(exp[0]) !== -1) {
      return format_inner2(exp);
    }
    if(exp.length >= 1 && ["exists", "forall"].indexOf(exp[0]) !== -1) {
      if(exp.length === 3 && Array.isArray(exp[1]) && Array.isArray(exp[2])) {
        return "(" + exp[0] + " " + format_inner2(exp[1]) + "\n" + indent + indentDepth + format_inner(exp[2], indent + indentDepth) + "\n" + indent + ")";
      }
    }
    let contains_newline = false;
    return "(" +
      exp.map((s, i) => {
        if(Array.isArray(s)) {
          contains_newline = true;
          return "\n" + indent + indentDepth + format_inner(s, indent + indentDepth);
        } else {
          return (i === 0 ? "" : (Array.isArray(exp[i - 1]) ? ("\n" + indent + indentDepth) : " ")) + s;
        }
      }).join("") +
    (contains_newline ? ("\n" + indent) : "") +
    ")";
  }
  
  return exp.map(e => {
    return format_inner(e, "");
  }).join("\n");
}

// (() => {
//   const a = "(assert (forall ((n4 Int) (recQs1835 Int)) (=> (and (X126 recQs1835 n4) (and (and (>= recQs1835 1) (>= recQs1835 (+ 1 (* (- 0 1) n4)))) (>= recQs1835 (+ 1 (* 1 n4))))) (X154 recQs1835 n4))))\n(assert (forall ((n4 Int)(n5 Int)) (+ 10 20)))(forall aaa bbb (+ 1 2))";
//   console.log(format(a));
// })();

function activate(context) {
	vscode.languages.registerDocumentFormattingEditProvider('smt-lib', {
		provideDocumentFormattingEdits(document) {
      const text = document.getText();
      
      const formatted_text = format(text);
      
			return [vscode.TextEdit.replace(getFullDocRange(document), formatted_text)];
		}
	});
}

module.exports.activate = activate;
