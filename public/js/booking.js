document.addEventListener('DOMContentLoaded', function () {
    const bookingForm = document.getElementById('bookingForm');
    const cancelBtn = document.getElementById('cancelBooking');
    const emailInput = document.getElementById('email');
    const doneBtn = document.getElementById('doneBtn');

    // Course and Year options
    const courses = [
        'BA in Economics', 'BA in English', 'BA in History', 'BA in Media Studies',
        'BA in Political Science & Sociology', 'BA in Population & Development Studies',
        'BSc in Chemistry', 'BSc in Data Science', 'BSc in Environmental Science',
        'BSc in Geography', 'BSc in Life Sciences', 'BSc in Mathematics',
        'BSc in Physics', 'BSc in Statistics', 'Common Module',
        'Data Science & Data Analytics', 'Digital Communications & Project Management',
        'Economic & Political Science', 'New Programme'
    ];

    const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];

    // Populate dropdowns
    const courseSelect = document.getElementById('course');
    const yearSelect = document.getElementById('year');

    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
    });

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Set minimum date to today
    const dateInput = document.getElementById('date');
    dateInput.min = new Date().toISOString().split('T')[0];

    // Email validation
    const emailPattern = /^[0-9]{8}\.sherubtse@rub\.edu\.bt$/;
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'red';
    errorDiv.style.display = 'none';
    emailInput.parentNode.appendChild(errorDiv);

    emailInput.addEventListener('input', function () {
        if (!emailPattern.test(this.value)) {
            errorDiv.textContent = 'Please enter a valid college email (e.g., 07230044.sherubtse@rub.edu.bt)';
            errorDiv.style.display = 'block';
        } else {
            errorDiv.style.display = 'none';
        }
    });

    // Form submission
    bookingForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate email
        if (!emailPattern.test(emailInput.value)) {
            errorDiv.style.display = 'block';
            emailInput.focus();
            return;
        }

        try {
            const formData = new FormData(bookingForm);
            const bookingData = {};
            formData.forEach((value, key) => {
                bookingData[key] = value;
            });

            const response = await fetch('/book', {  // Changed from /api/bookings to /book
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show success modal
                document.getElementById('modalDate').textContent = bookingData.date;
                document.getElementById('modalTime').textContent = bookingData.time;
                document.getElementById('successModal').style.display = 'flex';
                
                // Clear form
                bookingForm.reset();
                
                // Reset dropdowns
                courseSelect.selectedIndex = 0;
                yearSelect.selectedIndex = 0;
            } else {
                errorDiv.textContent = result.message || 'Booking failed. Please try again.';
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            console.error('Booking error:', err);
            errorDiv.textContent = 'Something went wrong. Please try again.';
            errorDiv.style.display = 'block';
        }
    });

    // Cancel booking
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel this booking?')) {
                window.location.href = '/home';
            }
        });
    }

    // Done button in success modal
    if (doneBtn) {
        doneBtn.addEventListener('click', function () {
            window.location.href = '/home';
        });
    }
});