$(document).ready(function() {
  $('#uploadForm').on('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    $('.loading').show();

    $.ajax({
      url: '/upload', // Replace with your server endpoint
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        $('.loading').hide();
        $('.success').show().delay(2000).fadeOut();
        console.log('Response:', response);
      },
      error: function(err) {
        $('.loading').hide();
        alert('Error: ' + err.responseText);
      }
    });
  });
});
