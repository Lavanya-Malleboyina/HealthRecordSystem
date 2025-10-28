// Global variables
let currentEditingId = null;
let patientsData = [];
let appointmentsData = [];
let vaccinationsData = [];
let reportsData = [];

// DOM Elements
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 Health Dashboard Initialized');
    
    initializeNavigation();
    setupEventListeners();
    
    // Test backend connection first
    testBackendConnection().then(isConnected => {
        if (isConnected) {
            console.log('✅ Backend connected, loading data...');
            loadInitialData();
        } else {
            console.error('❌ Backend not connected');
            alert('Backend server is not running! Please start the server on port 5000.');
        }
    });
});

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link and corresponding section
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
            
            // Load data for the active section
            if (sectionId === 'dashboard') {
                loadDashboardData();
            } else if (sectionId === 'patients') {
                loadPatients();
            } else if (sectionId === 'appointments') {
                loadAppointments();
            } else if (sectionId === 'vaccinations') {
                loadVaccinations();
            } else if (sectionId === 'reports') {
                loadReports();
            }
        });
    });
}

// Event Listeners
function setupEventListeners() {
    // Modal close events
    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.addEventListener('click', closeModalWindow);
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalWindow();
        }
    });
    
    // Add button events
    document.getElementById('add-patient-btn').addEventListener('click', () => showPatientForm());
    document.getElementById('add-appointment-btn').addEventListener('click', () => showAppointmentForm());
    document.getElementById('add-vaccination-btn').addEventListener('click', () => showVaccinationForm());
    document.getElementById('generate-report-btn').addEventListener('click', () => showReportForm());
}

// Load initial data
function loadInitialData() {
    loadDashboardData();
    loadPatients();
    loadAppointments();
    loadVaccinations();
    loadReports();
}

