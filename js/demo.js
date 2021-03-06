(function() {

    // validators - custom validators.
    // validateField will apply these validators when the form
    // field has a class name that matches.
    var validators = {

        // name - demo name field
        'name' : function(value, field, $form) {
            var words = value.split(' ').length,
                numbers = /\d/.test(value),
                len = value.length;

            if ($.trim(value).toLowerCase() === "han solo") {
                field.value = '"I\'ve got a bad feeling about this"';
            }

            if (numbers) {
                field.setCustomValidity('I don\'t believe that you have' +
                        ' a number in your name');
            } else if (words < 2 || len < 5) {
                field.setCustomValidity('Please enter your full name');
            } else {
                field.setCustomValidity('');
            }
        },

        // number - only allows numbers/floats, supports data-min/max.
        'number' : function(value, field, $form) {
            var minAttr = $(field).attr('data-min'),
                maxAttr = $(field).attr('data-max'),
                min = minAttr ? parseFloat(minAttr, 10) : undefined,
                max = maxAttr ? parseFloat(maxAttr, 10) : undefined,
                number = parseFloat(value, 10),
                msg;

            if (min && max === undefined) {
                msg = 'Please enter value above ' + min;
            } else if (max && min === undefined) {
                msg = 'Please enter value below ' + max;
            } else {
                msg = 'Please enter value between ' + min + ' and ' + max;
            }

            if (isNaN(value)) {
                field.setCustomValidity("Please enter a number");
            } else if (min !== undefined && number < min) {
                field.setCustomValidity(msg);
            } else if (max !== undefined && number > max) {
                field.setCustomValidity(msg);
            } else {
                field.setCustomValidity('');
            }
        },

        // password - password field of min. 5 chars
        'password' : function(value, field, $form) {
            if (value.length >= 5) {
                field.setCustomValidity('');
            } else {
                field.setCustomValidity('Password should be at least' +
                        ' 5 characters');
            }
        },

        // same-password-source - same password
        'same-password-source' : function(value, field, $form) {
            var target = $form.find('.same-password-target')[0];
            // force revalidation
            if (target.value) $(target).trigger('change');
        },

        // same-password-target - same password
        'same-password-target' : function(value, field, $form) {
            var source = $form.find('.same-password-source')[0],
                same;

            if (field.value === source.value) {
                field.setCustomValidity('');
            } else {
                field.setCustomValidity('Not the same password');
            }
        }
    };


    // createError - can create error message element.
    // Is done during intialization.
    function createError() {
        // No custom error element, we will do smart things
        // with show/hideError.
        return $(this);
    }


    // showError - shows error message
    function showError($el, msg, field) {
        $el.parents('.control-group').addClass('error');
        $el.parent().
            find('.help-inline').hide().
            end().
            append('<span class="help-inline error">' +
                msg + '</span>');
    }


    // hideError - hides error message
    function hideError($el, field) {
        $el.parents('.control-group').removeClass('error');
        $el.parent().find('.help-inline.error').
            remove().
            end().
            find('.help-inline').show();
    }


    // validateField - function that validates a field.
    function validateField(field, form) {
        // The checkValidity call will actuall trigger the invalid event
        // when the field is not valid. Until that time, it's just a piece
        // of state on field.validity.
        if (field.checkValidity() || field.validity.customError) {
            var classes = (field.className + '').split(' '),
                l = classes.length,
                x,
                cn,
                validator;

            // Check if there is a validator for each class
            for (x = 0; x < l; x++) {
                cn = $.trim(classes[x]);
                validator = validators[cn];
                // And run it if so
                if (validator) validator(field.control.value(), field, form);
            }

            // We always have to declare our inputs as valid ourselves
            if (field.checkValidity()) $(field).trigger('valid');
        }
    }


    $(function() {

        // Basic f5 setup
        $('form').f5({
            error: {
                create: createError,
                show: showError,
                hide: hideError
            }
        }).each(function() {

            // We want to do validation on input/change,
            // and we want to hook in custom validation rules.

            var $form = $(this),
                $fields = $(this).f5fields();

            $fields.bind('invalid', function(e) {
                // case: hit submit right away, then change inputs
                $(this).data('checkValidityOnKeyUp', true);
            });

            $fields.bind('change', function(e) {
                validateField(this, $form);
                $(this).data('checkValidityOnKeyUp', true);
                // remove server errors here
            });

            $fields.bind('input', function(e) {
                if (false /* could remove some server errors */ ||
                    $(this).data('checkValidityOnKeyUp') === true) {
                    validateField(this, $form);
                }
            });

        }).bind('submit', function() {
            // Don't submit when not valid
            if (!this.checkValidity()) return false;
            alert('valid, could be submitting if it wasn\'t a demo');
            return false;
        });
    });

})();
