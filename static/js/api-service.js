let apiService = (function () {
  "use strict";
  let module = {};

  /*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date
  */

  // add an image to the gallery
  module.addImage = function (title, author, picture) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("picture", picture);
    return fetch("/api/images/", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  };

  // delete an image from the gallery given its imageId
  module.deleteImage = function (imageId) {
    return fetch("/api/images/" + imageId, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  // add a comment to an image
  module.addComment = function (imageId, author, content) {
    return fetch("/api/comments/?imageId=" + imageId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ImageId: imageId,
        author: author,
        content: content,
      }),
    }).then((res) => res.json());
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    return fetch("/api/comments/" + commentId, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  module.getImage = function (page) {
    return fetch(`/api/images?page=${page}`).then((res) => res.json());
  };

  module.getComments = function (imageId, page) {
    return fetch(`/api/comments?imageId=${imageId}&page=${page}`).then((res) =>
      res.json()
    );
  };

  module.createUser = function (username,password) {
    return fetch("/api/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password
      }),
    }).then((res) => res.json());
  };

  module.loginUser = function (username,password) {
    return fetch("/api/users/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password
      }),
    }).then((res) => res.json());
  };

  module.getUsername = function () {
    return fetch(`/api/users/me`).then((res) => res.json());
  };

  return module;
})();