// Test backend connection
async function testBackendConnection() {
    console.log('🔍 Testing backend connection...');
    
    try {
        const response = await fetch('/api/test');
        const data = await response.json();
        
        console.log('✅ Backend is running:', data);
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        return false;
    }
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        // Load patients count
        const patientsResponse = await fetch('/api/patients');
        const patients = await patientsResponse.json();
        document.getElementById('total-patients').textContent = patients.length;
        
        // Load appointments count
        const appointmentsResponse = await fetch('/api/appointments');
        const appointments = await appointmentsResponse.json();
        document.getElementById('total-appointments').textContent = appointments.length;
        
        // Calculate village health (simplified metric)
        const villageHealth = Math.floor(Math.random() * 10); // Placeholder
        document.getElementById('village-health').textContent = villageHealth;
        
        // Calculate health trends (simplified metric)
        const healthTrends = Math.floor(Math.random() * 10); // Placeholder
        document.getElementById('health-trends').textContent = healthTrends;
        
        // Render chart
        renderPatientsChart(patients);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function renderPatientsChart(patients) {
    const ctx = document.getElementById('patients-chart');
    if (!ctx) return;
    
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Simple data grouping by age for demonstration
    const ageGroups = {
        '0-18': patients.filter(p => p.age <= 18).length,
        '19-35': patients.filter(p => p.age > 18 && p.age <= 35).length,
        '36-50': patients.filter(p => p.age > 35 && p.age <= 50).length,
        '51+': patients.filter(p => p.age > 50).length
    };
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ageGroups),
            datasets: [{
                label: 'Patients by Age Group',
                data: Object.values(ageGroups),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Patient Functions
async function loadPatients() {
    try {
        const response = await fetch('/api/patients');
        patientsData = await response.json();
        renderPatientsTable(patientsData);
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

function renderPatientsTable(patients) {
    const tbody = document.getElementById('patients-list');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    patients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.village}</td>
            <td>${patient.contact}</td>
            <td class="action-buttons">
                <button class="btn-secondary" onclick="editPatient('${patient._id}')">Edit</button>
                <button class="btn-danger" onclick="deletePatient('${patient._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showPatientForm(patient = null) {
    currentEditingId = patient ? patient._id : null;
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <h3>${patient ? 'Edit Patient' : 'Add New Patient'}</h3>
            <span class="close">&times;</span>
        </div>

        <div class="form-scroll-container">
            <form id="patient-form">
                <!-- SUBMIT BUTTON AT TOP INSIDE FORM -->
                <div class="form-actions-top">
                    <button type="submit" class="btn-primary" id="submit-patient-btn">${patient ? 'Update Patient' : 'Add Patient'}</button>
                    <button type="button" class="btn-secondary" onclick="closeModalWindow()">Cancel</button>
                </div>

                <div class="form-group">
                    <label for="patient-name" class="required">Name</label>
                    <input type="text" id="patient-name" value="${patient ? patient.name : ''}" required placeholder="Enter patient's full name">
                </div>
                
                <div class="form-group">
                    <label for="patient-age" class="required">Age</label>
                    <input type="number" id="patient-age" min="0" max="120" value="${patient ? patient.age : ''}" required placeholder="Enter age">
                </div>
                
                <div class="form-group">
                    <label for="patient-gender" class="required">Gender</label>
                    <select id="patient-gender" required>
                        <option value="">Select Gender</option>
                        <option value="Male" ${patient && patient.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${patient && patient.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${patient && patient.gender === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="patient-village" class="required">Village</label>
                    <input type="text" id="patient-village" value="${patient ? patient.village : ''}" required placeholder="Enter village name">
                </div>
                
                <div class="form-group">
                    <label for="patient-contact" class="required">Contact</label>
                    <input type="text" id="patient-contact" value="${patient ? patient.contact : ''}" required placeholder="Enter contact number">
                </div>
                
                <div class="form-group">
                    <label for="patient-medical-history">Medical History</label>
                    <textarea id="patient-medical-history" placeholder="Enter any medical history or conditions">${patient ? patient.medicalHistory : ''}</textarea>
                </div>
            </form>
        </div>
    `;
    
    // Re-attach close event to the new close button
    const closeBtn = modalBody.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModalWindow);
    }
    
    // Add form submission handler
    const form = document.getElementById('patient-form');
    form.addEventListener('submit', handlePatientSubmit);
    
    // Show the modal
    modal.style.display = 'block';
    
    // Focus on the first input field
    document.getElementById('patient-name').focus();
}

async function handlePatientSubmit(e) {
    e.preventDefault();
    console.log('Form submission started...');
    
    // Get form values
    const name = document.getElementById('patient-name').value.trim();
    const age = parseInt(document.getElementById('patient-age').value);
    const gender = document.getElementById('patient-gender').value;
    const village = document.getElementById('patient-village').value.trim();
    const contact = document.getElementById('patient-contact').value.trim();
    const medicalHistory = document.getElementById('patient-medical-history').value.trim();

    // Basic validation
    if (!name || !age || !gender || !village || !contact) {
        alert('Please fill in all required fields');
        return;
    }

    if (age < 0 || age > 120) {
        alert('Please enter a valid age (0-120)');
        return;
    }

    const patientData = {
        name: name,
        age: age,
        gender: gender,
        village: village,
        contact: contact,
        medicalHistory: medicalHistory
    };
    
    console.log('Submitting patient data:', patientData);
    
    try {
        // Show loading state
        const submitBtn = document.getElementById('submit-patient-btn');
        if (submitBtn) {
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;
        }

        // Submit the patient data
        const url = currentEditingId ? `/api/patients/update/${currentEditingId}` : '/api/patients/add';
        console.log('Making request to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });
        
        console.log('Response status:', response.status);
        
        let result;
        try {
            result = await response.json();
            console.log('Response data:', result);
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            throw new Error('Invalid response from server');
        }
        
        if (response.ok) {
            console.log('Patient saved successfully!');
            closeModalWindow();
            loadPatients();
            loadDashboardData();
            alert(currentEditingId ? 'Patient updated successfully!' : 'Patient added successfully!');
        } else {
            console.error('Server error:', result);
            throw new Error(result.message || result || 'Error saving patient');
        }
    } catch (error) {
        console.error('Error saving patient:', error);
        
        // More detailed error messages
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            alert('❌ Cannot connect to server. Please check if the backend server is running on port 5000.');
        } else {
            alert('Error saving patient: ' + error.message);
        }
    } finally {
        // Restore button state
        const submitBtn = document.getElementById('submit-patient-btn');
        if (submitBtn) {
            submitBtn.textContent = currentEditingId ? 'Update Patient' : 'Add Patient';
            submitBtn.disabled = false;
        }
    }
}

function editPatient(id) {
    const patient = patientsData.find(p => p._id === id);
    if (patient) {
        showPatientForm(patient);
    }
}

async function deletePatient(id) {
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            const response = await fetch(`/api/patients/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadPatients();
                loadDashboardData();
                alert('Patient deleted successfully!');
            } else {
                const error = await response.json();
                alert('Error deleting patient: ' + error);
            }
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('Error deleting patient: ' + error.message);
        }
    }
}

// Appointment Functions
async function loadAppointments() {
    try {
        const response = await fetch('/api/appointments');
        appointmentsData = await response.json();
        renderAppointmentsTable(appointmentsData);
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

function renderAppointmentsTable(appointments) {
    const tbody = document.getElementById('appointments-list');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.patientId ? appointment.patientId.name : 'Unknown'}</td>
            <td>${new Date(appointment.date).toLocaleDateString()}</td>
            <td>${appointment.time}</td>
            <td>${appointment.reason}</td>
            <td>${appointment.status}</td>
            <td class="action-buttons">
                <button class="btn-secondary" onclick="editAppointment('${appointment._id}')">Edit</button>
                <button class="btn-danger" onclick="deleteAppointment('${appointment._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAppointmentForm(appointment = null) {
    currentEditingId = appointment ? appointment._id : null;
    
    // Load patients for dropdown
    const patientOptions = patientsData.map(p => 
        `<option value="${p._id}" ${appointment && appointment.patientId && appointment.patientId._id === p._id ? 'selected' : ''}>${p.name}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <h3>${appointment ? 'Edit' : 'Schedule New'} Appointment</h3>
            <span class="close">&times;</span>
        </div>
        <form id="appointment-form">
            <div class="form-group">
                <label for="appointment-patient">Patient</label>
                <select id="appointment-patient" required>
                    <option value="">Select Patient</option>
                    ${patientOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="appointment-date">Date</label>
                <input type="date" id="appointment-date" value="${appointment ? new Date(appointment.date).toISOString().split('T')[0] : ''}" required>
            </div>
            <div class="form-group">
                <label for="appointment-time">Time</label>
                <input type="time" id="appointment-time" value="${appointment ? appointment.time : ''}" required>
            </div>
            <div class="form-group">
                <label for="appointment-reason">Reason</label>
                <input type="text" id="appointment-reason" value="${appointment ? appointment.reason : ''}" required>
            </div>
            <div class="form-group">
                <label for="appointment-status">Status</label>
                <select id="appointment-status" required>
                    <option value="Scheduled" ${appointment && appointment.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option value="Completed" ${appointment && appointment.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${appointment && appointment.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModalWindow()">Cancel</button>
                <button type="submit" class="btn-primary">${appointment ? 'Update' : 'Schedule'} Appointment</button>
            </div>
        </form>
    `;
    
    // Re-attach close event
    const closeBtn = modalBody.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModalWindow);
    }
    
    document.getElementById('appointment-form').addEventListener('submit', handleAppointmentSubmit);
    modal.style.display = 'block';
}

async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const appointmentData = {
        patientId: document.getElementById('appointment-patient').value,
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value,
        reason: document.getElementById('appointment-reason').value,
        status: document.getElementById('appointment-status').value
    };
    
    try {
        const url = currentEditingId ? `/api/appointments/update/${currentEditingId}` : '/api/appointments/add';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });
        
        if (response.ok) {
            closeModalWindow();
            loadAppointments();
            loadDashboardData();
            alert('Appointment saved successfully!');
        } else {
            const error = await response.json();
            alert('Error saving appointment: ' + error);
        }
    } catch (error) {
        console.error('Error saving appointment:', error);
        alert('Error saving appointment: ' + error.message);
    }
}

function editAppointment(id) {
    const appointment = appointmentsData.find(a => a._id === id);
    if (appointment) {
        showAppointmentForm(appointment);
    }
}

async function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        try {
            const response = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadAppointments();
                loadDashboardData();
                alert('Appointment deleted successfully!');
            } else {
                const error = await response.json();
                alert('Error deleting appointment: ' + error);
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Error deleting appointment: ' + error.message);
        }
    }
}

