//Doc ready and dropdown
$(document).ready(function() {
  $('.dropdown-toggle').dropdown()

  //server selector
  $('.selectForm').change(function(){
    let val = $( ".selectForm" ).val();
    if(val === "null"){
      return;
    }else{
      $( location ).attr("href", `/dashboard/${val}`)
    }
  });

})
