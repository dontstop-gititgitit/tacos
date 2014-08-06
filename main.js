$( function() {
	if("ontouchmove" in document.documentElement) {
		$(window).on("touchmove", function(e) {
			e.preventDefault();
		}, false );

		$('.is-scrollable' ).on("touchmove", function(e) {
			e.stopPropagation();
		});
	}
});

// $(function() {
// 	$(this).bind("contextmenu", function(e) {
// 		e.preventDefault();
// 	});
// });

var touchClick = "click",
    touchDown = "mousedown",
    rankingObject,
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if ("ontouchstart" in document.documentElement) {
    touchClick = "touchend";
    touchDown = "touchstart";
}

if (window.navigator.pointerEnabled) {
    touchClick = "pointerup";
    touchDown = "pointerdown";
}

// if localStorage is present, use that
if (('localStorage' in window) && window.localStorage !== null) {
	rankingObject = localStorage['TEVA-Map-Rankings'];
}

var isiPad = navigator.userAgent.match(/iPad/i) != null;

$(document).ready(function(){

	var countryPicked = "",
		countryChosen = "",
		countryTitle = "",
		countryID = "",
		firstPlace = "",
		ranking = { 
			total: 0,
			ranks: []
		},
		totalCount = 0;

	idleTimer = null;
	idleState = false;
	idleWait = 120000; //2 minutes

	$('*').bind('mousemove keydown scroll', function () {

		clearTimeout(idleTimer);

		if (idleState == true) {}

		idleState = false;

		idleTimer = setTimeout(function () { 

			resetButton();
			if ($('.modal').hasClass('active')) {
				$('.modal').removeClass('active');
				setTimeout(function() {
					$('.overlay').removeClass('active');
				}, 250);
			}

		idleState = true; }, idleWait);
	});

	$('body').trigger('mousemove');

	$('.touchButton').on(touchClick, function() {
		$(this).addClass('leftAlign').html('<p>select your country</p>');
		$('.loginPanel').slideDown();
	});
	$('.bg').on(touchClick, function() {
		if($('.touchButton').hasClass('leftAlign')) {
			$('.countryListWrapper').animate({scrollTop:0}, 10);
			resetButton();
		} else {
			$('.loginPanel').slideDown();
			$('.touchButton').addClass('leftAlign').html('<p>select your country</p>');
		}
	});
	$('.loginPanel').on(touchClick, function() {
		if (!$('.confirm').hasClass('selected')){
            $('.listContainer').slideDown();
			return false;
        }
	});
	$('.dropdownPanel').on(touchClick, function(){
		$(this).addClass('selected');
		$('.listContainer').slideDown();
	});

	if (isiPad) {
		$('#countryList option:selected').on(touchClick, function() {
			countryPicked = $(this);
			countryChosen = countryPicked.val();
			countryTitle = $('#countryList').find(':selected').text();
			$('.dropdownPanel').html($(this).text());
			$('.listContainer').slideUp();
			$('.confirm').addClass('selected');
			$('.countryListWrapper').animate({scrollTop:0}, 10);
			return false;
		});
	} else {
		$('ul#countryList li').on(touchClick, function() {
			countryPicked = $(this);
			countryChosen = countryPicked.data('id');
			countryTitle = countryPicked.data('name');
			$('.dropdownPanel').html($(this).text());
			$('.listContainer').slideUp();
			$('.confirm').addClass('selected');
			$('.countryListWrapper').animate({scrollTop:0}, 10);
			return false;
		});
	}
	$('.cancel').on(touchClick, function() {
		$('.countryListWrapper').animate({scrollTop:0}, 10);
		resetButton();
		countryTitle='';
		return false;
	});

	$('.confirm').on(touchClick, function(){
		if(countryTitle){
			if ($('.modal')[0]) {
				populateModal();
				showModal();
				setTimeout(function() {
					resetButton();
				}, 500);
				hideModal();
				return false;
			} else {
				populateCountry();
				resetButton();
			}
		}
	});


	String.prototype.toTitleCase = function(){
		var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

		return this.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
			if (index > 0 && index + match.length !== title.length &&
				match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
				(title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
				title.charAt(index - 1).search(/[^\s-]/) < 0) {
					return match.toLowerCase();
			}

			if (match.substr(1).search(/[A-Z]|\../) > -1) {
				return match;
			}

			if (match.charAt(0).toUpperCase() === 'H' && match.charAt(1).toUpperCase() === 'C')
				return "HCl";
			else
				return match.charAt(0).toUpperCase() + match.substr(1);
	
		});
	};


// === PUT YOURSELF ON THE MAP === //

	if($('ul.topNames') && rankingObject){
		// if this is the map version, read in localStorage object
		ranking = JSON.parse(rankingObject);
		// parse the object and place the green circles on the map for previous data
		var m = Object.keys(ranking.ranks).length;
			ranking.ranks.sort(function(a, b){
				return (a.amount < b.amount) ? 1 : (a.amount > b.amount) ? -1 : //0;
					(a.country > b.country) ? 1 : (a.country < b.country) ? -1 : 0;
			});
			
		for(var i = 0; i < m; i++){
			$('#' + ranking.ranks[i].code)
				.attr('data-size', ranking.ranks[i].amount)
				.css('z-index', parseInt(ranking.ranks[i].amount) + 1);
		}
		// update leader board
		updateList();
	}

	$('.leaderboard h2').on(touchClick, function(){
		// click Leader Board Title to clear local storage
		window.localStorage.clear();
	});

	function populateCountry() {
		countryID = $('#' + countryChosen);
		left = parseInt(countryID.css('left'));

		var i = parseInt(countryID.attr('data-size')),
			n = Object.keys(ranking.ranks).length,
			isActive = false;

		// Update the size of the circle on the map
		if(countryID.attr('data-size') == "") {
			countryID.attr('data-size', 1).css('z-index', 1);
		} else if (countryID.attr('data-size') == "0") {
			countryID.attr('data-size', 1).css('z-index', 1);
		} else {

			if (i < 10)
				countryID.attr('data-size', i + 1).css('z-index', i + 1).css('left', left - 1);
			else {
				countryID.attr('data-size', i + 1).css('z-index', i + 1);
				countryID.addClass('finalGreen');
			}
		}

		// if object has any content
		if(n > 0){
			// if pre-existing record of the country, increase count by one for that record
			for(var i = 0; i < n; i++){
				if(ranking.ranks[i].country.toUpperCase() === countryTitle.toUpperCase()){
					ranking.ranks[i].amount = parseInt(ranking.ranks[i].amount) + 1;
					isActive = true;
				}
			}
			// if not pre-existing, add country and single count to rank
			if(!isActive){
				var newItem = {};
					newItem['country'] = countryTitle;
					newItem['code'] = countryChosen;
					newItem['amount'] = 1;
				ranking.ranks.push(newItem);
			}
		} else {	// if object has no content - add it
			var newItem = {};
				newItem['country'] = countryTitle;
				newItem['code'] = countryChosen;
				newItem['amount'] = 1;
			ranking.ranks.push(newItem);
		}
		// increase "total" by 1
		ranking.total = parseInt(ranking.total) + 1;

		localStorage['TEVA-Map-Rankings'] = JSON.stringify(ranking);

		updateList();
	}

	function updateList() {

		var m = Object.keys(ranking.ranks).length,
			lItem = '', originalFirst = firstPlace;

		if(m > 0){
			ranking.ranks.sort(function(a, b){
				return (a.amount < b.amount) ? 1 : (a.amount > b.amount) ? -1 : //0;
					(a.country > b.country) ? 1 : (a.country < b.country) ? -1 : 0;
			});

			firstPlace = ranking.ranks[0].country;

			for(var i = 0; i < m; i++){
				lItem += "<li><div class='country'>";
				lItem += ranking.ranks[i].country;
				lItem += "</div><div class='score'>";
				lItem += Math.floor((ranking.ranks[i].amount * 100)/ranking.total);
				lItem += "<sup>%</sup></div></li>";
			}
		}

		if ($('ul.topNames')) {
			$('ul.topNames').empty().append(lItem);
		}

		if(firstPlace !== originalFirst){
			$('ul.topNames li').eq(0).addClass('newest');
		}

		countryTitle='';

	}

// === END === PUT YOURSELF ON THE MAP === //

	function showModal() {
		$('h3 span').html(countryTitle);
		$('.overlay').addClass('active');
		$('.modal').addClass('active');
	}

	function populateModal(){
		var k = Object.keys(drugs).length;
		var totalDrugs = 0;
		var mapPath = 'url(./_assets/img/_maps/' + countryChosen + '.jpg)';

		if (countryTitle.toUpperCase() == 'UNITED STATES'){
			totalDrugs = 5;
			$('.modalInner').html('<div class="none usa">See a Teva representative for further information regarding products available in the United States.</div><div class="map"></div>');
		} else {
			for(var j = 0; j < k; j++){
				if(drugs[j].country.toUpperCase() === countryTitle.toUpperCase()){
					if(drugs[j].type.toUpperCase() === "BRANDED"){
						$('ul#drugs ul#branded').append("<li>" + drugs[j].brand + " (" 
							+ drugs[j].molecule + ") " + drugs[j].form + "</li>");
						totalDrugs++;

					} else if(drugs[j].type.toUpperCase() === "GENERIC"){
						var gen = drugs[j].molecule.charAt(0).toUpperCase() + drugs[j].molecule.slice(1);

						$('ul#drugs ul#generic').append("<li>" + gen + "</li>");
						totalDrugs++;
					}
				}
			}
		}

		if (!$('ul#branded li').length) {
			$('li#brandedList').css('display', 'none');
		}
		if (!$('ul#generic li').length) {
			$('li#genericList').css('display', 'none');
		}

		$('.map').css('background-image', mapPath);

		if (totalDrugs < 1) {
			$('ul#drugs, h3').css('display', 'none');
			$('.map').css('display', 'none');
			$('.modalInner').html('<div class="none">Teva currently has no oncology products <br>available in your country.<br><br>Please speak with a representative for further assistance or discussion.<br><br>Thank you for your interest.</div>');
		}

		if ($('.modalInner').outerWidth() != 1374) {
			if (totalDrugs <= 13 && totalDrugs > 0) {
				$('ul#drugs').css({
					'-webkit-column-count' : '3',
					'margin-left' : '-19px'
				});
			} else if (totalDrugs > 13 && totalDrugs <= 30) {
				$('ul#drugs').css({
					'-webkit-column-count' : '3',
					'margin-left' : '-19px'
				});
			} else if (totalDrugs > 30) {
				if (countryTitle == 'Canada')
					$('ul#drugs li:nth-child(32)').css('padding-top', '155px');
				else if (countryTitle == 'United States')
					$('ul#drugs li:nth-child(27)').css('padding-top', '155px');
			}
		} else {
			if (totalDrugs <= 13 && totalDrugs > 0) {
				$('ul#drugs').css({
					'-webkit-column-count' : '3',
					'margin-left' : '-27px'
				});
			} else if (totalDrugs > 13 && totalDrugs <= 30) {
				$('ul#drugs').css({
					'-webkit-column-count' : '3',
					'margin-left' : '-27px'
				});
			} else if (totalDrugs > 30) {
				if (countryTitle == 'Canada')
					$('ul#drugs li:nth-child(32)').css('padding-top', '205px');
				else if (countryTitle == 'United States')
					$('ul#drugs li:nth-child(27)').css('padding-top', '205px');
			}
		}
	}

	function hideModal() {
		$('.modalX').on(touchClick, function() {
			$('.modal').removeClass('active');
			countryPicked = "";
			setTimeout(function() {
				$('.overlay').removeClass('active');
			}, 250);
			setTimeout(function() {
				$('.modalTop').html('<h3>Products available in this country:&nbsp;<span></span></h3><div class="modalX"></div>');
				$('.modalInner').html('<ul id="drugs"><li id="brandedList"><span class="title">branded</span><ul id="branded"></ul></li><li id="genericList"><span class="title">generic</span><ul id="generic"></ul></li></ul><div class="map">');
			}, 500);
		});
		$('.overlay').on(touchClick, function() {
			$('.modal').removeClass('active');
			countryPicked = "";
			setTimeout(function() {
				$('.overlay').removeClass('active');
			}, 250);
			setTimeout(function() {
				$('.modalTop').html('<h3>Products available in this country:&nbsp;<span></span></h3><div class="modalX"></div>');
				$('.modalInner').html('<ul id="drugs"><li id="brandedList"><span class="title">branded</span><ul id="branded"></ul></li><li id="genericList"><span class="title">generic</span><ul id="generic"></ul></li></ul><div class="map">');
			}, 500);
		});
		countryTitle = '';
		return false;
	}

	function resetButton() {
		$('.loginPanel').slideUp();
		$('.touchButton').removeClass('leftAlign').html('<p>touch the screen to begin</p>');
		setTimeout(function() {
			$('.dropdownPanel').html('&#045;&#045;&#045;SELECT&#045;&#045;&#045;')
		}, 500);
		$('.listContainer').slideUp();
		countryTitle = '';
	}

});