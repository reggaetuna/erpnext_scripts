// Title: MultiSelectDialog for Delivery Note: A flexible alternative to Packing Slip
// Needs another script to function: [001_item.js, ]
// Project/Task: TASK-2021-00532
// Client/Customer: K-00157
// Last Modified: 21.09.2021
// Version: 0.8.4
// Author: Marius Widmann
// Licence:
// Documentation: https://handbuch.tueit.de/books/erpnext-handbuch-marius/page/multiselectdialog-for-delivery-note-a-flexible-alternative-to-packing-slip


// Setting some global definitions
var already_packed_items = [];
var selections = [];
var eventlistener_attached = false;
var remaininglist = [];
var delivery_note_barcode_node = null;
var dialog = null;

// Workflow-Control variables
var openMultiSelectDialog = true;
var qtyAllItemsIsZero = false;

function simulate(element, eventName)
{
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers)
    {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
};
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
};

function toggleEventListener(){ 
    if(eventlistener_attached === true){
        delivery_note_barcode_node.removeEventListener("input", updateModel);
        eventlistener_attached = false;
    }else{
        delivery_note_barcode_node.addEventListener("input", updateModel);
        eventlistener_attached = true;
    }
}

function updateView(){
    
    // Update List
    document.getElementsByClassName("frappe-control").forEach(function(element){
        let datafieldname = element.getAttribute("data-fieldname");
        if(datafieldname == "results_area"){
            let childs = element.childNodes[0].childNodes;
            childs.forEach(function(child){
                if(child.getAttribute("class") == "list-item-container"){

                    // Define and set variables
                    let name = child.childNodes[0].childNodes[3].childNodes[1].innerText;
                    let item_name = child.childNodes[0].childNodes[4].childNodes[1].innerText;
                    let delivery_note_barcode = child.childNodes[0].childNodes[5].childNodes[1].innerText;
                    let qty = child.childNodes[0].childNodes[6].childNodes[1].innerText;

                    // Update list view
                    remaininglist.forEach(function(item){
                        if(name == item.name){
                            // Update input field delivery_note_barcode and qty for each item
                            child.childNodes[0].childNodes[5].childNodes[1].innerText = item.delivery_note_barcode; // delivery_note_barcode div
                            child.childNodes[0].childNodes[6].childNodes[1].innerText = item.qty; // qty div
                        }
                    });

                    // Remove unnecessary setters
                    let setters = document.querySelectorAll(".form-column.col-sm-4");
                    for(let i = 0; i < 2; i++){
                        setters[i].style.display = 'none';
                    }
                    /** 
                    // Remove name column ( under construction )
                    let name_column_nodes = document.querySelectorAll(".list-item__content.ellipsis");
                    for(let i = 0; i < name_column_nodes.length; i++){
                        if(i%4 == 0){
                            name_column_nodes[i].style.display = 'none';
                        }
                    }
                    */
                    
                }
            });
        }
    });    
}