// Vaccination Functions
async function loadVaccinations() {
    try {
        const response = await fetch('/api/vaccinations');
        vaccinationsData = await response.json();
        renderVaccinationsTable(vaccinationsData);
    } catch (error) {
        console.error('Error loading vaccinations:', error);
    }
}

function renderVaccinationsTable(vaccinations) {
    const tbody = document.getElementById('vaccinations-list');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    vaccinations.forEach(vaccination => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vaccination.patientId ? vaccination.patientId.name : 'Unknown'}</td>
            <td>${vaccination.vaccineName}</td>
            <td>${new Date(vaccination.date).toLocaleDateString()}</td>
            <td>${vaccination.dose}</td>
            <td>${vaccination.nextDoseDate ? new Date(vaccination.nextDoseDate).toLocaleDateString() : 'N/A'}</td>
            <td>${vaccination.status}</td>
            <td class="action-buttons">
                <button class="btn-secondary" onclick="editVaccination('${vaccination._id}')">Edit</button>
                <button class="btn-danger" onclick="deleteVaccination('${vaccination._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showVaccinationForm(vaccination = null) {
    currentEditingId = vaccination ? vaccination._id : null;
    
    // Load patients for dropdown
    const patientOptions = patientsData.map(p => 
        `<option value="${p._id}" ${vaccination && vaccination.patientId && vaccination.patientId._id === p._id ? 'selected' : ''}>${p.name}</option>`
    ).join('');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <h3>${vaccination ? 'Edit' : 'Add New'} Vaccination</h3>
            <span class="close">&times;</span>
        </div>

        <div class="form-scroll-container">
            <form id="vaccination-form">
                <!-- SUBMIT BUTTON AT TOP INSIDE FORM -->
                <div class="form-actions-top">
                    <button type="submit" class="btn-primary" id="submit-vaccination-btn">${vaccination ? 'Update Vaccination' : 'Add Vaccination'}</button>
                    <button type="button" class="btn-secondary" onclick="closeModalWindow()">Cancel</button>
                </div>

                <div class="form-group">
                    <label for="vaccination-patient" class="required">Patient</label>
                    <select id="vaccination-patient" required>
                        <option value="">Select Patient</option>
                        ${patientOptions}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="vaccination-name" class="required">Vaccine Name</label>
                    <input type="text" id="vaccination-name" value="${vaccination ? vaccination.vaccineName : ''}" required placeholder="Enter vaccine name">
                </div>
                
                <div class="form-group">
                    <label for="vaccination-date" class="required">Vaccination Date</label>
                    <input type="date" id="vaccination-date" value="${vaccination ? new Date(vaccination.date).toISOString().split('T')[0] : ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="vaccination-dose" class="required">Dose</label>
                    <input type="text" id="vaccination-dose" value="${vaccination ? vaccination.dose : ''}" required placeholder="e.g., First Dose, Booster, etc.">
                </div>
                
                <div class="form-group">
                    <label for="vaccination-next-dose">Next Dose Date (Optional)</label>
                    <input type="date" id="vaccination-next-dose" value="${vaccination && vaccination.nextDoseDate ? new Date(vaccination.nextDoseDate).toISOString().split('T')[0] : ''}">
                </div>
                
                <div class="form-group">
                    <label for="vaccination-status" class="required">Status</label>
                    <select id="vaccination-status" required>
                        <option value="">Select Status</option>
                        <option value="Completed" ${vaccination && vaccination.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Scheduled" ${vaccination && vaccination.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                        <option value="Missed" ${vaccination && vaccination.status === 'Missed' ? 'selected' : ''}>Missed</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="vaccination-notes">Additional Notes</label>
                    <textarea id="vaccination-notes" placeholder="Enter any additional notes or observations">${vaccination ? vaccination.notes : ''}</textarea>
                </div>
            </form>
        </div>
    `;
    
    // Re-attach close event
    const closeBtn = modalBody.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModalWindow);
    }
    
    document.getElementById('vaccination-form').addEventListener('submit', handleVaccinationSubmit);
    modal.style.display = 'block';
    
    // Focus on the first input field
    document.getElementById('vaccination-patient').focus();
}

async function handleVaccinationSubmit(e) {
    e.preventDefault();
    
    const vaccinationData = {
        patientId: document.getElementById('vaccination-patient').value,
        vaccineName: document.getElementById('vaccination-name').value,
        date: document.getElementById('vaccination-date').value,
        dose: document.getElementById('vaccination-dose').value,
        nextDoseDate: document.getElementById('vaccination-next-dose').value || null,
        status: document.getElementById('vaccination-status').value
    };
    
    try {
        const url = currentEditingId ? `/api/vaccinations/update/${currentEditingId}` : '/api/vaccinations/add';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vaccinationData)
        });
        
        if (response.ok) {
            closeModalWindow();
            loadVaccinations();
            alert('Vaccination saved successfully!');
        } else {
            const error = await response.json();
            alert('Error saving vaccination: ' + error);
        }
    } catch (error) {
        console.error('Error saving vaccination:', error);
        alert('Error saving vaccination: ' + error.message);
    }
}

function editVaccination(id) {
    const vaccination = vaccinationsData.find(v => v._id === id);
    if (vaccination) {
        showVaccinationForm(vaccination);
    }
}

async function deleteVaccination(id) {
    if (confirm('Are you sure you want to delete this vaccination record?')) {
        try {
            const response = await fetch(`/api/vaccinations/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadVaccinations();
                alert('Vaccination deleted successfully!');
            } else {
                const error = await response.json();
                alert('Error deleting vaccination: ' + error);
            }
        } catch (error) {
            console.error('Error deleting vaccination:', error);
            alert('Error deleting vaccination: ' + error.message);
        }
    }
}

