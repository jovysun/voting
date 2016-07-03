$.ajaxSetup({
  xhrFields: {withCredentials: true},
  error: function(xhr, status, error) {
    $('.alert').removeClass('hidden');
    $('.alert').html("Status: " + status + ", error: " + error);
  }
});

var findTr = function(event) {
  var target = event.srcElement || event.target;
  var $target = $(target);
  var $tr =  $target.parents('tr');
  return $tr;
};

var removeUser = function(event) {
  var $tr = findTr(event);
  var id = $tr.data('id');
  $.ajax({
    url: '/api/admin/' + id,
    type: 'DELETE',
    success: function(data, status, xhr) {
      $('.alert').addClass('hidden');
      $tr.remove();
    }
  })
};
var removeVote = function(event) {
  var $tr = findTr(event);
  var id = $tr.data('id');
  $.ajax({
    url: '/api/vote/' + id,
    type: 'DELETE',
    success: function(data, status, xhr) {
      $('.alert').addClass('hidden');
      $tr.remove();
    }
  })
};

var changeSelect = function(event){
  var value = $(this).val();
  console.log(value);
  $('#item'+value).addClass('on').siblings().removeClass('on');
};

$(document).ready(function(){
  var $element = $('.admin tbody');
  $element.on('click', 'button.removeUser', removeUser);
  $element.on('click', 'button.removeVote', removeVote);
  $('.select-item').on('change', changeSelect);
});