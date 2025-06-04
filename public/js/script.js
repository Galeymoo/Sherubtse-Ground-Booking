document.addEventListener('DOMContentLoaded', function() {
    const bookNowBtn = document.getElementById('bookNowBtn');
    
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function() {
            window.location.href = '/booking';  // Changed from 'booking.ejs' to '/booking'
        });
    }
});