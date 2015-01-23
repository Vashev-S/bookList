/**
* Object for work with books list
*/
var LibContr = {
  /**
  * Checking to support localstorage
  * @return {boolean} true if browser supports localstorage, false if not
  */
  supportStorage : function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  },
  /**
  * Function wrapper for 'this.showBook()'' and 'this.getAllbok' 
  */
  onLoadPage : function() {
    var bookList, bookName;
    if (!this.supportStorage) {
      return;
    };
    bookList = this.getAllBook();
    for (bookName in bookList) {
      this.showBook(bookList[bookName]);
    };
  },
  /**
  * Delete book from localstorage
  * @book {object} selector of removes book
  */
  deleteBook : function(book) {
    var bookCont = $(book).closest('.list-group');
    var bookName = $(book).closest('.list-group').find('.bookName').text();
    var author = $(book).closest('.list-group').find('.list-group-item-heading').text();
    var bookKey = bookName +'|'+ author;
    //delete book from localstorage
    localStorage.removeItem(bookKey);
    //delete book from GUI
    bookCont.remove();
  },
  /**
  * Edit the selected book
  * @book {object} edited book
  */
  editBook : function(book) {
    var button = $('.btstrpCstmBtn');
    var bookHrefCont = $(book).closest('.list-group a');
    var bookName = $(book).closest('.list-group').find('.bookName').text();
    var author = $(book).closest('.list-group').find('.list-group-item-heading').text();
    var pages = $(book).closest('.list-group').find('.badge').text();
    var year = $(book).closest('.list-group').find('.year').text();
    //point new book
    $('.bookList').find('.active').removeClass('active');
    bookHrefCont.addClass('active');
    //change button
    button.removeClass('btn-success');
    button.addClass('btn-danger');
    button.text('Edit');
    //fill in the fields
    $('.bookAuthor').val(author);
    $('.bookYear').val(year);
    $('.bookName').val(bookName);
    $('.bookPages').val(pages);
    //scroll too input form
    $('html, body').animate({
      scrollTop: $(".bookAuthor").offset().top
    }, 1000);
  },
  /**
  * getting all elements from localstorage
  * @return {object} associative array of books
  */
  getAllBook : function() {
    var val;
    var bookList = {};
    if (!this.supportStorage()) {
      return false;
    };
    for (val in localStorage) {
      if (localStorage.getItem(val)) {
        bookList[val] = JSON.parse(localStorage.getItem(val));
      }
    };
    return bookList;
  },
  /**
  * Add new book from GUI in localstorage and show it
  */
  addBook : function() {
    var param;
    //get value and prepare too paste
    var bookName = $('.bookName').val().replace(/[^A-zА-я\d\w ]/g, '').trim();
    var year = $('.bookYear').val();
    var author = $('.bookAuthor').val().replace(/[^A-zА-я\d\w ]/g, '').trim();
    var pages = $('.bookPages').val();
    var bookData = {'year' : year, 'author' : author, 'bookName' : bookName, 'pages' : pages};
    //check mandatory inputs
    if (!(bookName && author)) {
      return this.showAlert('error', 'Check mandatory input params NAME and AUTHOR');
    };
    //check for edit
    if (localStorage[bookName+'|'+author]) {
      return this.showAlert('info', 'The book already exists');
    };
    //delete special symbols
    for (param in bookData) {
      bookData[param] = bookData[param] === undefined ? '' : bookData[param];
      bookData[param] = bookData[param].replace(/[^A-zА-я\d\w ]/g, '');
    };
    //Add book and show it
    localStorage[bookName+'|'+author] = JSON.stringify(bookData);
    this.showBook(bookData);
    //clear inputs
    this.clearField();
    //show success message
    this.showAlert('success', 'The book has been added');
  },
  /**
  * Accept edits of book
  */
  acceptEditBook : function() {
    var button = $('.btstrpCstmBtn');
    var editBook = $('.bookList').find('.active');
    this.deleteBook(editBook);
    this.addBook(editBook);
    //change button
    button.removeClass('btn-danger');
    button.addClass('btn-success');
    button.text('Accept');
    //clear inputs
    this.clearField();
    //show info
    this.showAlert('success', 'The book has been edited');
  },
  /**
  * Showing book in GUI
  * @bookData {object} information about book
  */
  showBook : function(bookData) {
    var html;
    var pages = bookData['pages'] === '' ? '' : '<span class="badge">'+bookData['pages']+'</span>';
    html =  '<div class="list-group">'+
              '<a href="#" class="list-group-item">'+
                '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>'+
                '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>'+
                '<h4 class="list-group-item-heading">'+bookData['author']+'</h4>'+
                pages+
                '<p class="list-group-item-text">'+
                  '<span class="bookName">'+bookData['bookName']+'</span>'+
                  ' / '+
                  '<span class="year">'+bookData['year']+'</span>'+
                '</p>'+
              '</a>'+
            '</div>' 

    ;
    $('.bookList').append(html);
  },
  /**
  * Check button status and choose action
  * @btn {object} clicked button
  */
  clickTheButton : function(btn) {
    var btnStatus = $(btn).text();
    switch (btnStatus) {
      case 'Accept':
        this.addBook();
      break
      case 'Edit':
        this.acceptEditBook();
      break
      default:
        this.showAlert('error', 'Unrecognized button status')
    };
  },
  /**
  * show alert message
  * @alertType {string} type of alert message
  * @alertMsg {string} alert message
  */
  showAlert : function(alertType, alertMsg) {
    $('.alert').clearQueue();
    $('.alert').removeClass().addClass('alert');
    switch (alertType) {
      case 'success' :
        $('.alert').addClass('alert-success');
      break
      case 'error' :
        $('.alert').addClass('alert-danger');
      break
      case 'info' :
        $('.alert').addClass('alert-info');
      break
      default :
        $('.alert').addClass('alert-danger');
        alertMsg = 'Unrecognized alertType'
    };
    //show alert
    $('.alert').text(alertMsg);
    $('.alert').css({'display':'block'});
    //hide alert after 6 sec
    $('.alert').delay(6000).fadeOut(300);
  },
  /**
  * Clearing inputs
  */
  clearField : function() {
    $('.bookAuthor').val('');
    $('.bookYear').val('');
    $('.bookName').val('');
    $('.bookPages').val('');
  }
};

$(document).ready(function() {
  //if Browser IE
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    $('.main-cont').html('Try that pls <a href="https://www.google.ru/chrome/browser/desktop/index.html">Chrome</a>');
  };
  //Start working
  LibContr.onLoadPage();
  //Add book
  $('.btstrpCstmBtn').on('click', function() {
    LibContr.clickTheButton(this);
  });
  //Delete book
  $('.bookList').on('click', '.glyphicon-trash', function() {
    LibContr.deleteBook(this);
  });
  //Edit book
  $('.bookList').on('click', '.glyphicon-edit', function() {
    LibContr.editBook(this);
  });
  //do not hide alert
  $('.alert').on('click', function() {
    $('.alert').clearQueue();
  });
});