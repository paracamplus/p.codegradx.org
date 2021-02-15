// Client library

let tablestates = {};

export function doSortColumn (key, items, hint) {
    function findTable (element) {
        if ( element.tagName !== 'TABLE' ) {
            return findTable(element.parentElement);
        } else {
            return element;
        }
    }
    function comparator (a, b) {
        let akey = a.key || ' ';
        let bkey = b.key || ' ';
        return ((akey <= bkey) ?
                (tablestates[tableId][key]*(-1)) :
                (tablestates[tableId][key]*(+1)) );
    }
    function recordColumnOrder (tableId, key) {
        if ( ! tablestates[tableId] ) {
            tablestates[tableId] = {};
        }
        if ( ! tablestates[tableId][key] ) {
            tablestates[tableId][key] = +1;
        } else {
            tablestates[tableId][key] = -(tablestates[tableId][key]);
        }
    }
    let table = findTable(event.target);
    let tableId = table.getAttribute('id');
    recordColumnOrder(tableId, key);
    let keys = [];
    for (let i=0 ; i<items.length ; i++) {
        let item = items[i];
        let value = item[key];
        switch ( hint ) {
        case "date": {
            let d = Date.parse(value);
            if ( ! isNaN(d) ) {
                value = d;
            }
            break;
        }
        case "int": {
            let n = parseInt(value);
            if ( ! isNaN(n) ) {
                value = n;
            }
            break;
        }
        case "float": {
            let f = parseFloat(value);
            if ( ! isNaN(f) ) {
                value = f;
            }
            break;
        }            
        }
        keys.push({key: value, item});
    }
    keys = keys.sort(comparator);
    let newitems = keys.map((_) => _.item);
    return newitems;
}

// end of sortlib.mjs
