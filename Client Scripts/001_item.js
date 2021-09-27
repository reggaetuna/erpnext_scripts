// Title: MultiSelectDialog for Delivery Note: A flexible alternative to Packing Slip
// Needs another script to function: [002_delivery_note.js, ]
// Project/Task: TASK-2021-00532
// Client/Customer: K-00157
// Last Modified: dd.08.2021
// Version: 0.8.0
// Author: Marius Widmann
// Licence:
// Documentation: https://handbuch.tueit.de/books/erpnext-handbuch-marius/page/multiselectdialog-for-delivery-note-a-flexible-alternative-to-packing-slip


frappe.ui.form.on('Item', {
	delivery_note_barcode_type(frm) {
	    
	    // Get barcode_type that the shipping warehouse uses for packaging items into shipping boxes
		let barcode_type = frm.doc.delivery_note_barcode_type;
		
		// From the childtable Barcode Items get the barcode
		let delivery_note_barcode = ""
		for (let i = 0; i < frm.doc.barcodes.length; i++){
		    let row = frm.doc.barcodes[i]
		    if(barcode_type == row.barcode_type){
		        delivery_note_barcode = row.barcode
		    }
		}
		
		// Set the field delivery_note_barcode
		frm.set_value("delivery_note_barcode", delivery_note_barcode);
	}
})