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


  $('.on').on('click', function(e){
    e.preventDefault();
    let val = window.location.pathname.split('/')[2]
    $.ajax({
      url: `/dashboard/${val}/on`,
      type: 'post',
      success: function(){
        location.reload();
      }
    })
  })
  $('.off').on('click', function(e){
    e.preventDefault();
    let val = window.location.pathname.split('/')[2]
    $.ajax({
      url: `/dashboard/${val}/off`,
      type: 'post',
      success: function(){
        location.reload();
      }
    })
  })


});


// var url=$(this).closest('form').attr('action'),
// data=$(this).closest('form').serialize();
// $.ajax({
//   url:url,
//   type:'post',
//   data:data,
//   success:function(){
//     //whatever you wanna do after the form is successfully submitted
//   }
// });
// });