function updateModel(){
    console.log("updateModel > run");
    // Stop this from running every millisecond or so by toggling the eventlistener on the field
    toggleEventListener();
    if(delivery_note_barcode_node.value.length !== 0){
        console.log("updateModel > input field barcode input deteceted");
        setTimeout(function(){
            console.log("updateModel > do qty reduction if barcode matches item's barcode");
            document.getElementsByClassName("frappe-control").forEach(function(element){
                let datafieldname = element.getAttribute("data-fieldname");
                if(datafieldname == "results_area"){
                    let childs = element.childNodes[0].childNodes;
                    childs.forEach(function(child){
                        if(child.getAttribute("class") == "list-item-container"){

                            // Define variables and set variables
                            let name = child.childNodes[0].childNodes[3].childNodes[1].innerText;
                            let item_name = child.childNodes[0].childNodes[4].childNodes[1].innerText;
                            let delivery_note_barcode = child.childNodes[0].childNodes[5].childNodes[1].innerText;
                            let qty = child.childNodes[0].childNodes[6].childNodes[1].innerText;
    
                            // Search for item in remaininglist and update qty of item
                            let barcode_match = false;
                            remaininglist.forEach(function(item){
                                if(delivery_note_barcode_node.value == item.delivery_note_barcode){
                                    // Update the model
                                    console.log("updateModel > perfect barcode match found. do qty reduction");
                                    if(checkIfQtyIsExactlyZero(item.qty)){
                                        frappe.show_alert({
                                            message:__('This item\'s Quantity is already zero. You are packing to much.'),
                                            indicator:'red'
                                        }, 5);
                                    }else{
                                        item.qty = item.qty - 1;
                                    }
                                    barcode_match = true;
                                    
                                    // Cleanup the input fields
                                    clearBarcodeField();
                                    focusBarcodeField();
                                }
                            });
                            if(barcode_match === false){
                                console.log("updateModel > qty reduction not done. no perfect barcode match found");
                            }
                        }
                    });
                    if(childs.length === 0){
                        console.log("updateModel > qty reduction not done. no barcode match found. no item in list");
                    }
                }
            });

            // > Check if qty is zero
            if(checkTotalQty() === 0){
                frappe.show_alert({
                    message:__('All items have been scanned. You can submit the dialog now.'),
                    indicator:'green'
                }, 5);
                openMultiSelectDialog = false;
                qtyAllItemsIsZero = true;
            }
            toggleEventListener();
        }, 30); // Wie oft kann ein Mensch einen Artikel pro Sekunde scannen? Kasse Penny/Netto/Aldi/Lidl => Knapp unter einer Sekunde => 799 Millisekunden
    }
}

function checkTotalQty(){
    let total_qty = 0;
    remaininglist.forEach(function(item){
        total_qty = total_qty + item.qty;
    });
    return total_qty;
}

function checkIfQtyIsExactlyZero(qty){
    if(qty == 0){
        return true;
    }else{
        false;
    }
}

function focusBarcodeField(){
    document.getElementsByClassName("input-with-feedback").forEach(function(element){
        let datafieldname = element.getAttribute("data-fieldname");
            if(datafieldname == "delivery_note_barcode"){
                console.log("focusBarcodeField > found dom-node, setting mouse cursor focus");
                element.focus();
            }
    });
}

function clearBarcodeField(){
    document.getElementsByClassName("input-with-feedback").forEach(function(el){
        let datafieldname = el.getAttribute("data-fieldname");
            if(datafieldname == "delivery_note_barcode"){
                console.log("clearBarcodeField > found dom-node, clearing");
                el.value = "";
                const e = new Event("change");
                //el.dispatchEvent(e);
            }
    });
}

