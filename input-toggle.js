/**
 * Toggles a class and/or attribute on an element based on the value
 * of a form input.
 *
 * The interface to this library is to add several data attributes to
 * element(s) whose class(es) and/or attribute you would like toggled by
 * the state of a form input, and call InputToggle.init() to bind change
 * event listeners to the input(s) and set the initial state of the
 * toggled element(s). You can optionally provide a scope to
 * InputToggle.init() in the form of a DOM reference or jQuery selector,
 * to limit the initialization scope.
 *
 * The names of those required attributes can be modified by passing
 * them to InputToggle.init() as options, but we'll document using the
 * default values. If you use custom attribute names without 'data-'
 * prefixes for the active values and inactive values, you lose the
 * ability to specify a JSON array list of values for active or inactive
 * input values.
 *
 * This component is structured so that several elements can be
 * toggled based on the value of the same input with a single change
 * listener, and can even be toggled based on the value(s) of a set of
 * inputs (i.e. checkboxes, radio buttons), or of a multi-select, and
 * can be toggled based on the presence or absence of one or a set of
 * possible values. This is facilitated by the fact that we get all the
 * input values with the target input name within the initialization
 * scope, meaning that you will want to limit that scope if you have
 * multiple inputs on a page with the same name, and you don't want all
 * of them to activate a particular toggle.
 *
 * Given a checkbox input with the name 'checkbox_name' and a value of
 * 1, and an element whose class and/or attribute you would like
 * toggled (referred to henceforth as 'toggled'), take the following
 * steps to configure the toggle:
 *   1) Give the attribute 'data-input-toggle="checkbox_name"' to the
 *      element to be toggled based on the value(s) of the input(s) with
 *      the name "checkbox_name".
 *   2) Give *either* of the attributes 'data-input-toggle-active-value'
 *      OR 'data-input-toggle-inactive-value' to the toggled element,
 *      set to the value(s) of the input you would like to have
 *      trigger the active or inactive classes or attributes,
 *      respectively. For a single active or inactive value, simply set
 *      the attribute to  that value. For multiple active or inactive
 *      values, set to a JSON array string, such as
 *      data-input-toggle-active-value='["1","2"]'. Note that you must
 *      use strings for the values in this array, since the input values
 *      to which they're compared are always interpreted as strings.
 *      Special characters should be htmlentities-encoded, and they will
 *      be decoded for comparison with the input value(s).
 *   3) Give any combination of the following attributes to the
 *      toggled element as desired:
 *      - data-input-toggle-active-class: set to a single or space-
 *        separated set of class names added when the input is set to
 *        the active value and removed otherwise in the case of the
 *        'data-input-toggle-active-value' attribute use, or inversely
 *        the class added to the toggled element when the input
 *        isn't set to the inactive value, and removed from it when it
 *        is when using 'data-input-toggle-inactive-value'.
 *      - data-input-toggle-inactive-class: set to a single or space-
 *        separated set of class names removed when the input is set to
 *        the active value and added otherwise in the case of the
 *        'data-input-toggle-active-value' attribute use, or inversely
 *        the class added to the toggled element when the input is set
 *        to the inactive value, and removed from it otherwise when
 *        using 'data-input-toggle-inactive-value'.
 *      - data-input-toggle-active-attribute: set to the desired
 *        name and value (optionally, separated by '='), of an attribute
 *        to be added when the input is set to the active value and
 *        removed otherwise in the case of the
 *        'data-input-toggle-active-value' attribute use, or inversely
 *        the attribute removed from the toggled element when the input
 *        is set to the inactive value, and added to it otherwise when
 *        using 'data-input-toggle-inactive-value'. An example usage
 *        would be data-input-toggle-active-attribute="checked=checked",
 *        yielding the attribute checked="checked" upon the target
 *        input having an active value/state.
 *      - data-input-toggle-inactive-attribute: set to the desired
 *        name and value (optionally, separated by '='), of an attribute
 *        to be removed when the input is set to the active value and
 *        added otherwise in the case of the
 *        'data-input-toggle-active-value' attribute use, or inversely
 *        the attribute added to the toggled element when the input
 *        matches the inactive value, and removed from it otherwise when
 *        using 'data-input-toggle-inactive-value'.
 *
 * @author Tom Penzer thepenzone.com
 * @dependency jQuery v1.4 or later
 **/
