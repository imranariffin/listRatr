
$(function () {

  // $('.')
  $('.share-link').hide();

  // test stackoverflow upvote button
  $('.vote').click(function () {
    if ($(this).hasClass(''))
      $(this).toggleClass('on');
  }); 

  $(document).ready(function() {

    // turns on of the tow arrows' color into orange if relevant
    $('.arrow-down, .arrow-up').each(updateArrowColor);

    /******  COMMENTS  ******/

    // post new comment
    postNewComment();

    // update poster information: get poster username and display it
    var ratrId = getRatrIdFromListPoster($('.list-poster').text());
    console.log('\n\n\n\n\nratrId:');
    console.log(ratrId);
    console.log('\n\n\n\n\n');

    if (ratrId.length != 0)
      $.ajax({
        type : 'GET',
        url : '/ratr/' + ratrId,
        data : {},
        success : function (data) {
          console.log('success upvote');
          console.log('data:');
          console.log(data);
          $('.list-poster').text('posted by ' + data.email);
        },
        error : function (data) {
          console.log('\n\nerr: data:');
          console.log(data);
          console.log('\n');
        },
        dataType : 'json'
      });

    // updateCommentors()
    // update commentors: displayCommentorId() --> displayCommentorEmail()
    var commentorIds = [];

    $('.commentor').each(function (i, e) {
      var text = $(this).text();
      // console.log('INSIDE .commentor:');
      // console.log('text:');
      // console.log(text);

      // clean text from whitespace
      while (text.indexOf(' ') != -1) {
        text = text.replace(' ', '');
      }

      commentorIds.push(text);
    });

    // commentorIds = getCommentorIds($('.commentor').text());


    console.log('commentorIds:');
    console.log(commentorIds);

    commentorIdsQuery = commentorIds.join();

    console.log('commentorIdsQuery:');
    console.log(commentorIdsQuery);

    $.ajax({
      type : 'GET',
      url : '/lystrs?lystrIds=' + commentorIdsQuery,
      success : function (response) {
        // console.log('succes INSIDE updateCommentors():');
        // console.log('response:');
        // console.log(response);
        // console.log(response.email);
        var commentors = response;

        // commentors.forEach(function (e, i, arr) {
        //   var commentorId = String(e._id);
        //   var commentorEmail = e.email;

        //   console.log('commentorId:');
        //   console.log(commentorId);

        //   $('#commentor-' + commentorId).attr('href', '/profile/' + commentorId);
        //   $('#commentor-' + commentorId).text(commentorEmail);
        // });

        $('.commentor').each(function (i, e) {
          var commentor = $(this);
          // console.log('$(this):');
          // console.log($(this));

          commentorId = commentor.text();
          commentors.forEach(function (e) {
            if (e._id == commentorId) {
              commentor.text(e.email);
              commentor.attr('href', '/lystr/' + commentorId);
            }
          });
        });


        // $('#commentor-' + commentorId).attr('href', '/profile/' + String(commentor._id));
        // $('#commentor-' + commentorId).text(commentor.email);
      },
      error : function (response) {
        console.log('err INSIDE updateCommentors()');
        console.log('response:');
        console.log(response);
      },
      dataType : 'json'
    });

  });

  // update upvotes and downvotes status
  for (i in $('.arrow-down, .arrow-up')) {
    var btnVote = $('.arrow-down, .arrow-up')[i];
    // console.log('btnVote:');
    // console.log(btnVote);
  }

  $('.arrow-down, .arrow-up').click(function () {
  
    var buttonId = event.target.id;
    var voteType = event.target.className;
    var itemId = getUpVoteId(buttonId);
    var action, url;

    if ($(this).hasClass('arrow-up')) {

      // // TEST
      // console.log('$(this).hasClass(arrow-up):');
      // console.log($(this).hasClass('arrow-up'));
      // console.log(
      //   $(this).parent().children('.netVote')
      //   .text()
      //   );
      // console.log("$(this).parent().children('.netVote').text()");        

      // if oredy on, cancel upvote
      // if not, do upvote
      if ($(this).hasClass('on')) {

        // TEST
        console.log('user cancels upvote (1 to 0)');

        // cancel  upvote ie decrement netVote
        $(this).parent().children('.netVote')
          .text(
            Number($(this).parent().children('.netVote').text()) - 1
          );
        // toggle color
        $(this).toggleClass('on');
        // update on db: inc by -1
        action = '1To0';
      } else {

        // TEST
        console.log('user upvotes (0 to 1)');

        // do upvote ie increment upvote
        $(this).parent().children('.netVote')
          .text(
            Number($(this).parent().children('.netVote').text()) + 1
          );
        // toggle color
        $(this).toggleClass('on');
        // update on db: inc by 1
        action = '0To1';
      }

      // double upvote if true
      if ($('.arrow-down').hasClass('on')) {

        // TEST
        console.log('Nope, user actually cancels downvote and then does upvotes (-1 to 1)');

        // do upvote ie increment upvote
        $(this).parent().children('.netVote')
          .text(
            Number($(this).parent().children('.netVote').text()) + 1
          );                
        // update on db: inc by 2
        action = '-1To1';
      }

      // turn down-arrow to color grey (sorta de-clickit)
      $('.arrow-down').removeClass('on');

    } else if ($(this).hasClass('arrow-down')) {

      // // TEST
      // console.log('$(this).hasClass(arrow-up):');
      // console.log($(this).hasClass('arrow-up'));  

      // if oredy on, cancel upvote
      // if not, do upvote
      if ($(this).hasClass('on')) {

        // TEST
        console.log('user cancels downvotes (-1 to 0)');

        // cancel downvote ie increment netVote
        $(this).parent().children('.netVote')
          .text(
            Number($(this).parent().children('.netVote').text()) + 1
          );
        // toggle color
        $(this).toggleClass('on');
        // update on db: inc by 1
        action = '-1To0';        
      } else {

        // TEST
        console.log('user downvotes (0 to -1)');

        // do downvote ie decrement upvote
        $(this).parent().children('.netVote')
          .text(
            Number($(this).parent().children('.netVote').text()) - 1
          );      
        // toggle color   
        $(this).toggleClass('on');
        // update on db: inc by -1
        action = '0To-1';
      }

      // double downvote if true
      if ($('.arrow-up').hasClass('on')) {

        // TEST
        console.log('Nope, user actually cancels upvote and then does downvote (1 to -1)');

        // do upvote ie increment upvote
        $(this).parent().children('.netVote')
          .text(
            Number($(this).parent().children('.netVote').text()) - 1
          );
        // update on db: inc by -2
        action = '1To-1';
      }       

      // turn up-arrow to color grey (sorta de-clickit)
      $('.arrow-up').removeClass('on');       
    }

    // if (voteType === 'arrow-up')
    // url

    $.ajax({
      type : 'POST',
      url : '/upVote',
      data : {
        itemId : itemId,
        action : action
      },
      success : function (data) {
        console.log('success upvote');
        console.log('data:');
        console.log(data);
      },
      error : function (data) {
        console.log('\n\nerr: data:');
        console.log(data);
        console.log('\n');
      },
      dataType : 'json'
    });
  }); 

  /********  /LIKES   *********/

  // use api to whether show 'you liked this list' or not
  $('.likeValue').each(function () {

    var likeValue = $(this);

    // get likeId from likeValue-listID
    var likeValueId = likeValue.attr('id');
    var listId = likeValueId.slice(likeValueId.indexOf('-')+1, likeValueId.length);

    // TEST
    console.log('INSIDE likeValue.each()');
    console.log('likeValueId:');
    console.log(likeValueId);
    console.log('listId:');
    console.log(listId);

    // use api to determine
    $.ajax({
      type : 'GET',
      url : '/do-you-like-this/' + listId,
      // data : likeFormData,
      success : function (response) {

        console.log('response:');
        console.log(response);

        if (response.answer === true) {
          // show 'you liked this'
          var likes = $('#' + likeValueId).text();
          // $('#' + likeValueId).text(likes + ' you liked this list');
          // $("<span style='color:grey;'> you liked this list </span>").appendTo('#' + likeValueId);
          $('#you-liked-this-' + listId).attr('style', 'color:grey;display:inline;');

        }
        // else
          // do nothing
      },
      error : function (data) {
        console.log('\n\nerr: data:');
        console.log(data);
        console.log('\n');
      },
      dataType : 'json'
    });
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
      error : function (response) {
        console.log('\n\nerr: response:');
        console.log(response);
        console.log('\n');

      },
      dataType : 'json'
    });

  });

  // user shares a list: returns a short permalink
  $('.btn-share').click(event, function (event) {

    var shareId = event.target.id;
    var listId = getlistIdFromShareId(shareId);

    // TEST
    console.log('shareId:');
    console.log(shareId);
    console.log('listId:');
    console.log(listId);

    $.ajax({
      type : "GET",
      url : '/share',
      data : {listId : listId},
      success : shareSuccess,
      error : function (data) {
        console.log('\n\nerr: data:');
        console.log(data);
        console.log('\n');
      },
      dataType : 'json'
    });
  });

  // user adds a comment to one of list items
  $('.add-comment').click(event, function (event) {

    var buttonId = event.target.id;
    // var commentId = getCommentIdFromBtnId(buttonId);

    // show comment
    console.log('add-comment clicked');
    console.log('comment-btn id:' + buttonId);

    if ($('#comment-box' + buttonId))
      console.log($('#comment-box' + buttonId));
    else
      console.log('does not exist lulz');

    // $.ajax()
  });

  // $('arrow-up').click()

});

