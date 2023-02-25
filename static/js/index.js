(function () {
  "use strict";
  function updateComments(imageId, page) {
    //Clear the comment section
    document.querySelector("#submit-image").classList.add("disabled");
    document.querySelector("#delete-img").classList.add("disabled");
    document.querySelector(
      "#comment-section"
    ).innerHTML = `<div class="loading" id="loading-comments"></div>`;
    //Get comments
    apiService.getComments(imageId, page).then(function (comments) {
      //If total number of comments is 0, display "There are no comments yet..."
      if (comments.total === 0) {
        let commentElmnt = document.createElement("div");
        commentElmnt.className = "no-comments-text no-comments-text-sm";
        commentElmnt.innerHTML = "There are no comments yet...";
        document.querySelector("#loading-comments").classList.add("hidden");
        document.querySelector("#comment-section").prepend(commentElmnt);
        document.querySelector("#pages").classList.add("hidden");
        document.querySelector("#submit-image").classList.remove("disabled");
        document.querySelector("#delete-img").classList.remove("disabled");
      } else {
        //If there are comments, display the number of pages
        document.querySelector("#pages").classList.remove("hidden");
        document.querySelector("#page-number").innerHTML = (
          page + 1
        ).toString();
        //If it's the first page, disable the previous page button
        if (page === 0) {
          document.querySelector("#prev-page").classList.add("disabled");
        } else {
          document.querySelector("#prev-page").classList.remove("disabled");
        }
        //If it's the last page, disable the next page button
        if (comments.total - (page + 1) * 10 <= 0) {
          document.querySelector("#next-page").classList.add("disabled");
        } else {
          document.querySelector("#next-page").classList.remove("disabled");
        }
        //If there are no comments on the current page, go to previous page (used for delete)
        if (comments.comments.length === 0 && page > 0) {
          updateComments(imageId, page - 1);
        }
        document.querySelector("#loading-comments").classList.add("hidden");

        //Display comments
        comments.comments.forEach(function (comment) {
          let commentElmnt = document.createElement("div");
          commentElmnt.className = "comment";
          commentElmnt.id = "comment" + comment.id;
          commentElmnt.innerHTML = `
        <div class="row">
          <div class="comment-author">${comment.User.username}</div>
          <img class="delete-comment-btn" src="media/trash-solid.svg" />
        </div>
        <div class="row comment-content">${comment.content}</div>
        <div class="row">
          <div class="comment-date">${new Date(
            comment.createdAt
          ).toDateString()}</div>
        </div>
      `;
          //Delete Comment
          commentElmnt
            .querySelector(".delete-comment-btn")
            .addEventListener("click", function () {
              apiService.deleteComment(comment.id).then(function () {
                updateComments(imageId, page);
              });
            });
          document.querySelector("#comment-section").append(commentElmnt);
          document
            .querySelector("#submit-comment")
            .classList.remove("disabled");
        });
        document.querySelector("#submit-image").classList.remove("disabled");
        document.querySelector("#delete-img").classList.remove("disabled");
      }
    });
  }
  function updateImage(page) {
    //Clear the image content container
    document.querySelector(
      ".image-content-container"
    ).innerHTML = `<div class="loading" id = "loading-image"></div>`;
    //Clear the image actions bar
    document.querySelector(".image-actions").innerHTML = "";
    //Clear Title and Author
    document.querySelector(".image-title").innerHTML = "";
    document.querySelector(".image-author").innerHTML = "";
    //document.querySelector(".loading").classList.remove("hidden");
    //Get image
    apiService.getImage(page).then(function (images) {
      if (images.total === 0) {
        //If there are no images, display no image placeholder"
        let imageTxtElmnt = document.createElement("div");
        imageTxtElmnt.className = "no-img-text no-img-text-sm";
        imageTxtElmnt.innerHTML = "No images found... Upload some now!";
        let imageElmnt = new Image();
        imageElmnt.className = "no-img-icon";
        imageElmnt.src = "media/no-image-gallery.png";
        document
          .querySelector(".image-content-container")
          .prepend(imageTxtElmnt);
        document.querySelector(".loading").classList.add("hidden");
        document.querySelector(".image-content-container").prepend(imageElmnt);
        document.querySelector("#comments").classList.add("hidden");
      } else {
        let image = images.images[0];
        if (images.images.length === 0 && page > 0) {
          updateImage(page - 1);
          return;
        }
        //Display image
        document.querySelector("#comments").classList.remove("hidden");
        document.querySelector(".image-title").innerHTML = image.title;
        document.querySelector(".image-author").innerHTML =
          "Uploaded by: " + image.User.username;
        let imageElmnt = new Image();
        imageElmnt.className = "image-content";
        imageElmnt.id = "image" + image.id;
        imageElmnt.src = "/api/images/" + image.id + "/picture";
        let imageActionsElmnt = document.createElement("div");
        imageActionsElmnt.className = "row";
        imageActionsElmnt.innerHTML = `          
      <div class="col-4">
        <img
          class="action-btn action-btn-teal action-btn-sm"
          id="prev-img"
          src="media/arrow-left-solid.svg"
        />
      </div>
      <div class="col-4">
        <img
          class="action-btn action-btn-sm"
          id="delete-img"
          src="media/trash-solid.svg"
        />
      </div>
      <div class="col-4">
        <img
          class="action-btn action-btn-teal action-btn-sm"
          id="next-img"
          src="media/arrow-right-solid.svg"
        />
      </div>
      `;
        //Delete Image
        imageActionsElmnt
          .querySelector("#delete-img")
          .addEventListener("click", function () {
            if (
              imageActionsElmnt
                .querySelector("#delete-img")
                .classList.contains("disabled")
            ) {
              return;
            }
              apiService.deleteImage(image.id).then(function () {
                updateImage(page);
              });
          });

        //Previous Image
        imageActionsElmnt
          .querySelector("#prev-img")
          .addEventListener("click", function () {
            if (
              imageActionsElmnt
                .querySelector("#prev-img")
                .classList.contains("disabled")
            ) {
              return;
            }
            updateImage(page - 1);
          });

        //Next Image
        imageActionsElmnt
          .querySelector("#next-img")
          .addEventListener("click", function () {
            if (
              imageActionsElmnt
                .querySelector("#next-img")
                .classList.contains("disabled")
            ) {
              return;
            }
            updateImage(page + 1);
          });

        document.querySelector(".image-actions").append(imageActionsElmnt);
        document.querySelector(".loading").classList.add("hidden");
        document.querySelector(".image-content-container").prepend(imageElmnt);
        document.querySelector("#submit-image").classList.remove("disabled");

        updateComments(image.id, 0);

        if (page === 0) {
          imageActionsElmnt
            .querySelector("#prev-img")
            .classList.add("disabled");
        } else {
          imageActionsElmnt
            .querySelector("#prev-img")
            .classList.remove("disabled");
        }
        if (page === images.total - 1) {
          imageActionsElmnt
            .querySelector("#next-img")
            .classList.add("disabled");
        } else {
          imageActionsElmnt
            .querySelector("#next-img")
            .classList.remove("disabled");
        }
      }
    });
  }

  window.addEventListener("load", function () {
    //Click the create post button to toggle visibility of upload form
    document
      .querySelector("#create-post")
      .addEventListener("click", function () {
        if (
          !document
            .querySelector("#upload-image-form")
            .classList.contains("drop")
        ) {
          document
            .querySelector("#create-post")
            .classList.remove("btn-transparent");
          document.querySelector("#upload-image-form").classList.add("drop");
        } else {
          document.querySelector("#upload-image-form").classList.remove("drop");
          document
            .querySelector("#create-post")
            .classList.add("btn-transparent");
        }
      });
    //Upload Image
    document
      .querySelector("#upload-image-form")
      .addEventListener("submit", function (e) {
        if (
          e.target.querySelector("#submit-image").classList.contains("disabled")
        ) {
          return;
        }
        e.preventDefault();

        e.target.querySelector("#submit-image").classList.add("disabled");

        const fileField = document.querySelector('input[type="file"]');
        const author = document.getElementById("image-author").value;
        const title = document.getElementById("image-title").value;
        const picture = fileField.files[0];
        document.getElementById("upload-image-form").reset();
        apiService.createUser(author).then(() => {
          apiService.addImage(title, author, picture).then((res) => {
            if (res.error) {
              alert(res.error);
              return;
            }
            updateImage(0);
          });
        });
      });
    //Create Comment
    document
      .querySelector("#create-comment-form")
      .addEventListener("submit", function (e) {
        if (
          e.target
            .querySelector("#submit-comment")
            .classList.contains("disabled")
        ) {
          return;
        }
        e.preventDefault();

        e.target.querySelector("#submit-comment").classList.add("disabled");

        const author = document.getElementById("comment-author").value;
        const content = document.getElementById("comment-content").value;
        let imageId = document.querySelector(".image-content-container")
          .firstChild.id;
        imageId = parseInt(imageId.substring(5, length.imageId));
        document.getElementById("create-comment-form").reset();
        apiService.createUser(author).then(() => {
          apiService.addComment(imageId, author, content).then(() => {
            updateComments(imageId, 0);
          });
        });
      });
    //Previous Page Comments
    document.querySelector("#prev-page").addEventListener("click", function () {
      if (document.querySelector("#prev-page").classList.contains("disabled")) {
        return;
      }

      document.querySelector("#prev-page").classList.add("disabled");
      document.querySelector("#next-page").classList.add("disabled");

      let imageId = document.querySelector(".image-content-container")
        .firstChild.id;
      imageId = parseInt(imageId.substring(5, length.imageId));
      let page = document.querySelector("#page-number").innerHTML;
      page = parseInt(page);
      page--;
      document.querySelector("#page-number").innerHTML = page;
      updateComments(imageId, page - 1);
    });
    //Next Page Comments
    document.querySelector("#next-page").addEventListener("click", function () {
      if (document.querySelector("#next-page").classList.contains("disabled")) {
        return;
      }

      document.querySelector("#prev-page").classList.add("disabled");
      document.querySelector("#next-page").classList.add("disabled");

      let imageId = document.querySelector(".image-content-container")
        .firstChild.id;
      imageId = parseInt(imageId.substring(5, length.imageId));
      let page = document.querySelector("#page-number").innerHTML;
      page = parseInt(page);
      page++;
      document.querySelector("#page-number").innerHTML = page;
      updateComments(imageId, page - 1);
    });
    document.querySelector("#loading-page").classList.add("hidden");
    updateImage(0);
    
  });
})();
