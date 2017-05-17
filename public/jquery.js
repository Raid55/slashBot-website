//Doc ready and dropdown
$(document).ready(function() {
  $('.dropdown-toggle').dropdown()

  //server selector
  $('.selectForm').change(function(){
    let val = $( ".selectForm" ).val();
    $( location ).attr("href", `/dashboard/${val}`)
  });

})
