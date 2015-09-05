/////////////////////////////////////////
/************* FUNCTIONS ***************/
/////////////////////////////////////////

/******  COMMENTS  ******/

function postNewComment () {
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

       if (commentsText.length != 0)
        $.ajax({
          type : 'POST',
          url : '/postComments',
          data : {
            commentsText : commentsText,
            commentId : commentId,
            listId : listId
          },
          // success : appendNewComment,
          success : function (comment) {
            if (comment ==' err')
              return undefined;

            // line break
            $('<br>').appendTo('#panel-footer-' + commentId);
            if (String(comment).indexOf('err') === -1) {
              $('<span/>').text(commentsText + " -- ")
              .append("<a href='/profile/" + comment.commentor.email + "'>" + comment.commentor.email + " </a>")
              .appendTo('#panel-footer-' + commentId);
            } else {
              // sends error message: must login to comment
              $('<br>').prependTo('#panel-footer-' + commentId);
              $('<span/>').text("please signup or signin to comment")
              .attr('style', 'color:red;')
              .prependTo('#panel-footer-' + commentId);
            }

            // clear comments input field
            $('.comment').val('');
          },
          error : function (data) {
            console.log('err data:');
            console.log(data);
          }
        });
    });
    $('.form-control').keyup(function (e) {
        console.log('keyCode: ');
        console.log(e.keyCode);
        if (e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });
}

function getCommentIdFromInput (_commentId) {
  return _commentId.slice(_commentId.indexOf('-')+1, _commentId.length);
}

function appendNewComment (comment) {

  if (comment ==' err')
    return undefined;

  // line break
  $('<br>').appendTo('.panel-footer');
  if (String(comment).indexOf('err') === -1) {
    $('<span/>').text(commentsText + " -- ")
    .append("<a href='/profile/" + comment.commentor.email + "'>" + comment.commentor.email + " </a>")
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
}

function getRatrIdFromListPoster (listPosterVal) {
  console.log('listPosterVal:');
  console.log(listPosterVal);
  return listPosterVal.slice('posted by '.length, listPosterVal.length);
}

function getCommentorIds (commentorId) {
  return String(commentorId);
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
function likeSuccess (response) {
  // alert('success like');
  console.log('\n\n/like success response:');
  console.log(response);
  console.log('\n');

  var listId = String(response.list._id);
  var likes = response.list.likes;

  console.log('listId:');
  console.log(listId);
  console.log('typeof(listId):');
  console.log(typeof(listId));
  console.log('likes:');
  console.log(likes);

  // update front end likes data
  // update number of likes
  $('#likeValue-' + listId).text(likes);
  // update user-liked-this : show/hide
  if (response.status === 'success: like') {
    console.log('\nshow you liked this\n');
    $('#you-liked-this-' + listId).attr('style', 'color:grey;display:inline');
  }
  else if (response.status=== 'success: unlike') {
    console.log('\nhide you liked this\n');
    $('#you-liked-this-' + listId).attr('style', 'display:none');
  }
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