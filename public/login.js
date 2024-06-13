$(document).ready(function() {
  $('#loginForm').on('submit', function(event) {
    event.preventDefault();
    const username = $('#username').val();
    const password = $('#password').val();

    // Simulate simple authentication logic (replace with actual backend authentication)
    if (username === 'admin' && password === 'admin') {
      window.location.href = '/dashboard.html'; // Redirect to dashboard upon successful login
    } else {
      $('#loginError').text('Invalid username or password. Please try again.').show();
    }
  });
});
