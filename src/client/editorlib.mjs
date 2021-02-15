// Common utilities for editors

export function makeStoreEventHandler (exercise, getAnswer) {
    return function store (event) {
        event.stopPropagation();
        event.preventDefault();
        const filename = exercise.inlineFileName ||
              `${exercise.name}-yourAnswer.txt`;
        const answer = addFinalNewline(compress(getAnswer()));
        let result = 'data:text/plain;charset=utf-8,' +
            encodeURIComponent(answer);
        const element = document.createElement('a');
        element.setAttribute('href', result);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };
}

 // remove final empty lines:
function compress (s) {
    let result = s.replace(/(\s|\n)*$/, '');
    return result;
}

function addFinalNewline (s) {
    if ( ! s.endsWith('\n') ) {
        return s + '\n';
    }
    return s;
}

// Customize editor

export function customizeEditorForLanguage (language) {
    switch ( language ) {
    case 'clike': {
        import(`codemirror/mode/clike/clike.js`);
        break;
    }
    case 'javascript': {
        import(`codemirror/mode/javascript/javascript.js`);
        break;
    }
    case 'mllike': {
        import(`codemirror/mode/mllike/mllike.js`);
        break;
    }
    case 'octave': {
        import(`codemirror/mode/octave/octave.js`);
        break;
    }
    case 'perl': {
        import(`codemirror/mode/perl/perl.js`);
        break;
    }
    case 'python': {
        import(`codemirror/mode/python/python.js`);
        break;
    }
    case 'r': {
        import(`codemirror/mode/r/r.js`);
        break;
    }
    case 'scheme': {
        import(`codemirror/mode/scheme/scheme.js`);
        break;
    }
    case 'shell': {
        import(`codemirror/mode/shell/shell.js`);
        break;
    }
    default: {
        import(`codemirror/mode/clike/clike.js`);
        break;
    }         
    }
}

// end of editorlib.mjs
