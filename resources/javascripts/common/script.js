jQuery(document).ready(function () {
    'use strict';

    var listFilter = $('.listFilter');
    if (listFilter.length > 0) {
        listFilter.on('change', function () {
            var queryString = queryStringHelper.getUpdatedQueryString(window.location.search, 'filter[' + $(this).data('field') + ']', $(this).val());
            window.location = $(this).data('base-path') + queryString;
        });
    }

    var signUpPanelSelector = $(".panel-signup, .panel-signin");
    if (signUpPanelSelector.length > 0) {

        $(function () {
            $("input,select,textarea").not("[type=submit]").jqBootstrapValidation(
                {
                    preventSubmit: true,
                    autoAdd: {
                        helpBlocks: true
                    },
                    classNames: {
                        group: ".form-group",
                        warning: "has-warning",
                        error: "has-error",
                        success: "has-success"
                    },
                    submitError: function ($form, event, errors) {
                    },
                    submitSuccess: function ($form, event) {
                        checkUniquenessOfEmail(event);
                    },
                    filter: function () {
                        return $(this).is(":visible");
                    }
                }
            );
        });
    }

    function checkUniquenessOfEmail(event) {
        var emailSelector = $('#signUpForm .form-group input[type="email"]');
        if (emailSelector.length == 0)
            return;

        $.ajax({
            url: "/signup/checkUniquenessOfEmail",
            data: {email: emailSelector.val()},
            method: "POST",
            async: false,
            headers: {
                accept: "application/json; charset=utf-8"
            },
            success: function (data) {
                if (data.isEmailUnique == true || (data.responseJSON && data.responseJSON.isEmailUnique == true)) {

                } else {
                    event.preventDefault();
                    var emailFormGroupSelector = emailSelector.parents(".form-group");
                    emailFormGroupSelector.addClass("has-error");
                    emailFormGroupSelector.find(".help-block").html("Specified email already in use");
                }
            },
            error: function (e) {
                var error = {message: 'Some error has occurred, please try again'};
                event.preventDefault();
                if (e.statusText) {
                    error.message = e.statusText;
                } else if (e.responseText) {
                    error.message = e.responseText;
                }
                var emailFormGroupSelector = emailSelector.parents(".form-group");
                emailFormGroupSelector.addClass("has-error");
                emailFormGroupSelector.find(".help-block").html(error.message);
            }
        });
        return false;
    }

    new Clipboard('.copy-to-clipboard-button');
});

var queryStringHelper = function () {
    function getUpdatedQueryString(originalQueryString, name, value) {
        var queryString = "";
        if (originalQueryString.length == 0 && value !== '') {
            queryString = '?' + name + '=' + value;
        } else if (value !== '') {
            var queryObject   = getQueryObject(originalQueryString);
            queryObject[name] = value;
            queryString       = convertToQueryString(queryObject);
        } else {
            queryObject = getQueryObject(originalQueryString);
            delete queryObject[name];
            queryString = convertToQueryString(queryObject);

        }
        return queryString;
    }

    function getQueryObject(queryString) {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) {
                return decodeURIComponent(s.replace(pl, " "));
            },
            queryObject;

        if (queryString.substring(0, 1) === '?')
            queryString = queryString.substring(1);

        queryObject = {};
        while (match = search.exec(queryString))
            queryObject[match[1]] = decode(match[2]);
        //queryObject[decode(match[1])] = decode(match[2]);
        return queryObject;
    };

    function convertToQueryString(queryObject) {
        var queryString = '?';

        $.each(Object.keys(queryObject), function (index, value) {
            queryString += value + '=' + encodeURIComponent(queryObject[value]) + '&'
            //queryString += encodeURIComponent(value) + '='+ encodeURIComponent(queryObject[value]) + '&'
        });
        return queryString.substring(0, queryString.length - 1);
    };

    var self = {
        getUpdatedQueryString: getUpdatedQueryString
    };
    return self;
}();