// Report Functions
async function loadReports() {
    try {
        const response = await fetch('/api/reports');
        reportsData = await response.json();
        renderReportsTable(reportsData);
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

function renderReportsTable(reports) {
    const tbody = document.getElementById('reports-list');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    reports.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${report.title}</td>
            <td>${report.type}</td>
            <td>${new Date(report.date).toLocaleDateString()}</td>
            <td class="action-buttons">
                <button class="btn-secondary" onclick="viewReport('${report._id}')">View</button>
                <button class="btn-danger" onclick="deleteReport('${report._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showReportForm() {
    modalBody.innerHTML = `
        <div class="modal-header">
            <h3>Generate New Report</h3>
            <span class="close">&times;</span>
        </div>
        <form id="report-form">
            <div class="form-group">
                <label for="report-title">Report Title</label>
                <input type="text" id="report-title" required>
            </div>
            <div class="form-group">
                <label for="report-type">Report Type</label>
                <select id="report-type" required>
                    <option value="">Select Type</option>
                    <option value="Patient Summary">Patient Summary</option>
                    <option value="Vaccination Status">Vaccination Status</option>
                    <option value="Appointment Summary">Appointment Summary</option>
                    <option value="Health Trends">Health Trends</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModalWindow()">Cancel</button>
                <button type="submit" class="btn-primary">Generate Report</button>
            </div>
        </form>
    `;
    
    // Re-attach close event
    const closeBtn = modalBody.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModalWindow);
    }
    
    document.getElementById('report-form').addEventListener('submit', handleReportSubmit);
    modal.style.display = 'block';
}

