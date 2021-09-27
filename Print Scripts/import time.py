import time
import os
import smtplib
import imghdr
from email.message import EmailMessage
import re

EMAIL_ADDRESS = 'usagutstein@gmail.com'
EMAIL_PASSWORD = 'nellynelly'

firstname = 'Philipp'
lastname = 'Gutstein'
address = 'Heckenweg 45'
town = 'Leonberg'
zip = '71229'
state = 'Germany'

with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
	smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
	with open("colleges.txt") as fp:
		line = fp.readline()
		while(line):
			linesplit = re.split(r'\t+', line)
			print(linesplit[0] + " : " + linesplit[1])
			msg = EmailMessage()
			msg['Subject'] = 'A Request From A Future Applicant'
			msg['From'] = EMAIL_ADDRESS
			msg.set_content('Hello ' + linesplit[0] + ' Admissions.\n\nIm just in my overseas gap-year program and want to apply to ' + linesplit[0] + ' for the upcoming semester. It would mean the world to me you could send me a shirt or some other apparel, so I could represent your university in my time in europe.\n\nIf possible, could you please send to \n\n'+ firstname + ' ' + lastname +'\n'+ address + '\n' + town + ',' + zip + ' ' + state + '\n\n Thank you soooo much!,\n' + firstname)
			msg['To'] = linesplit[1]
			line = fp.readline()		
			smtp.send_message(msg)
        