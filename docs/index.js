document.addEventListener('DOMContentLoaded', function() {
    // User credentials (in a real app, this would be server-side)
    const validUsers = [
        { username: "Admin1", password: "@Azmat786", role: "admin" },
        { username: "manager", password: "manager786", role: "manager" }
    ];

    // DOM Elements
    const loginPage = document.getElementById('login-page');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const loginError = document.getElementById('login-error');

    // Check if user is already logged in
    if (localStorage.getItem('loggedIn') === 'true') {
        showApp();
    }

    // Login Form Submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Validate credentials
        const user = validUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Successful login
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            showApp();
        } else {
            // Failed login
            loginError.textContent = "Invalid username or password";
        }
    });
    // Example of what a real implementation might look like
async function authenticateUser(username, password) {
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('authToken', data.token);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}
// Automatic session timeout after 30 minutes of inactivity
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(endSession, 30 * 60 * 1000); // 30 minutes
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);

// Initialize timer when app starts
function initializeApp() {
    resetInactivityTimer();
    // ... rest of your initialization
}

    // Logout Functionality
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('currentUser');
        hideApp();
        loginForm.reset();
        loginError.textContent = "";
    });

    // Helper functions
    function showApp() {
        loginPage.style.display = "none";
        appContainer.style.display = "block";
        
        // Load user-specific data if needed
        const user = JSON.parse(localStorage.getItem('currentUser'));
        console.log(`Welcome, ${user.username} (${user.role})`);
        
        // Initialize the rest of your app
        initializeApp();
    }

    function hideApp() {
        loginPage.style.display = "flex";
        appContainer.style.display = "none";
    }

    // Your existing app initialization
    function initializeApp() {
        // Move all your existing initialization code here
        // (the code that was previously in DOMContentLoaded)
        
        // Tab functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Rest of your existing initialization code...
        // (employee management, attendance tracking, etc.)
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Initialize employees array from localStorage or empty array
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Initialize attendance records array from localStorage or empty array
    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // Form to add new employee
    const employeeForm = document.getElementById('employee-form');
    employeeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('employee-name').value;
        const id = document.getElementById('employee-id').value;
        
        // Check if employee with this ID already exists
        if (employees.some(emp => emp.id === id)) {
            alert('Employee with this ID already exists!');
            return;
        }
        
        // Add new employee
        employees.push({ id, name });
        localStorage.setItem('employees', JSON.stringify(employees));
        
        // Reset form
        employeeForm.reset();
        
        // Refresh attendance table
        loadEmployeesForAttendance();
        
        alert('Employee added successfully!');
    });
    
    // Set default date to today
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    document.getElementById('attendance-date').value = dateString;
    document.getElementById('summary-date').value = dateString;
    
    // Load employees for attendance marking
    function loadEmployeesForAttendance() {
        const attendanceList = document.getElementById('attendance-list');
        attendanceList.innerHTML = '';
        
        employees.forEach(employee => {
            const row = document.createElement('tr');
            
            // Check if attendance already marked for today
            const todayRecord = attendanceRecords.find(record => 
                record.employeeId === employee.id && record.date === dateString
            );
            
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td><input type="time" class="report-time" value="${todayRecord ? todayRecord.reportTime : ''}"></td>
                <td><input type="time" class="leave-time" value="${todayRecord ? todayRecord.leaveTime : ''}"></td>
                <td>
                    <select class="status">
                        <option value="present" ${todayRecord && todayRecord.status === 'present' ? 'selected' : ''}>Present</option>
                        <option value="absent" ${todayRecord && todayRecord.status === 'absent' ? 'selected' : ''}>Absent</option>
                    </select>
                </td>
                <td><button class="save-btn" data-id="${employee.id}">Save</button></td>
            `;
            
            attendanceList.appendChild(row);
        });
        
        // Add event listeners to save buttons
        document.querySelectorAll('.save-btn').forEach(button => {
            button.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-id');
                const row = this.closest('tr');
                const reportTime = row.querySelector('.report-time').value;
                const leaveTime = row.querySelector('.leave-time').value;
                const status = row.querySelector('.status').value;
                const date = document.getElementById('attendance-date').value;
                
                // Find if record already exists
                const existingIndex = attendanceRecords.findIndex(record => 
                    record.employeeId === employeeId && record.date === date
                );
                
                const record = {
                    employeeId,
                    employeeName: employees.find(emp => emp.id === employeeId).name,
                    date,
                    reportTime,
                    leaveTime,
                    status
                };
                
                if (existingIndex >= 0) {
                    // Update existing record
                    attendanceRecords[existingIndex] = record;
                } else {
                    // Add new record
                    attendanceRecords.push(record);
                }
                
                localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
                alert('Attendance saved successfully!');
                
                // Refresh summary tab if active
                if (document.getElementById('attendance').classList.contains('active')) {
                    loadAttendanceSummary();
                }
            });
        });
    }
    
    // Load attendance summary
    function loadAttendanceSummary(filterDate = null) {
        const summaryList = document.getElementById('summary-list');
        summaryList.innerHTML = '';
        
        let recordsToShow = attendanceRecords;
        
        if (filterDate) {
            recordsToShow = attendanceRecords.filter(record => record.date === filterDate);
        } else {
            // Default to today's records
            recordsToShow = attendanceRecords.filter(record => record.date === dateString);
        }
        
        if (recordsToShow.length === 0) {
            summaryList.innerHTML = '<tr><td colspan="6" style="text-align: center;">No attendance records found for selected date</td></tr>';
            return;
        }
        
        recordsToShow.forEach(record => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${record.employeeId}</td>
                <td>${record.employeeName}</td>
                <td>${record.reportTime || 'N/A'}</td>
                <td>${record.leaveTime || 'N/A'}</td>
                <td class="status-${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
                <td>${record.date}</td>
            `;
            
            summaryList.appendChild(row);
        });
    }
    
    // Filter button for attendance summary
    document.getElementById('filter-button').addEventListener('click', function() {
        const selectedDate = document.getElementById('summary-date').value;
        loadAttendanceSummary(selectedDate);
    });
    
    // Reset button for attendance summary
    document.getElementById('reset-button').addEventListener('click', function() {
        document.getElementById('summary-date').value = dateString;
        loadAttendanceSummary();
    });
    
    // Date change in attendance tab
    document.getElementById('attendance-date').addEventListener('change', function() {
        loadEmployeesForAttendance();
    });
    
    // Initial load
    loadEmployeesForAttendance();
    loadAttendanceSummary();
});