async function handleReportSubmit(e) {
    e.preventDefault();
    
    const reportData = {
        title: document.getElementById('report-title').value,
        type: document.getElementById('report-type').value,
        data: {
            summary: "This is a sample report generated from the system data.",
            generatedAt: new Date().toISOString()
        }
    };
    
    try {
        const response = await fetch('/api/reports/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });
        
        if (response.ok) {
            closeModalWindow();
            loadReports();
            alert('Report generated successfully!');
        } else {
            const error = await response.json();
            alert('Error generating report: ' + error);
        }
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Error generating report: ' + error.message);
    }
}

function viewReport(id) {
    const report = reportsData.find(r => r._id === id);
    if (report) {
        modalBody.innerHTML = `
            <div class="modal-header">
                <h3>${report.title}</h3>
                <span class="close">&times;</span>
            </div>
            <p><strong>Type:</strong> ${report.type}</p>
            <p><strong>Date:</strong> ${new Date(report.date).toLocaleDateString()}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
                <h4>Report Data</h4>
                <pre>${JSON.stringify(report.data, null, 2)}</pre>
            </div>
            <div class="form-actions" style="margin-top: 20px;">
                <button type="button" class="btn-secondary" onclick="closeModalWindow()">Close</button>
            </div>
        `;
        
        // Re-attach close event
        const closeBtn = modalBody.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModalWindow);
        }
        
        modal.style.display = 'block';
    }
}

async function deleteReport(id) {
    if (confirm('Are you sure you want to delete this report?')) {
        try {
            const response = await fetch(`/api/reports/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadReports();
                alert('Report deleted successfully!');
            } else {
                const error = await response.json();
                alert('Error deleting report: ' + error);
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            alert('Error deleting report: ' + error.message);
        }
    }
}

// Utility Functions
function closeModalWindow() {
    modal.style.display = 'none';
    currentEditingId = null;
}

// Make functions globally available for HTML onclick attributes
window.showPatientForm = showPatientForm;
window.editPatient = editPatient;
window.deletePatient = deletePatient;
window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointment;
window.editVaccination = editVaccination;
window.deleteVaccination = deleteVaccination;
window.viewReport = viewReport;
window.deleteReport = deleteReport;
window.closeModalWindow = closeModalWindow;