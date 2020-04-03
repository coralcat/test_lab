var Shuffle = window.Shuffle;

var ShuffleInstance = function (element) {
  this.element = element;

  this.shuffle = new Shuffle(element, {
    itemSelector: '.project',
  });

  // Log events.
  this.addShuffleEventListeners();

  this._activeFilters = [];

  this.addFilterButtons();
  //this.addSorting();
  this.addSearchFilter();

  this.mode = 'exclusive';
};

ShuffleInstance.prototype.toggleMode = function () {
  if (this.mode === 'additive') {
    this.mode = 'exclusive';
  } else {
    this.mode = 'additive';
  }
};

/**
 * Shuffle uses the CustomEvent constructor to dispatch events. You can listen
 * for them like you normally would (with jQuery for example).
 */
ShuffleInstance.prototype.addShuffleEventListeners = function () {
  this.shuffle.on(Shuffle.EventType.LAYOUT, function (data) {
    console.log('layout. data:', data);
  });

  this.shuffle.on(Shuffle.EventType.REMOVED, function (data) {
    console.log('removed. data:', data);
  });
};

ShuffleInstance.prototype.addFilterButtons = function () {
  var options = document.querySelector('.filter-options');

  if (!options) {
    return;
  }

  var filterButtons = Array.from(options.children);

  filterButtons.forEach(function (button) {
    button.addEventListener('click', this._handleFilterClick.bind(this), false);
  }, this);
};

ShuffleInstance.prototype._handleFilterClick = function (evt) {
  var btn = evt.currentTarget;
  var isActive = btn.classList.contains('active');
  var btnGroup = btn.getAttribute('data-groups');

  // You don't need _both_ of these modes. This is only for the demo.

  // For this custom 'additive' mode in the demo, clicking on filter buttons
  // doesn't remove any other filters.
  if (this.mode === 'additive') {
    // If this button is already active, remove it from the list of filters.
    if (isActive) {
      this._activeFilters.splice(this._activeFilters.indexOf(btnGroup));
    } else {
      this._activeFilters.push(btnGroup);
    }

    btn.classList.toggle('active');

    // Filter elements
    this.shuffle.filter(this._activeFilters);

    // 'exclusive' mode lets only one filter button be active at a time.
  } else {
    this._removeActiveClassFromChildren(btn.parentNode);

    var filterGroup;
    if (isActive) {
      btn.classList.remove('active');
      filterGroup = Shuffle.ALL_ITEMS;
    } else {
      btn.classList.add('active');
      filterGroup = btnGroup;
    }

    this.shuffle.filter(filterGroup);
  }
};

ShuffleInstance.prototype._removeActiveClassFromChildren = function (parent) {
  var children = parent.children;
  for (var i = children.length - 1; i >= 0; i--) {
    children[i].classList.remove('active');
  }
};

/*ShuffleInstance.prototype.addSorting = function () {
  var buttonGroup = document.querySelector('.sort-options');

  if (!buttonGroup) {
    return;
  }

  buttonGroup.addEventListener('change', this._handleSortChange.bind(this));
};

ShuffleInstance.prototype._handleSortChange = function (evt) {
  // Add and remove `active` class from buttons.
  var buttons = Array.from(evt.currentTarget.children);
  buttons.forEach(function (button) {
    if (button.querySelector('input').value === evt.target.value) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  // Create the sort options to give to Shuffle.
  var value = evt.target.value;
  var options = {};

  function sortByDate(element) {
    return Date.parse(element.getAttribute('data-date-created'));
  }

  function sortByTitle(element) {
    return element.getAttribute('data-title').toLowerCase();
  }

  if (value === 'date-created') {
    options = {
      reverse: true,
      by: sortByDate,
    };
  } else if (value === 'title') {
    options = {
      by: sortByTitle,
    };
  }

  this.shuffle.sort(options);
};*/

ShuffleInstance.prototype.addSearchFilter = function () {
  var searchInput = document.querySelector('.js-shuffle-search');

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener('input', this._handleSearchKeyup.bind(this));
};

/**
 * Filter the shuffle instance by items with a title that matches the search input.
 * @param {Event} evt Event object.
 */
ShuffleInstance.prototype._handleSearchKeyup = function (evt) {
  var searchText = evt.target.value.toLowerCase();

  this.shuffle.filter(function (element, shuffle) {

    // If there is a current filter applied, ignore elements that don't match it.
    if (shuffle.group !== Shuffle.ALL_ITEMS) {
      // Get the item's groups.
      var groups = JSON.parse(element.getAttribute('data-groups'));
      var isElementInCurrentGroup = groups.indexOf(shuffle.group) !== -1;

      // Only search elements in the current group
      if (!isElementInCurrentGroup) {
        return false;
      }
    }

    var titleElement = element.querySelector('.project-title');
    var titleText = titleElement.textContent.toLowerCase().trim();

    return titleText.indexOf(searchText) !== -1;
  });
};

document.addEventListener('DOMContentLoaded', function () {
  window.shuffleInstance = new ShuffleInstance(document.getElementById('grid'));
});

