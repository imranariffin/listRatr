
$(function () {

  // $('.')

  // test stackoverflow upvote button
  $('.vote').click(function () {
    if ($(this).hasClass(''))
      $(this).toggleClass('on');
  }); 

  $(document).ready(function() {
    $('.arrow-down, .arrow-up').each(function () {
      console.log('in arrow-up.each');      
      console.log($(this).attr('class'));
      console.log("$(this).siblings('.down')");
      console.log($(this).siblings('.down'));
      console.log($(this).siblings('.down').val());
      if ($(this).siblings('.up').val() === 'true' && $(this).hasClass('arrow-up'))
        $(this).addClass('on');
      if ($(this).siblings('.down').val() === 'true' && $(this).hasClass('arrow-down'))
        $(this).addClass('on');
      console.log('$(this):');
      console.log($(this));
    });

    $('.form-control').bind("enterKey", function (e) {
       // update comments view field, 
       // then update comments to db

       var commentsText = e.target.value;
       var commentId = e.target.id;
       var commentId = getCommentIdFromInput(commentId);

       var listId = $('#listId').val();

       // TEST
       console.log('commentId:');
       console.log(commentId);
       console.log('listId:');
       console.log(listId);

       $.ajax({
        type : 'POST',
        url : '/postComments',
        data : {
          commentsText : commentsText,
          commentId : commentId,
          listId : listId
        },
        success : function (data) {
          // 

          if (data ==' err')
            return undefined;

          console.log('success posting comments');
          console.log('success data:');
          console.log(data);
          console.log('typeof(data):');
          console.log(typeof(data));
          // console.log("data.indexOf('err'):");
          // console.log(data.indexOf('err'));

          // line break
          $('<br>').appendTo('.panel-footer');
          if (String(data).indexOf('err') === -1) {
            $('<span/>').text(commentsText + " -- ")
            .append("<a href='/profile/" + data.commentor.email + "'>" + data.commentor.email + " </a>")
            .appendTo('.panel-footer');
          } else {
            // sends error message: must login to comment
            $('<br>').prependTo('.panel-footer');
            $('<span/>').text("please signup or signin to comment")
            .attr('style', 'color:red;')
            .prependTo('.panel-footer');
          }

          // clear comments input field
          $('.comment').val('');
        },
        error : function (data) {
          console.log('err data:');
          console.log(data);
        }

       })
    });
    $('.form-control').keyup(function (e) {
        console.log('keyCode: ');
        console.log(e.keyCode);
        if (e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });

    // update poster information: get poster username and display it
    var ratrId = getRatrIdFromListPoster($('.list-poster').text());
    console.log('\n\n\n\n\nratrId:');
    console.log(ratrId);
    console.log('\n\n\n\n\n');
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

  });

  $('.share-link').hide();

  // update upvotes and downvotes status
  for (i in $('.arrow-down, .arrow-up')) {
    var btnVote = $('.arrow-down, .arrow-up')[i];
    console.log('btnVote:');
    console.log(btnVote);
  }

  $('.arrow-down, .arrow-up').click(function () {
      
    var buttonId = event.target.id;
    var voteType = event.target.className;
    var itemId = getUpVoteId(buttonId);
    var action, url;

    if ($(this).hasClass('arrow-up')) {

      // url = '/upVote'

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

function getCommentIdFromInput (_commentId) {
  return _commentId.slice(_commentId.indexOf('-')+1, _commentId.length);
}

function getRatrIdFromListPoster (listPosterVal) {
  console.log('listPosterVal:');
  console.log(listPosterVal);
  return listPosterVal.slice('posted by '.length, listPosterVal.length);
}

// likeId is a string = event.target.id
// returns a string id. 
function getlistIdFromLikeId (likeId) {
  return likeId.slice(likeId.indexOf('-') + 1, likeId.length);
}

// likeId is a string = event.target.id
// returns a string id. 
function getlistIdFromShareId (shareId) {
  return shareId.slice(shareId.indexOf('btn-share-') + 'btn-share-'.length, shareId.length);
}

function getUpVoteId (buttonId) {
  return buttonId.slice(buttonId.indexOf('-')+1, buttonId.length);
}
/* CALLBACK FUNCTIONS */

// ajax /like
function likeSuccess (data) {
  // alert('success like');
  console.log('\n\nsuccess data:');
  console.log(data);
  console.log('\n');

  // update front end likes data
  $('#likeValue-' + data.list._id).text(data.list.likes);
}

function shareSuccess (data) {
   // alert('success like');
  console.log('\n\nsuccess data:');
  console.log(data);
  console.log('\n');

  // update front end likes data
  $('#share-link-' + data._id).show()
  .text("http://listratr.xyz/l/" + hyphenateTitle(data.title));
}

function hyphenateTitle (formalizedTitle) {
  return formalizedTitle.split(' ')
  .map(function (e, i, arr) {
    e = e.toLowerCase();
    if (i !=0)
      return '-'+e;
    else
      return e;
  }).join('');
}
