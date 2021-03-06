// Common utilities for editors

export async function makeInitializeEditor (language, file, textareaInput) {
    const CodeMirrorPromise = import('codemirror');
    const cm = await CodeMirrorPromise;
    if ( ! language ) {
        language = chooseProgrammingLanguage(exercise);
    }
    customizeEditorForLanguage(language);
    let initialValue = '\n';
    if ( file && file.initial ) {
        initialValue = file.initial._ ;
    }
    let options = {
        lineNumbers: true,
        lineWrapping: false,
        indentWithTabs: false,
        indentUnit: 2,
        tabSize: 2,
        //viewportMargin: Infinity,
        spellcheck: false,
        autofocus: true,
        allowDropFileTypes: [ 'text/plain' ],
        mode: language
    };
    const editor = cm.fromTextArea(textareaInput, options);
    setTimeout(() => {
        editor.setValue(initialValue);
        editor.addKeyMap(cm.keyMap.emacsy);
        editor.setOption('mode', language);
        editor.refresh();
    }, 800);
    return editor;
}

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

 function chooseProgrammingLanguageFromTags (tags) {
   for ( let tag of tags ) {
     if ( tag.match(/^(sh|bash|shell)$/i) ) {
       return 'shell';
     } else if ( tag.match(/^(c|java)$/i) ) {
       return 'clike';
     } else if ( tag.match(/^(js|javascript)$/i) ) {
       return 'javascript';
     } else if ( tag.match(/^((o?ca)?ml)$/) ) {
       return 'mllike';
     } else if ( tag.match(/^python3?$/) ) {
       return 'python';
     } else if ( tag.match(/^(scheme|perl|php|sql)$/i) ) {
       return tag.toLowerCase();
     }
   }
 }

 function chooseProgrammingLanguageFromExtension (filename) {
   const extension = filename.replace(/^.*[.][^.]+$/, '');
   if ( extension.match(/^sh$/) ) {
     return 'shell';
   } else if ( extension.match(/^(c|cc|java)$/) ) {
     return 'clike';
   } else if ( extension.match(/^js$/) ) {
     return 'javascript';
   } else if ( extension.match(/^scm$/) ) {
     return 'scheme';
   } else if ( extension.match(/^py$/) ) {
     return 'python';
   } else if ( extension.match(/^pr?[lm]/) ) {
     return 'perl';
   } else if ( extension.match(/^php$/) ) {
     return 'php';
   } else if ( extension.match(/^ml$/) ) {
     return 'mllike';
   }
 }

 function chooseProgrammingLanguageFromExpectations (expectations) {
   if ( expectations && expectations.file ) {
     let file = expectations.file;
     if ( file.initial && file.initial.language ) {
       return file.initial.language;
     }
   }
 }

export function chooseProgrammingLanguage (exercise) {
    //console.log(exercise);//DEBUG
    let language = undefined;
    if ( exercise.expectations ) {
        language = chooseProgrammingLanguageFromExpectations(
            exercise.expectations);
        if ( language ) {
            return language;
        }
    }
    if ( exercise.tags ) {
        language = chooseProgrammingLanguageFromTags(exercise.tags);
        if ( language ) {
            return language;
        }
    }
    if ( exercise.inlineFileName ) {
        language = chooseProgrammingLanguageFromExtension(exercise.inlineFileName);
        if ( language ) {
            return language;
        }
    }
    return 'clike';
}

export function makeSendEditorContent (exercise, getAnswer, dispatch) {
    return function (event) {
        event.preventDefault();
        event.stopPropagation();
        try {
            const answer = getAnswer();
            dispatch('jobPromise', {jobPromise: null});
            const jobPromise = exercise.sendStringAnswer(answer);
            dispatch('jobPromise', {jobPromise});
        } catch (exc) {
            console.log('TextAreaString send Textarea', exc);
            throw "Je n'ai pas réussi à envoyer votre réponse!";
        }
    };
}

export function makeSendFile (exercise, dispatch) {
    return function (event) {
        const { chosenfile, FileChooserForm } = event.detail;
        if ( ! navigator.onLine ) {
            throw "Pas d'accès à Internet!";
        }
        try {
            dispatch('jobPromise', {jobPromise: null});
            const jobPromise = exercise.sendFileFromDOM(FileChooserForm, chosenfile)
            dispatch('jobPromise', {jobPromise});
        } catch (exc) {
            console.log('SingleFile sendFile', exc);
            throw "Je n'ai pas réussi à envoyer votre fichier!";
        }
    };
}

export function HTMLize (value) {
    if ( typeof value === 'undefined' ) {
        return "Résultat final: undefined";
    } else if ( value === null ) {
        return "Résultat final: null";
    } else {
        return htmlencode(value.toString());
    }
}

// end of editorlib.mjs
