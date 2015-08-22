
$(function () {
  // test stackoverflow upvote button
  $('.vote').click(function () {
    if ($(this).hasClass(''))
      $(this).toggleClass('on');
  }); 

  $('.arrow-down, .arrow-up').click(function () {
      
      if ($(this).hasClass('arrow-up')) {

        // TEST
        console.log('$(this).hasClass(arrow-up):');
        console.log($(this).hasClass('arrow-up'));
        console.log(
          $(this).parent().children('.netVote')
          .text()
          );
        console.log("$(this).parent().children('.netVote').text()");        

        // if oredy on, cancel upvote
        // if not, do upvote
        if ($(this).hasClass('on')) {
          // cancel  upvote ie decrement netVote
          $(this).parent().children('.netVote')
            .text(
              Number($(this).parent().children('.netVote').text()) - 1
            );
          // toggle color
          $(this).toggleClass('on');
        } else {
          // do upvote ie increment upvote
          $(this).parent().children('.netVote')
            .text(
              Number($(this).parent().children('.netVote').text()) + 1
            );      
          // toggle color
          $(this).toggleClass('on');
        }

        // double upvote if true
        if ($('.arrow-down').hasClass('on')) {
          // do upvote ie increment upvote
          $(this).parent().children('.netVote')
            .text(
              Number($(this).parent().children('.netVote').text()) + 1
            );                
        }

        // turn down-arrow to color grey (sorta de-clickit)
        $('.arrow-down').removeClass('on');

      } else if ($(this).hasClass('arrow-down')) {

        // TEST
        console.log('$(this).hasClass(arrow-up):');
        console.log($(this).hasClass('arrow-up'));  

        // if oredy on, cancel upvote
        // if not, do upvote
        if ($(this).hasClass('on')) {
          // cancel downvote ie increment netVote
          $(this).parent().children('.netVote')
            .text(
              Number($(this).parent().children('.netVote').text()) + 1
            );
          // toggle color
          $(this).toggleClass('on');
        } else {
          // do downvote ie decrement upvote
          $(this).parent().children('.netVote')
            .text(
              Number($(this).parent().children('.netVote').text()) - 1
            );      
          // toggle color   
          $(this).toggleClass('on');
        }

        // double downvote if true
        if ($('.arrow-up').hasClass('on')) {
          // do upvote ie increment upvote
          $(this).parent().children('.netVote')
            .text(
              Number($(this).parent().children('.netVote').text()) - 1
            );                
        }       

        // turn up-arrow to color grey (sorta de-clickit)
        $('.arrow-up').removeClass('on');       
      }
      
  }); 

  // user likes a list
  $(".glyphicon-thumbs-up").click(event, function(event) {
    // console.log('\n\nevent.target.id:');
    // console.log(event.target.id);
    // console.log('\n');

    var likeId = event.target.id;
    var listId = getlistIdFromLikeId(likeId);

    // console.log('\n\nlistId:');
    // console.log(getlistIdFromLikeId(likeId));
    // console.log('\n');

    var likeFormData = {
      listId : listId
    };

    $.ajax({
      type : 'POST',
      url : '/like',
      data : likeFormData,
      success : likeSuccess,
      error : function (data) {
        console.log('\n\nerr: data:');
        console.log(data);
        console.log('\n');
      },
      dataType : 'json'
    });

  });

});

// likeId is a string = event.target.id
// returns a string id. 
function getlistIdFromLikeId (likeId) {
  return likeId.slice(likeId.indexOf('-') + 1, likeId.length);
}

// callback functions

// ajax /like
function likeSuccess (data) {
  // alert('success like');
  console.log('\n\nsuccess data:');
  console.log(data);
  console.log('\n');

  // update front end likes data
  $('#likeValue-' + data.list._id).text(data.list.likes);
}