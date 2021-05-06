// Client library

/*
  spreadItems spread an array of items into buckets held in the
  itemsSets array. Buckets may contain at most count (default 20)
  items. total is the total number of items that might be stored
  in buckets. Not all items are necessarily present at first. 

  @param {Array} itemsSets
  @param {Array} items
  @param {integer} total 
  @param {integer} count


  itemsSets = [
     { show: bool,    // displayed
       filling: bool, // in the process of being filled
       dirty: bool,   // bucket changed
       items: [ ... ] 
     }, 
     ... ]
  itemsSets.initialized: bool 

  Once the itemsSets array is created, it should never change: its
  length should remain constant. Only the content of buckets can
  change.

  Usage:
    spreadItems([], items)
    spreadItems(undefined, items, 123)  // items containing 45 items

*/

export function spreadItems (itemsSets, items, total, count = 20) {
    function initializeItemsSets () {
        for ( let i = 0 ; i < Math.ceil((total * 1.0)/count) ; i++ ) {
            itemsSets[i] = {
                show: false,
                filling: false,
                dirty: false,
                items: [] };
        }
    }
    if ( ! Array.isArray(itemsSets) ) {
        itemsSets = [];
    }
    if ( ! total ) {
        total = items.length;
    }
    if ( ! itemsSets.initialized ) {
        initializeItemsSets(total);
        itemsSets.initialized = true;
    }
    let index = 0;
    for ( let i=0 ; i<itemsSets.length ; i++ ) {
        const itemsSet = itemsSets[i];
        itemsSet.show = itemsSet.dirty = false;
        for ( let j=0 ; j<count ; j++ ) {
            if ( items[index+j] ) {
                itemsSet.show = true;
                if ( itemsSet.items[j] !== items[index+j] ) {
                    itemsSet.dirty = true;
                    itemsSet.items[j] = items[index+j];
                }
            } else {
                delete itemsSet.items[j];
            }
        }
        index += count;
    }
    return { itemsSets, items, total, count };
}

/*
  Detect end of screen and get some more items.
*/

export function installTarget (lastLineTarget, seeMore) {
    async function handleIntersection (entries, observer) {
        console.log('handleIntersection', {entries});
        if ( entries[0].isIntersecting ) {
            await seeMore();
        }
    }
    let observer = new IntersectionObserver(
        handleIntersection, {
            root: null,
            rootMargin: "100px",
            threshold: 0.5
        });
    //console.log({lastLineTarget});//DEBUG
    observer.observe(lastLineTarget);
}

/*
   reverse an array into a new array. 
*/

export function reverse (array) {
    const result = [];
    for ( let i=0 ; i<array.length ; i++ ) {
        result[i] = array[array.length - 1 - i];
    }
    return result;
}

// end of spreadlib.mjs