var InputToggle = InputToggle || {
  'attributes': {
    'toggled':                'data-input-toggle',
    'activeValue':            'data-input-toggle-active-value',
    'inactiveValue':          'data-input-toggle-inactive-value',
    'activeClass':            'data-input-toggle-active-class',
    'inactiveClass':          'data-input-toggle-inactive-class',
    'activeAttribute':        'data-input-toggle-active-attribute',
    'inactiveAttribute':      'data-input-toggle-inactive-attribute',
  },
  'init': function(scope, options) {
  	// Explicit reference to object supports being called from an init collection.
  	var _this = InputToggle,
    	$scope,
      toggles = {};

    // Set scope of init to passed element reference if valid, else use document scope.
    if (scope &&
    	$(scope).length > 0
    ) {
    	$scope = $(scope);
    } else {
    	$scope = $(document);
    }

    // Override default attributes with properly formatted options object.
    if (typeof options === 'object' &&
    	typeof options.attributes === 'object'
    ) {
    	$.extend(_this.attributes, options.attributes);
    }

    // Find valid toggles and group them by input name
    $scope.find('[' + _this.attributes.toggled + ']').each(function() {
    	if (_this.validateToggle(this)) {
      	var inputName = this.attributes[_this.attributes.toggled].value.toString();

      	if (inputName.length > 0) {
          if (typeof toggles[inputName] !== 'object') {
            toggles[inputName] = [this];
          } else {
            toggles[inputName].push(this);
          }
        }
      }
    });

    // For each input name, bind change listeners to inputs and set initial toggle state.
    $.each(toggles, function(inputName, inputToggles) {
    	var inputs = $scope.find('[name="' + inputName + '"]');

      if (inputs.length > 0) {
        inputs.each(function() {
          $(this).off('change.InputToggle')
            .on('change.InputToggle', function() {
              _this.update(inputToggles, _this.getInputValues(inputName, $scope));
            });
        });

        // Set initial toggled element state.
		    _this.update(inputToggles, _this.getInputValues(inputName, $scope));
      }
    });
  },
  /**
  * Must have both valid active or inactive values and one of a valid
  * active class, inactive class, active attribute or inactive
  * attribute.
  **/
  'validateToggle': function(toggle) {
  	var $toggle = $(toggle);

  	if (
    	(
      	($toggle.is('[' + this.attributes.activeValue + ']') &&
      		$toggle.attr(this.attributes.activeValue).length > 0
        ) ||
    		($toggle.is('[' + this.attributes.inactiveValue + ']') &&
        	$toggle.attr(this.attributes.inactiveValue).length > 0
        )
      ) &&
      (
      	($toggle.is('[' + this.attributes.activeClass + ']') &&
      		$toggle.attr(this.attributes.activeClass).length > 0
        ) ||
      	($toggle.is('[' + this.attributes.inactiveClass + ']') &&
      		$toggle.attr(this.attributes.inactiveClass).length > 0
        ) ||
        ($toggle.is('[' + this.attributes.activeAttribute + ']') &&
      		$toggle.attr(this.attributes.activeAttribute).length > 0
        ) ||
        ($toggle.is('[' + this.attributes.inactiveAttribute + ']') &&
      		$toggle.attr(this.attributes.inactiveAttribute).length > 0
        )
      )
    ) {
    	return true;
    }

    return false;
  },
  'update': function(toggles, inputValues) {
  	var _this = this;

    $.each(toggles, function() {
      var isActive = _this.determineActive(this, inputValues);

      _this.toggleClass(this, isActive);
      _this.toggleAttribute(this, isActive);
    });
  },
  'getInputValues': function(inputName, $scope) {
  	var $inputs = $scope.find('[name="' + inputName + '"]'),
      inputValues = [];// Name can be shared, so treat as array.

		if ($inputs.length > 0) {
      $inputs.each(function(i, input) {
      	var inputValue = $(input).val();

		    // Only get checked values for checkboxes or radio buttons.
        if (input.type === 'checkbox' ||
        	input.type === 'radio'
        ) {
        	if ($(input).is(':checked')) {
	          inputValues.push(inputValue);
          }
        } else if ($.isArray(inputValue)) {// multi-select
        	inputValues = inputValues.concat(inputValue);
        } else {
        	inputValues.push(inputValue);
        }
      });
    }

    return inputValues;
  },
  'getAttributeValue': function($toggle, attributeName) {
  	if ($toggle.is('[' + attributeName + ']')) {
    	// Prefer $.data() since it parses JSON strings as JSON and decodes htmlentities.
      if (attributeName.indexOf('data-') === 0) {
	    	return $toggle.data(attributeName.substring(5));
      } else {
      	// If using a custom non-data attribute, drop array support.
	    	return $toggle.attr(attributeName);
      }
    }

    return false;
  },
  'hasInputValues': function(inputValues, testValues) {
    if (! $.isArray(testValues)) {
      // Input values are always strings, so cast to string to find matches.
      testValues = [testValues.toString()];
    }

    // $.filter gets the intersection between the input and active values.
    if ($(testValues).filter(inputValues).length > 0) {
      return true;
    }

    return false;
  },
  'determineActive': function(toggle, inputValues) {
  	var _this = this,
    	$toggle = $(toggle),
    	activeValues = _this.getAttributeValue($toggle, _this.attributes.activeValue),
    	inactiveValues = _this.getAttributeValue($toggle, _this.attributes.inactiveValue);

		if (activeValues) {
    	return _this.hasInputValues(inputValues, activeValues);
    } else if (inactiveValues) {
    	// Switch to default true, false if match for inactive value(s).
      return ! _this.hasInputValues(inputValues, inactiveValues);
    }

  },
  'toggleClass': function(toggle, isActive) {
  	var _this = this,
    	$toggle = $(toggle),
    	activeClass = $toggle.attr(_this.attributes.activeClass) || '',
    	inactiveClass = $toggle.attr(_this.attributes.inactiveClass) || '';

    if (isActive) {
    	if (activeClass.length > 0) {
      	$toggle.addClass(activeClass);
      }

      if (inactiveClass.length > 0) {
      	$toggle.removeClass(inactiveClass);
      }
    } else {
    	if (activeClass.length > 0) {
      	$toggle.removeClass(activeClass);
      }

      if (inactiveClass.length > 0) {
      	$toggle.addClass(inactiveClass);
      }
    }
  },
  'parseToggleAttribute': function($toggle, attribute) {
  	var toggleAttribute = '',
    	splitEqual = [],
      toggleAttributeValue = '';

    if ($toggle.is('[' + attribute + ']')) {
    	toggleAttribute = $toggle.attr(attribute);
      splitEqual = toggleAttribute.split('=');

    	// If there's an = sign, split into attribute name and value.
      if (splitEqual.length > 1) {
        toggleAttribute = splitEqual[0];
      	toggleAttributeValue = splitEqual[1];
      }
    }

    return {
    	'attribute': toggleAttribute,
      'value': toggleAttributeValue
    };
  },
  'toggleAttribute': function(toggle, isActive) {
  	var _this = this,
    	$toggle = $(toggle),
    	activeAttribute = _this.parseToggleAttribute($toggle, _this.attributes.activeAttribute),
    	inactiveAttribute = _this.parseToggleAttribute($toggle, _this.attributes.inactiveAttribute);

		if (isActive) {
    	if (activeAttribute.attribute.length > 0) {
      	if (activeAttribute.value.length > 0) {
          $toggle.attr(activeAttribute.attribute, activeAttribute.value);
        } else {
        	$toggle.attr(activeAttribute.attribute);
        }
      }

      if (inactiveAttribute.attribute.length > 0) {
      	$toggle.removeAttr(inactiveAttribute.attribute);
      }
    } else {
    	if (activeAttribute.attribute.length > 0) {
      	$toggle.removeAttr(activeAttribute.attribute);
      }

      if (inactiveAttribute.attribute.length > 0) {
      	if (inactiveAttribute.value.length > 0) {
          $toggle.attr(inactiveAttribute.attribute, inactiveAttribute.value);
        } else {
        	$toggle.attr(inactiveAttribute.attribute);
        }
      }
    }
  }
}