// The recursive pack_bag function getting called from the collect_items button
function pack_bag(frm, selections = [], already_packed_items = [], all_items = []){
    
    // Define variables and set defaults

    // > Caching variables
    if(Array.isArray(selections)){
        
    }else{
        selections = [];
    }
    
    if(Array.isArray(already_packed_items)){
        
    }else{
        already_packed_items = [];
    }
    
    if(Array.isArray(all_items)){
        
    }else{
        all_items = [];
    }

    // > Create array with all items from the items childtable
    for (let i = 0; i < frm.doc.items.length; i++){
        let name = frm.doc.items[i].name;
        // If item has not been packed add it to the item list
        if(all_items.indexOf(name) < 0){
            all_items.push(name);
        }
    }

    // > Add the selected items to the list of already packed items
    for ( let i = 0; i < selections.length; i++){
        if(already_packed_items.indexOf(selections) < 0){
            already_packed_items.push(selections[i]);
        }
    }

    // > Create Array for items to show in listview
    let remaining_items = [];
    for ( let i = 0; i < all_items.length; i++){
        let name = all_items[i];
        if(already_packed_items.indexOf(name) < 0){
            remaining_items.push(name);
        }
    }
    console.log("Coding makes people seem ugly and weird.");
    console.log("Selected in previous dialog: ");
    console.log(selections);
    console.log("Already packed items: ");
    console.log(already_packed_items);
    console.log("All items: ");
    console.log(all_items);
    

    // > Check via dialog recursion if items have been marked and removed from the list ( this can be thrown out or archived )
    /**
    if(remaining_items.length === 0){
        frappe.msgprint({
            title: __('Notification'),
            indicator: 'red',
            message: __('All items have been manually marked.')
        });
        openMultiSelectDialog = false;
    }
    */

    // Show Dialog for collecting the items
    if(openMultiSelectDialog === true){
        console.log("Trying to open Dialog.");
        let dialog = new frappe.ui.form.MultiSelectDialog({
            doctype: "Delivery Note Item",
            target: frm,
            setters: {
                item_name: "",
                delivery_note_barcode: "",
                qty: "",
            },
            date_field: "creation",
            get_query() {
                return {
                    filters: {
                        //disabled: "No",
                        //barcode: ["in", barcodes]
                        name: ["in", remaining_items],
                    }
                };
            },
            action(selections) {
                /**
                // Recursively open the MultiDialog if using checkboxes this will remove the marked item from the itemlist ( this can be thrown out or archived )
                pack_bag(frm, selections, already_packed_items, all_items);
                */

                // Submit form if qty of all items is exactly zero
                if(qtyAllItemsIsZero == true){
                    // Submit Document & Close dialog
                    frappe.msgprint((__('Done. Please close the Dialog.')));
                    //simulate(document.querySelector("btn.btn-modal-close.btn-link"), "click");

                }else{
                    // Notify that qty is not zero and leave dialog open aka do nothing
                    frappe.msgprint((__('There is an item that is not packed in the right quantity')));
                }
            }
        });    
        console.log("updateView > run");
    
        // > Event listener on html body to initialize variables when dialog is being opened
        document.getElementsByTagName("BODY").forEach(function(element){
            setTimeout(function(){
                document.getElementsByClassName("input-with-feedback").forEach(function(element){
                    let datafieldname = element.getAttribute("data-fieldname");
                    if(datafieldname == "delivery_note_barcode"){

                        // > > Change label of "Get items"-Button
                        document.querySelectorAll(".btn.btn-primary.btn-sm.btn-modal-primary")[0].innerHTML = "Submit";
                        
                        // > > Define variables and set/reset variables if there was no eventlistener attached at this point in time
                        if(eventlistener_attached === false){
                            
                            // > > SetInterval for updating the view
                            setInterval(updateView, 50); // Normale Displays flimmern mit 60 Hertz, d.h. 1000 Millisekunden / 60 Hertz = Bildschirmwiederholrate 17 Millisekunden pro Hertz
                            
                            // > > Attach event listeners to delivery_note_barcode
                            console.log("Adding Eventlistener to barcode field");
                            delivery_note_barcode_node = element;
                            delivery_note_barcode_node.addEventListener("input", updateModel);
                            eventlistener_attached = true;
                            
                            // > > Focus Barcodefield with mouse cursor
                            focusBarcodeField();
                            
                            // > > Update Size of Dialog
                            document.getElementsByClassName("modal-content").forEach(function(element){
                                // object.style.flex = "flex-grow flex-shrink flex-basis|auto|initial|inherit" 
                                element.style.flex = "0 0 25cm";
                            });
                            document.getElementsByClassName("modal-dialog").forEach(function(element){
                                element.style.margin = "5% auto 20% 20%";
                            });
                        }   
                    }
                });
            }, 500);
        });
    }
}

frappe.ui.form.on('Delivery Note', {
	collect_items(frm) {
        eventlistener_attached = false;
        let itemdata = frm.fields_dict.items.grid.data;
        itemdata.forEach(function(item){
            remaininglist.push({
                name: item.name,
                item_name: item.item_name,
                delivery_note_barcode: item.delivery_note_barcode,
                qty: item.qty
            });
        });
        pack_bag(frm);
	}
});