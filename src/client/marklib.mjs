//

export function massageMark (mark, factor=100, totalMark=1.0) {
    if ( isNaN(mark) ) {
        return '';
    }
    if ( mark <= totalMark ) {
        return Math.round(factor * (mark/totalMark));
    } else {
        return mark;
    }
}

// end of marklib.mjs
