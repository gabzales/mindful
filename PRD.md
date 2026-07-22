Tujuan Platform
Platform EAP berbasis web sebagai Employee Wellbeing Portal yang mampu:
•	Registrasi peserta 
•	Assessment psikologis awal 
•	Booking konseling 
•	Webinar & Training 
•	Monitoring aktivitas 
•	Dashboard HR 
•	Reporting MI & AdMedika 
Target pembangunan MVP:
•	Web Responsive (mobile friendly) 
•	Cloud Based 
•	Multi Company 
•	Multi Admin 
•	Development 6–8 minggu 
________________________________________















┌──────────────────────────────────────────────────────────────┐
│               EMPLOYEE ASSISTANCE PROGRAM (EAP)              │
└──────────────────────────────────────────────────────────────┘
        👤 Employee
             │
             ▼
      🔐 Login / Register
             │
             ▼
     🏠 Personal Dashboard
             │
 ┌───────────┼───────────────────────────────┐
 │           │               │               │
 ▼           ▼               ▼               ▼
📊          💬              🎓              📅
Assessment  Counseling      Learning        Webinar
 │           │               │               │
 ▼           ▼               ▼               ▼
Auto Score   Booking       Video/PDF      Registration
 │           │               │               │
 └───────────┴───────────────┴───────────────┘
                     │
                     ▼
          📈 Progress Monitoring
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   🏢 HR Dashboard      🏥 AdMedika Dashboard
      (Agregat)             (Agregat)
                     │
                     ▼
             📄 Monthly Reporting

________________________________________
DETAIL USER FLOW
1. Employee Registration
Invitation Link
↓
Login
↓
OTP Email
↓
Create Password
↓
Complete Biodata
↓
Dashboard
Data:
•	Nama 
•	Email 
•	Company 
•	Department 
•	Job Level 
•	Gender 
•	Age 
________________________________________
2. Mental Health Assessment
Dashboard
↓
Start Assessment
↓
Questionnaire
↓
Submit
↓
Automatic Scoring
↓
Recommendation

Assessment dapat menggunakan:
•	Stress 
•	Burnout 
•	Emotional Wellbeing 
•	Sleep 
•	Work-Life Balance 
•	Resilience 
Output:
Stress : Low
Resilience : Medium
Burnout : High
Recommendation:
✓ Webinar
✓ Konseling
✓ Mindfulness Practice
________________________________________
3. Booking Konseling
Dashboard
↓
Book Counseling
↓
Choose Psychologist
↓
Choose Date
↓
Choose Time
↓
Confirmation
↓
Reminder Email
↓
Session
↓
Feedback
________________________________________
4. Webinar Flow
Dashboard
↓
Upcoming Webinar
↓
Register
↓
Reminder
↓
Join Zoom
↓
Attendance
↓
Feedback
↓
Certificate
________________________________________
5. Training Program
Training
↓
Choose Batch
↓
Register
↓
Attendance
↓
Evaluation
↓
Certificate
________________________________________
6. Learning Center
Dashboard
↓
Learning Library
↓
Video
Podcast
Article
Mindfulness Audio
↓
Finish
↓
History
________________________________________
7. Dashboard Employee
Modern dashboard sederhana.
----------------------------------------

Good Morning, Andi
Stress Score
72
Resilience
65
Upcoming Counseling
Upcoming Webinar
Learning Progress
Recommendation
----------------------------------------
________________________________________
8. Dashboard HR
HR hanya melihat data agregat.
Company Wellbeing Dashboard
Employees
430
Assessment Completion
87%
High Stress
19%
Medium
42%
Low
39%
Most Requested
Counseling
Department Risk
Finance
Sales
Operation
Top Issues
Stress
Sleep
Burnout
Tidak menampilkan data individu.
________________________________________
9. Dashboard MI
Administrator MI
Companies
Users
Counseling
Webinar
Training
Assessment
Psychologist Schedule
Reports
Invoice
Activity Log
________________________________________
10. Dashboard AdMedika
AdMedika hanya melihat:
Client List
Total Employee
Utilization Rate
Assessment Rate
Counseling Usage
Training Usage
Monthly Report
Download Report
________________________________________
ARSITEKTUR SEDERHANA (MVP)
                    Internet
                        │
        ┌────────────────────────────────┐
        │        Web Application         │
        │ Employee Wellbeing Portal      │
        └────────────────────────────────┘
      ┌────────────┬─────────────┬────────────┐
      ▼            ▼             ▼            ▼
 Assessment    Counseling    Webinar     Learning
      └────────────┬─────────────┬────────────┘
                   ▼
             Database
                   ▼
      Admin Dashboard
      HR Dashboard
      AdMedika Dashboard
________________________________________
MODUL MVP (WAJIB)
Modul	Prioritas
Login	⭐⭐⭐⭐⭐
Employee Profile	⭐⭐⭐⭐⭐
Assessment	⭐⭐⭐⭐⭐
Auto Scoring	⭐⭐⭐⭐⭐
Recommendation	⭐⭐⭐⭐⭐
Booking Konseling	⭐⭐⭐⭐⭐
Webinar Registration	⭐⭐⭐⭐
Training Registration	⭐⭐⭐⭐
Dashboard Employee	⭐⭐⭐⭐⭐
Dashboard HR	⭐⭐⭐⭐⭐
Dashboard MI	⭐⭐⭐⭐⭐
Reporting	⭐⭐⭐⭐⭐
Email Reminder	⭐⭐⭐⭐
________________________________________
Technical Requirement untuk Vendor
Area	Requirement MVP
Platform	Web responsive (desktop & mobile browser)
Framework	Laravel, Next.js, atau Node.js (sesuai keahlian vendor)
Database	PostgreSQL atau MySQL
Authentication	Email + OTP
Multi Tenant	Mendukung banyak perusahaan dalam satu platform
Role	Super Admin, MI Admin, HR Client, Employee, Psychologist
Calendar	Booking & penjadwalan konseling
Video Meeting	Integrasi Zoom/Google Meet via tautan
Reporting	Dashboard & ekspor PDF/Excel
Hosting	Cloud (VPS) dengan SSL
Keamanan	HTTPS, enkripsi password, audit log, backup harian

