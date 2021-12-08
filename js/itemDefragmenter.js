/**
 * Fetches an item from the server and defragments it.
 * @param {string} itemID The ID of the item to defragment.
 * @param {string} mimeType The MIME type of the item to defragment.
 * @param {string} [itemName] The name of the item to defragment.
 * @returns {Promise} A promise that resolves to a blob URL of the defragmented item.
 * @author EM_3
 */
function defragmentItem(itemID, mimeType, itemName = "") {
    return fetch(`/api/item/${itemID}`)
    .then(response => response.json())
    .then(function(fragments) {
        return Promise.all(fragments.map(fragment =>{
            return fetch(`/api/item/${itemID}/fragment/${fragment}`);
        }));
    })
    .then(fragmentResponses => {
        return Promise.all(fragmentResponses.map(fragmentResponse => {
            return fragmentResponse.arrayBuffer();
        }));
    })
    .then(fragmentBuffers => {
        return Promise.resolve(URL.createObjectURL(new File(fragmentBuffers, itemName, {type: mimeType})));
    })
}