$(function() {
	var puppyPad = {};
	
	puppyPad = {
		init: function () {
			var _this = this;
			
			_this.cacheDOM();		
			_this.bindings();
			_this.loadData();	
			_this.checkStorage();
		},
		
		puppyProfile: {},
		today: {},
		storageName: "puppy",
		
		addAdoptableDog: function (dog) {
			var _this = this;
			var $div = $('<div />');
			
			$div.append('<img src="' + dog.media.photos.photo[0].$t + '" alt="' + dog.name.$t + '" class="photo" />');
			$div.append('<h6>' + dog.name.$t + '</h6>');
			$div.append('<p><a href="tel:' + _this.formatPhone(dog.contact.phone.$t) + '">' + _this.formatPhone(dog.contact.phone.$t, true) + '</a></p>');
			
			_this.dom.adoptableDogs.append($div);
		},
		bindings: function () {
			var _this = this;
			var overlayOpacity = $('#cboxOverlay').css('opacity');
			var overlayMaxPixels = "960px";
			var overlayPercentage = "90%";
			var t = new Date();
			var today = {
					year: t.getFullYear(),
					month: t.getMonth() + 1,
					day: t.getDate()
				};
			var age = {
					birthYear: Number(_this.dom.birthYear.val()),
					birthMonth: Number(_this.dom.birthMonth.val()),
					birthDay: Number(_this.dom.birthDay.val()),
					leapYear: false,
					ageLabel: "<strong>Calculated Age:</strong>"
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
			
			_this.today = today;
			
			// Get Started button
			_this.dom.startButton.off().on('click', function (e) {
				_this.dom.startButton.attr('disabled', 'disabled');
				// open overlay with puppy form
				$.colorbox({
					inline: true,
					href: '.start-form',
					opacity: overlayOpacity,
					width: window.innerWidth > parseInt(overlayMaxPixels) ? overlayMaxPixels : overlayPercentage,
					height: window.innerHeight > parseInt(overlayMaxPixels) ? overlayMaxPixels : overlayPercentage,
					onOpen: function () {
					},
					onClosed: function () {
						_this.dom.startButton.removeAttr('disabled');
					}
				});
			});
			
			// Clear information button
			_this.dom.clearButton.off().on('click', function (e) {
				_this.dom.clearButton.attr('disabled', 'disabled');
				_this.resetProfile();
			});
			
			// Resize overlay when screen changes
			$(window).resize(function () {
				$.colorbox.resize({
					width: window.innerWidth > parseInt(overlayMaxPixels) ? overlayMaxPixels : overlayPercentage,
					height: window.innerHeight > parseInt(overlayMaxPixels) ? overlayMaxPixels : overlayPercentage
				});
			});
			
			// Puppy Name
			_this.dom.puppyName.off().on('blur', function (e) {
				if (_this.dom.puppyName.val().length > 0) {
					_this.dom.puppyName.removeClass('error');
					_this.puppyName = _this.dom.puppyName.val();
					$('.puppyName').html(_this.puppyName);
				} else {
					_this.dom.puppyName.addClass('error');
				}
			});
			
			// ===== Age Date Fields =====
			// On year selection
			_this.dom.birthYear.off().on('change', function (e) {
				// Remove error class
				_this.dom.birthYear.removeClass('error');
				// Set the selected year value
				age.birthYear = Number(_this.dom.birthYear.val());
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
				if (_this.dom.birthMonth.find('option').length !== monthList.length) {
					_this.dom.birthMonth.html('<option value="">Month</option>');
					age.birthMonth = 0;
					// Populate month dropdown
					$.each(monthList, function (i, monthName) {
						_this.dom.birthMonth.append('<option value="' + (i + 1) + '">' + monthName + '</option>');
					});
				}
				
				// Enable the month dropdown
				_this.dom.birthMonth.removeAttr('disabled');
				age = _this.calculateAge(age, today);
				_this.dom.startForm.find('.ageValue').html(age.ageLabel + age.string);
			});
			
			// On month selection
			_this.dom.birthMonth.off().on('change', function (e) {
				var daysNumber;
				
				// Remove error class
				_this.dom.birthMonth.removeClass('error');
				
				// Set the selected month value
				age.birthMonth = Number(_this.dom.birthMonth.val());
				
				// Get the default number of days to add to the dropdown
				daysNumber = _this.daysInMonth(age.birthMonth, age.leapYear);
				
				// Remove future days if birth year amnd month are same as current
				if (age.birthYear === today.year && age.birthMonth === today.month) {
					daysNumber = today.day;
				}
				
				// reset days if the existing list is different
				if (_this.dom.birthDay.find('option').length !== (daysNumber + 1)) {
					_this.dom.birthDay.html('<option value="">Day</option>');
					age.birthDay = 0;
					for (var i = 1; i <= daysNumber; i++) {
						_this.dom.birthDay.append('<option value="' + i + '">' + i + '</option>');
					}
				}
				_this.dom.birthDay.removeAttr('disabled');
				age = _this.calculateAge(age, today);
				_this.dom.startForm.find('.ageValue').html(age.ageLabel + age.string);
			});
			
			// On day selection
			_this.dom.birthDay.off().on('change', function (e) {
				// Remove error class
				_this.dom.birthDay.removeClass('error');
				// Set the selected day value
				age.birthDay = Number(_this.dom.birthDay.val());
				
				age = _this.calculateAge(age, today);
				_this.dom.startForm.find('.ageValue').html(age.ageLabel + age.string);
			});
			
			// Custom error messages
			_this.dom.startForm.find('input, select').each(function (i, item) {
				// Use the custom data attribute to set error message
				if (typeof $(item).data('error') !== 'undefined') {
					item.oninvalid = function () {
						if (item.validity.patternMismatch || item.validity.valueMissing) {
							item.setCustomValidity($(item).data('error'));
						} else {
							item.setCustomValidity('');
						}
					}
				}
			});
			
			// ===== Form submission =====
			_this.dom.startForm.off().on('submit', function (e) {
				e.preventDefault();
				
				// basic back-up validation
				_this.dom.startForm.find(':input').each(function (k, item) {
					if ($(item).val() === '') {
						$(item).addClass('error');
					}
				});
				if (_this.dom.startForm.find('.error').length > 0) {
					return false;
				} else {
					_this.processProfile(_this.dom.startForm);
					$.colorbox.close();
				}
			});
		},
		cacheDOM: function () {
			var _this = this;
			
			_this.dom = {
				mainContent: $('.main-content'),
				puppyContent: $('.puppy-content'),
				startButton: $('button[name=start]'),
				clearButton: $('button[name=clear]'),
				startForm: $('form[name=startForm]'),
				puppyName: $('input[name=puppyName]'),
				birthYear: $('select[name=birthYear]'),
				birthMonth: $('select[name=birthMonth]'),
				birthDay: $('select[name=birthDay]'),
				adoptableDogs: $('.adoptable-dogs')
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
			
			age = _this.writeAgeString(age);
			
			_this.puppyProfile.age = $.extend(_this.puppyProfile.age, age);
			
			return age;
		},
		checkStorage: function () {
			var _this = this;
			
			_this.retrieveData();
			
			if (_this.puppyProfile && _this.puppyProfile.name && _this.puppyProfile.name.length > 0) {
				// Adjust age calculation
				_this.puppyProfile.age = _this.calculateAge(_this.puppyProfile.age, _this.today);
				// Store new values
				_this.storeData(_this.puppyProfile);
				// Go into profile
				_this.updateUI(_this.puppyProfile);
			}
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
		formatPhone: function (string, reformat) {
			var _this = this;
			var phoneNumber;
			
			// Remove everything other than numbers
			phoneNumber = string.replace(/[^0-9]/g, '');
			
			// If reformat, apply this format
			if (reformat) {
				if (phoneNumber.substring(0,1) === "1") {
					phoneNumber = phoneNumber.substring(0, 1) + "-" + phoneNumber.substring(1, 4) + "-" + phoneNumber.substring(4, 7) + "-" + phoneNumber.substring(7);
				} else {
					phoneNumber = "(" + phoneNumber.substring(0, 3) + ") " + phoneNumber.substring(3, 6) + "-" + phoneNumber.substring(6);
				}
			}
			
			return phoneNumber;
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
				if (temp.length < 2) {
					breedId += word.substring(0, 10);
				} else if (temp.length < 4) {
					breedId += word.substring(0, 3);
				} else if (temp.length < 5) {
					breedId += word.substring(0, 2);
				} else {
					breedId += word.substring(0, 1);
				}
				if (j < (temp.length - 1)) {
					breedId += '-';
				}
			});
			
			return breedId;
		},
		getAdoptableDogs: function (puppy) {
			var _this = this;
			var breed = puppy.breed.name;
			var dogSize = puppy.size.id;
			var gender = puppy.gender.id;
			var loc = puppy.location;
			var url = 'http://api.petfinder.com/pet.find?format=json&key=de817c75e924601817b8c3214f882f11&animal=dog&count=3';
			
			if (breed !== 'Unknown' && breed !== 'Mixed/Mutt') {
				url += "&breed=" + breed;
			}
			if (dogSize !== 'u') {
				url += "&size=" + dogSize.toUpperCase();
			}
			if (gender !== 'u') {
				url += "&sex=" + gender.toUpperCase();
			}
			url += '&location=' + loc;
			url += '&callback=?';
			
			_this.dom.adoptableDogs.html('');
			
			$.getJSON(url)
  			.done(function(petApiData) {
  				//console.log('Data retrieved!', petApiData);
  				
					$.each(petApiData.petfinder.pets.pet, function (i, dog) {
						_this.addAdoptableDog(dog);
					});
  			});
		},
		getBreeds: function () {
			var _this = this;
			var breedId;
			
			$.getJSON('http://api.petfinder.com/breed.list?format=json&key=de817c75e924601817b8c3214f882f11&animal=dog&callback=?')
  			.done(function(petApiData) {
  				//console.log('Data retrieved!', petApiData);
  				
					$.each(petApiData.petfinder.breeds.breed, function (i, dogBreed) {
						breedId = _this.generateBreedId(i, dogBreed.$t);
						_this.dom.startForm.find('select[name=breed]').append('<option value="' + breedId + '">' + dogBreed.$t + '</option>');
					});
  			});
		},
		loadData: function () {
			var _this = this;
			
			// Age Years
			for (var j = 0; j < 30; j++) {
				_this.dom.startForm.find('select[name=birthYear]').append('<option value="' + (_this.today.year - j) + '">' + (_this.today.year - j) + '</option>');
			}
			
			// Breeds
			_this.getBreeds();
		},
		processProfile: function (form) {
			var _this = this;
			
			_this.puppyProfile.breed = {
				name: form.find('select[name=breed] :selected').text(),
				id: form.find('select[name=breed]').val()
			};
			_this.puppyProfile.name = form.find('input[name=puppyName]').val();
			_this.puppyProfile.gender = {
				name: form.find('select[name=gender] :selected').text(),
				id: form.find('select[name=gender]').val()
			};
			_this.puppyProfile.size = {
				name: form.find('select[name=size] :selected').text(),
				id: form.find('select[name=size]').val()
			};
			_this.puppyProfile.location = form.find('input[name=zip]').val();
			
			console.log(_this.puppyProfile);
			_this.storeData(_this.puppyProfile);
			_this.updateUI(_this.puppyProfile);
		},
		resetProfile: function () {
			var _this = this;
			
			_this.storeData({});
			window.location.reload();
		},
		retrieveData: function () {
			var _this = this;
			var temp;
			
			if (window.localStorage && window.localStorage.getItem(_this.storageName)) {
				// Use Local Storage
				_this.puppyProfile = JSON.parse(window.localStorage.getItem(_this.storageName));
			} else if (document.cookie.length > 0) {
				// Use a Cookie
				temp = decodeURIComponent(document.cookie).split(';');
				for (var i = 0; i < temp.length; i++) {
					while (temp[i].charAt(0) === ' ') {
						temp[i] = temp[i].substring(1);
					}
					if (temp[i].indexOf(_this.storageName) == 0) {
						_this.puppyProfile =  JSON.parse(temp[i].substring(_this.storageName.length + 1, temp[i].length));
					}
				}
			}
		},
		storeData: function (data) {
			var _this = this;
			
			if (window.localStorage) {
				// Use Local Storage
				window.localStorage.setItem(_this.storageName, JSON.stringify(data));
			} else {
				// Use a Cookie
				window.cookie = _this.storageName + "=" + JSON.stringify(data) + ";expires=;path=/";
			}
		},
		updateUI: function (puppy) {
			var _this = this;
			
			// Switch div that is showing
			if (_this.dom.mainContent.is(':visible')) {
				_this.dom.mainContent.hide();
				_this.dom.puppyContent.show();
			}
			
			// Populate data
			_this.dom.puppyContent.find('.puppyName').html(puppy.name);
			_this.dom.puppyContent.find('.birthdate').html(puppy.age.birthMonth + '/' + puppy.age.birthDay + '/' + puppy.age.birthYear);
			_this.dom.puppyContent.find('.ageValue').html(puppy.age.string);
			_this.dom.puppyContent.find('.gender').html(puppy.gender.name);
			_this.dom.puppyContent.find('.breed').html(puppy.breed.name);
			_this.dom.puppyContent.find('.size').html(puppy.size.name);
			
			// Get adoptable dogs
			_this.getAdoptableDogs(puppy);
		},
		writeAgeString: function (age) {
			// Check that everything has been entered
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
			
			return age;
		}
	};
	
	// Initialize
	puppyPad.init();
});