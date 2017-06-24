$(function() {
	var puppyPad = {};
	
	puppyPad = {
		init: function () {
			var _this = this;
			console.log("INITIALIZE!");
			
			_this.cacheDOM();
			_this.loadData();
			_this.bindings();
		},
		bindings: function () {
			var _this = this;
			var t = new Date();
			var today = {
					year: t.getFullYear(),
					month: t.getMonth() + 1,
					day: t.getDate()
				};
			var $birthYear = _this.dom.startForm.find('fieldset[name=age] select[name=birthYear]');
			var $birthMonth = _this.dom.startForm.find('fieldset[name=age] select[name=birthMonth]');
			var $birthDay = _this.dom.startForm.find('fieldset[name=age] select[name=birthDay]');
			var age = {
					birthYear: Number($birthYear.val()),
					birthMonth: Number($birthMonth.val()),
					birthDay: Number($birthDay.val()),
					leapYear: false
				};
			var months = [
					"January",
					"February",
					"March",
					"April",
					"May",
					"June",
					"July",
					"August",
					"September",
					"October",
					"November",
					"December"
				];
				var monthList = $.extend(months, {});
			
			_this.dom.startButton.off().on('click', function (e) {
				console.log(e, 'button clicked');
				_this.dom.startButton.attr('disabled', 'disabled');
				// open overlay with puppy form
			});
			
			// ===== Age Date Fields =====
			// On year selection
			$birthYear.off().on('change', function (e) {
				// Set the selected year value
				age.birthYear = Number($birthYear.val());
				// Is the selected birth year a leap year?
				if (age.birthYear % 4 === 0) {
					age.leapYear = true;
				}
				
				// Remove future months if birth year is the same as the current year
				if (age.birthYear === today.year) {
					monthList = $.extend(months, {});
					monthList = months.splice(0, today.month);
				}
				
				// reset months if the existing list is different
				if (_this.dom.startForm.find('fieldset[name=age] select[name=birthMonth] option').length !== monthList.length) {
					_this.dom.startForm.find('fieldset[name=age] select[name=birthMonth]').html('<option>Month</option>');
					age.birthMonth = 0;
					// Populate month dropdown
					$.each(monthList, function (i, monthName) {
						_this.dom.startForm.find('fieldset[name=age] select[name=birthMonth]').append('<option value="' + (i + 1) + '">' + monthName + '</option>');
					});
				}
				
				// Enable the month dropdown
				$birthMonth.removeAttr('disabled');
				age = _this.calculateAge(age, today);
				age = _this.writeAgeString(age);
				_this.dom.startForm.find('.ageValue').html('<strong>Age:</strong>' + age.string);
			});
			
			// On month selection
			$birthMonth.off().on('change', function (e) {
				var daysNumber;
				
				// Set the selected month value
				age.birthMonth = Number($birthMonth.val());
				
				// Get the default number of days to add to the dropdown
				daysNumber = _this.daysInMonth(age.birthMonth, age.leapYear);
				
				// Remove future days if birth year amnd month are same as current
				if (age.birthYear === today.year && age.birthMonth === today.month) {
					console.log('Born this month and year!');
					daysNumber = today.day;
				}
				
				// reset days if the existing list is different
				if (_this.dom.startForm.find('fieldset[name=age] select[name=birthDay] option').length !== (daysNumber + 1)) {
					_this.dom.startForm.find('fieldset[name=age] select[name=birthDay]').html('<option>Day</option>');
					age.birthDay = 0;
					for (var i = 1; i <= daysNumber; i++) {
						_this.dom.startForm.find('fieldset[name=age] select[name=birthDay]').append('<option value="' + i + '">' + i + '</option>');
					}
				}
				$birthDay.removeAttr('disabled');
				age = _this.calculateAge(age, today);
				age = _this.writeAgeString(age);
				_this.dom.startForm.find('.ageValue').html('<strong>Age:</strong>' + age.string);
			});
			
			// On day selection
			$birthDay.off().on('change', function (e) {
				// Set the selected day value
				age.birthDay = Number($birthDay.val());
				
				age = _this.calculateAge(age, today);
				age = _this.writeAgeString(age);
				_this.dom.startForm.find('.ageValue').html('<strong>Age:</strong>' + age.string);
			});
		},
		cacheDOM: function () {
			var _this = this;
			
			_this.dom = {
				mainContent: $('.main-content'),
				startButton: $('button[name=start]'),
				startForm: $('form[name=startForm]')
			};
		},
		calculateAge: function (age, today) {
			var _this = this;
			age.string = "";
			age.years = 0;
			age.months = 0;
			age.days = 0;
			
			if (age.birthYear > 0 && age.birthMonth > 0 && age.birthDay > 0) {
				if (age.birthYear !== today.year) {
					age.years = today.year - age.birthYear;
				}
				if (age.birthMonth > today.month) {
					age.years--;
					age.months = 12 + today.month - age.birthMonth;
				} else {
					age.months = today.month - age.birthMonth;
				}
				if (age.birthDay > today.day) {
					age.months--;
					age.days = _this.daysInMonth(age.birthMonth, age.leapYear);
					age.days += today.day - age.birthDay;
				} else {
					age.days = today.day - age.birthDay;
				}
			}
			console.log("Calculate:", age);
			return age;
		},
		daysInMonth: function (month, leapYear) {
			var daysNumber = 31; // base number of days in a month
			var thirtyDays = [4, 6, 9, 11];
			
			// adjust number of days by chosen month
			if (month === 2) {
				if (leapYear) {
					daysNumber = 29;
				} else {
					daysNumber = 28;
				}
			} else if ($.inArray(thirtyDays, month) > -1) {
				daysNumber = 30;
			}
		
			return daysNumber;
		},
		generateBreedId: function (i, breedName) {
			var _this = this;
			var breedId;
			var temp;
			
			// Convert to lowercase
			breedId = breedName.toLowerCase();
			
			// Remove special characters
			breedId = breedId.replace(/[^a-z ]/g, '');
			
			// Remove double spaces
			breedId = breedId.replace(/  /g, ' ');
			
			// Break up the words
			temp = breedId.split(' ');
			
			// Reset ID to number
			breedId = i + '-';
			
			// "Abbreviate" and Concatenate
			$.each(temp, function (j, word) {
				console.log(j, word);
				if (temp.length < 4) {
					breedId += word.substring(0, 3);
				} else {
					breedId += word.substring(0, 1);
				}
				if (j < (temp.length - 1)) {
					breedId += '-';
				}	
				console.log(breedId);
			});
			
			console.log(breedId);
			
			return breedId;
		},
		getBreeds: function () {
			var _this = this;
			var breedId;
			
			$.getJSON('http://api.petfinder.com/breed.list?format=json&key=de817c75e924601817b8c3214f882f11&animal=dog&callback=?')
  			.done(function(petApiData) {
  				console.log('Data retrieved!', petApiData);
  				
					$.each(petApiData.petfinder.breeds.breed, function (i, dogBreed) {
						console.log(i, dogBreed.$t);
						breedId = _this.generateBreedId(i, dogBreed.$t);
						_this.dom.startForm.find('fieldset[name=breed] select[name=breed]').append('<option value="' + breedId + '">' + dogBreed.$t + '</option>');
					});
  			});
		},
		loadData: function () {
			var _this = this;
			var year = new Date().getFullYear();
			
			// Age Years
			for (var j = 0; j < 30; j++) {
				_this.dom.startForm.find('fieldset[name=age] select[name=birthYear]').append('<option value="' + (year - j) + '">' + (year - j) + '</option>');
			}
			
			// Breeds
			_this.getBreeds();
		},
		writeAgeString: function (age) {
			if (age.birthYear > 0 && age.birthMonth > 0 && age.birthDay > 0) {
				if (age.years > 0) {
					age.string = " " + age.years + " year";
					if (age.years > 1) {
						age.string += "s";
					}
				}
				if (age.months > 0) {
					if (age.string.length > 0) {
						age.string += ",";
					}
					age.string += " " + age.months + " month";
					if (age.months > 1) {
						age.string += "s";
					}
				}
				if (age.days > 0) {
					if (age.string.length > 0) {
						age.string += ",";
					}
					age.string += " " + age.days + " day";
					if (age.days > 1) {
						age.string += "s";
					}
				} else if (age.string.length === 0) {
					age.string = " Less than a day";
				}
				age.string += " old";
			} else {
				age.string = "";
			}
			
			console.log("Write string:", age);
			return age;
		}
	};
	
	puppyPad.init();
});
