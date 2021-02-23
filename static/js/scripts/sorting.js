/**
 * @param {ARRAY} array         Array dass sortiert wird
 * @param {STRING} sortBy       wonach wird sortiert : zb. 'name', 'date', 'color'
 * @param {STRING} sortOrder    bestimmt die sortier Richtung : 'ascending' oder 'descending'
 */
function sortBoard(array, sortBy, sortOrder){
    array.sort((a,b) => {
        if(sortBy == 'name'){
            if(a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) return -1;
            if(a[sortBy].toLowerCase() > b[sortBy].toLowerCase()) return 1;    
        }
        else{
            if(a[sortBy] < b[sortBy]) return -1;
            if(a[sortBy] > b[sortBy]) return 1;
        }
        return 0;
    });
    if(sortOrder == 'descending') return array.reverse();
    return array;
};

export default sortBoard;