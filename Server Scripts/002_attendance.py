# Title: Employee Shifts and Attendance: Custom Code to embed target work hours per weekday
# Needs another script to function: []
# Project/Task: 00181 ERPNext
# Client/Customer: K-00181
# Last Modified: 09.09.2021
# Version: 0.5.0
# Author: Marius Widmann, Philipp Gutstein
# Licence:
# Documentation: https://handbuch.tueit.de/books/erpnext-handbuch-marius/page/employee-shifts-and-attendance-custom-code-to-embed-target-work-hours-per-weekday

# Pull nominal-value from Doctype "Working Hours Employee"
results = frappe.db.get_all('Working Hours Employee',
    filters={
        'employee': ['=', doc.employee],
		'from_date': ['<=', doc.attendance_date],
		'to_date': ['>=', doc.attendance_date]
	},
	fields=['name', 'title', 'employee', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
	page_length=1000000
)

# Errorhandling if none or more than one possible solutions then warn the user
if len(results) != 1 :
	frappe.msgprint(
		msg='There are none or more than one target work hours for the current attendance date existent.',
		title='Error',
		raise_exception=SystemError
	)
else:
    result = results[0]
    
    # Convert attendance date to weekday written in non-capital letters
    formatted_datetime_object = frappe.utils.getdate(doc.attendance_date)
    weekday = frappe.utils.get_weekday(formatted_datetime_object)
    weekday = weekday.casefold()
    
    # Target-value
    target_value_work_hours = result[weekday]
    
    # Copy target value to arbeitszeit_soll
    doc.db_set('arbeitszeit_soll', target_value_work_hours, commit=True)