////////////////////////////////////////////////
/**************** FUNCTIONS *******************/
// available at ../lists-scripts-functions.js //
////////////////////////////////////////////////

function updateArrowColor () {

  var arrow = $(this);
  var isUpVoted = arrow.siblings('.up').val();
  var isDownVoted = arrow.siblings('.down').val();

  // if arrow is an up arrow and upvoted,
   // put the orange color on arrow-up
  if (isUpVoted === 'true' && arrow.hasClass('arrow-up'))
    arrow.addClass('on');
  // if arrow is an up arrow and upvoted, 
  // put the orange color on arrow-down instead
  if (isDownVoted === 'true' && arrow.hasClass('arrow-down'))
    arrow.addClass('on');

}

function upVoteOrDownVotePOST () {
  
  var buttonId = event.target.id;
  var voteType = event.target.className;
  var itemId = getUpVoteId(buttonId);
  var action, url;

  if ($(this).hasClass('arrow-up')) {

    // // TEST
    // console.log('$(this).hasClass(arrow-up):');
    // console.log($(this).hasClass('arrow-up'));
    // console.log(
    //   $(this).parent().children('.netVote')
    //   .text()
    //   );
    // console.log("$(this).parent().children('.netVote').text()");        

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
      // update on db: inc by -1
      action = '1To0';
    } else {
      // do upvote ie increment upvote
      $(this).parent().children('.netVote')
        .text(
          Number($(this).parent().children('.netVote').text()) + 1
        );
      // toggle color
      $(this).toggleClass('on');
      // update on db: inc by 1
      action = '0To1';
    }

    // double upvote if true
    if ($('.arrow-down').hasClass('on')) {
      // do upvote ie increment upvote
      $(this).parent().children('.netVote')
        .text(
          Number($(this).parent().children('.netVote').text()) + 1
        );                
      // update on db: inc by 2
      action = '-1To1';
    }

    // turn down-arrow to color grey (sorta de-clickit)
    $('.arrow-down').removeClass('on');

  } else if ($(this).hasClass('arrow-down')) {

    // // TEST
    // console.log('$(this).hasClass(arrow-up):');
    // console.log($(this).hasClass('arrow-up'));  

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
      // update on db: inc by 1
      action = '-1To0';        
    } else {
      // do downvote ie decrement upvote
      $(this).parent().children('.netVote')
        .text(
          Number($(this).parent().children('.netVote').text()) - 1
        );      
      // toggle color   
      $(this).toggleClass('on');
      // update on db: inc by -1
      action = '0To-1';
    }

    // double downvote if true
    if ($('.arrow-up').hasClass('on')) {
      // do upvote ie increment upvote
      $(this).parent().children('.netVote')
        .text(
          Number($(this).parent().children('.netVote').text()) - 1
        );
      // update on db: inc by -2
      action = '1To-1';
    }       

    // turn up-arrow to color grey (sorta de-clickit)
    $('.arrow-up').removeClass('on');       
  }

  // if (voteType === 'arrow-up')
  // url

  $.ajax({
    type : 'POST',
    url : '/upVote',
    data : {
      itemId : itemId,
      action : action
    },
    success : function (data) {
      console.log('success upvote');
      console.log('data:');
      console.log(data);
    },
    error : function (data) {
      console.log('\n\nerr: data:');
      console.log(data);
      console.log('\n');
    },
    dataType : 'json'
  });
}