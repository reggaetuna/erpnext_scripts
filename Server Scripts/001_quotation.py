# Title: Employee Shifts and Attendance: Custom Code to embed target work hours per weekday
# Needs another script to function: []
# Project/Task: 00181 ERPNext
# Client/Customer: K-00181
# Last Modified: 20.09.2021
# Version: 0.2.0
# Author: Marius Widmann, Philipp Gutstein
# Licence:
# Documentation: https://handbuch.tueit.de/books/erpnext-handbuch-marius/page/kinds-of-positions-in-quotation-replaces-parts-the-of-the-manufacturing-module

for item in doc.items:
    if item.positionsart != "Standard" :
        item.rate = 0
        item.net_rate = 0
        item.amount = 0
        item.net_amount = 0