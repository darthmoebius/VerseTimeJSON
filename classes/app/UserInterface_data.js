import { round, getHashedLocation, getHash, convertHoursToTimeString, getCustomTime, convertDateToShortTime, getUniverseTime, getLocationByName } from '../../HelperFunctions.js';
import Settings_data from './Preferences_data.js';
import DB from './Database.js';
import Window from './Window.js';

import SolarSystem from '../SolarSystem.js';
import Star from '../Star.js';


class UserInterface_data {
    constructor() {
        if (UserInterface.instance) return UserInterface.instance;
		UserInterface.instance = this;

		//this.bgElement = document.getElementById('selected-location-bg-image');
		//this.bgColor = this.bgElement.style.backgroundColor;

		this.locationSelectedIndex = -1;
		this.visibleButtons = [];

		this.Settings_data = new Window('modal-Settings', 'Settings-window', null);
		//this.Debug = new Window('detailed-info', null, null);
		//this.Credits = new Window('modal-credits', null, null);
	}

	getButtons() {
		return document.getElementById('available-locations-list').querySelectorAll('.BUTTON-set-location');
	}

	getVisibleButtons() {
		return document.getElementById('available-locations-list').querySelectorAll('.BUTTON-set-location:not(.hide)');
	}

	getSelectedButton() {
		return document.getElementById('available-locations-list').querySelector('.BUTTON-set-location.selected');
	}

	setupEventListeners() {
		// CLICKS
		//this.listen('click', 'BUTTON-open-Settings_data', () => { UI_Data.Settings_data.toggle(); UI_Data.el('location-selection-input').focus(); });
		//this.listen('click', 'BUTTON-close-Settings_data', () => { UI_Data.Settings_data.toggle(); });

		//this.listen('click', 'BUTTON-toggle-credits-window', () => { UI_Data.Credits.toggle(); });
		//this.listen('click', 'BUTTON-close-credits', () => { UI_Data.Credits.toggle(); });

		//this.listen('click', 'BUTTON-share-location', this.shareLocation);


		// KEYBOARD TOGGLES
		/*
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				if (UI_Data.Settings_data.show) UI_Data.Settings_data.toggle();
				if (UI_Data.Credits.show) UI_Data.Credits.toggle();

				return;
			}
			if (UI_Data.Settings_data.show) {

				// get visible buttons once
				if (this.locationSelectedIndex === -1) {
					this.buttons = this.getVisibleButtons();
				}

				if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
					if (event.key === 'Tab') { event.preventDefault(); }
					if (this.locationSelectedIndex <= 0) {
						event.preventDefault();
						this.locationSelectedIndex = -1;
						this.getSelectedButton()?.classList.remove('selected');
						UI_Data.el('location-selection-input').focus();
						return;
					}
					UI_Data.el('location-selection-input').blur();
					this.getSelectedButton()?.classList.remove('selected');
					this.locationSelectedIndex--;
					this.buttons[this.locationSelectedIndex].classList.add('selected');

					// scroll to button
					UI_Data.el('available-locations-list').scroll(0, this.buttons[this.locationSelectedIndex].offsetTop - 200);
					return;
				}

				if (event.key === 'ArrowDown' || event.key === 'Tab') {
					if (event.key === 'Tab') { event.preventDefault(); }
					if (this.locationSelectedIndex >= this.buttons.length - 1) { return; }
					UI_Data.el('location-selection-input').blur();
					this.getSelectedButton()?.classList.remove('selected');
					this.locationSelectedIndex++;
					this.buttons[this.locationSelectedIndex].classList.add('selected');

					// scroll to button
					UI_Data.el('available-locations-list').scroll(0, this.buttons[this.locationSelectedIndex].offsetTop - 200);
					return;
				}
			}

			if (event.target.tagName.toLowerCase() === 'input') return;
		});*/


		// SUPPRESS FIREFOX QUI_DataCKSEARCH
		window.addEventListener('keydown', (event) => {
			if (event.key === '/') {
				event.preventDefault();
			}
		}, { capture: true });

		// KEYBOARD SEARCH
		document.addEventListener('keyup', (event) => {
			if (UI_Data.Settings_data.show && event.key === 'Enter') {
				let selected = this.getSelectedButton();
				if(selected) {
					UI_Data.setMapLocation(selected.dataset.locationName);
					return;
				}

				let buttons = this.getVisibleButtons();
				if(buttons && buttons.length > 0) {
					UI_Data.setMapLocation(buttons[0].dataset.locationName);
				}
				return;
			}

			if (event.target.tagName.toLowerCase() === 'input') return;

			if (event.key === '/') {
				if (!UI_Data.Settings_data.show) UI_Data.Settings_data.toggle();
				this.locationSelectedIndex = -1;
				this.getSelectedButton()?.classList.remove('selected');
				UI_Data.el('location-selection-input').focus();
				return;
			}
		})


		// CUSTOM TIME SELECTION
		this.listen('input', 'time-selection-input', () => {
			const timeInput = UI_Data.el('time-selection-input').value;
			UI_Data.setCustomTime(timeInput);
		})


		// TYPING IN LOCATION SEARCH BOX
		this.el('location-selection-input').addEventListener('input', (event) => {
			const search = UI_Data.el('location-selection-input').value.toLowerCase();
			const searchFragments = search.split('+');
			const buttons = this.getButtons();

			if (search === '') {
				this.locationSelectedIndex = -1;
				this.getSelectedButton()?.classList.remove('selected');
				buttons?.forEach(el => el.classList.remove('hide'));
				return;
			}

			for (const element of buttons) {
				const found = Array();
				for (let [index, fragment] of searchFragments.entries()) {
					if (fragment === '') continue;
					found[index] = (element.innerText.toLowerCase().includes(fragment)) ? true : false;
				}

				const result = found.every((value) => value === true);
				result ? element.classList.remove('hide') : element.classList.add('hide');
			}
		});
	}

	// MAIN UPDATE FUNCTIONS
	update() {
		//UI_Data.#update_setColors();
		//UI_Data.#update_setThemeImage();
		UI_Data.#update_setLocationInfo();
		//UI_Data.#update_setRiseAndSetData();
		//UI_Data.#update_setIlluminationStatus();

		if (UI_Data.Settings_data.show) {
			UI_Data.updateSettingsLocationTimes();
		}else{
			UI_Data.Settings_data.toggle(); // default show
		}
	}

	/*#update_setColors() {
		const col = Settings_data.activeLocation.THEME_COLOR;
		const colorMain = `rgb(${col.r}, ${col.g}, ${col.b})`;
		const colorDark = `rgb(${col.r * 0.2}, ${col.g * 0.2}, ${col.b * 0.2})`;

		document.querySelector(':root').style.setProperty('--theme-color', colorMain);
		document.querySelector(':root').style.setProperty('--theme-color-dark', colorDark);

		if (UI_Data.bgColor !== colorMain) UI_Data.bgColor = colorMain;
	}

	#update_setThemeImage() {
		const url = `url('${Settings_data.activeLocation.THEME_IMAGE}')`;
		if (UI_Data.bgElement.style.backgroundImage !== url) UI_Data.bgElement.style.backgroundImage = url;
	}*/

	#update_setLocationInfo() {
		if (
			Settings_data.activeLocation.ILLUMINATION_STATUS === 'Polar Day' ||
			Settings_data.activeLocation.ILLUMINATION_STATUS === 'Polar Night' ||
			Settings_data.activeLocation.LOCAL_TIME.toString() === 'NaN'
		) {
			UI_Data.setText('local-time', Settings_data.activeLocation.ILLUMINATION_STATUS);
		} else {
			UI_Data.setText('local-time', convertHoursToTimeString(Settings_data.activeLocation.LOCAL_TIME / 60 / 60, false));
		}
		if (Settings_data.customTime !== 'now') {
			UI_Data.setText('chosen-time', getCustomTime().toLocaleString());
			UI_Data.setText('chosen-time-sublabel', 'local selected time');
		} else {
			UI_Data.setText('chosen-time', '');
			UI_Data.setText('chosen-time-sublabel', '');
		}
		UI_Data.setText('location-name', Settings_data.activeLocation.NAME);
		UI_Data.setText('location-body-name', Settings_data.activeLocation.PARENT.NAME);
	}

	/*#update_setRiseAndSetData() {
		// COUNTDOWNS
		let nextRise = Settings_data.activeLocation.NEXT_STAR_RISE;
		if (!nextRise) {
			UI_Data.setText('next-rise-countdown', '---');

		} else {
			nextRise = Settings_data.activeLocation.IS_STAR_RISING_NOW ? '- NOW -' : convertHoursToTimeString(nextRise * 24, true, false);
			UI_Data.setText('next-rise-countdown', nextRise);
		}

		let nextSet = Settings_data.activeLocation.NEXT_STAR_SET;
		if (!nextSet) {
			UI_Data.setText('next-set-countdown', '---');

		} else {
			nextSet = Settings_data.activeLocation.IS_STAR_SETTING_NOW ? '- NOW -' : convertHoursToTimeString(nextSet * 24, true, false);
			UI_Data.setText('next-set-countdown', nextSet);
		}


		// LOCAL TIMES
		if (!nextRise) {
			UI_Data.setText('local-rise-time', '---');
		} else {
			UI_Data.setText('local-rise-time', convertHoursToTimeString(Settings_data.activeLocation.LOCAL_STAR_RISE_TIME * 24, false, true));
		}

		if (!nextSet) {
			UI_Data.setText('local-set-time', '---');
		} else {
			UI_Data.setText('local-set-time', convertHoursToTimeString(Settings_data.activeLocation.LOCAL_STAR_SET_TIME * 24, false, true));
		}


		// REAL TIMES
		let now = getCustomTime();
		if (!nextRise) {
			UI_Data.setText('next-rise-time', '---');
		} else {
			const rise = now.setSeconds(now.getSeconds() + (Settings_data.activeLocation.NEXT_STAR_RISE * 86400));
			UI_Data.setText('next-rise-time', convertDateToShortTime(new Date(rise)));
		}

		now = getCustomTime();
		if (!nextSet) {
			UI_Data.setText('next-set-time', '---');
		} else {
			const set = now.setSeconds(now.getSeconds() + (Settings_data.activeLocation.NEXT_STAR_SET * 86400));
			UI_Data.setText('next-set-time', convertDateToShortTime(new Date(set)));
		}
	}*/

	/*#update_setIlluminationStatus() {
		let scDate = getCustomTime();
		scDate.setFullYear(scDate.getFullYear() + 930);
		let scDateString = scDate.toLocaleString('default', { year: 'numeric', month: 'long', day: 'numeric' });
		UI_Data.setText('illumination-status', Settings_data.activeLocation.ILLUMINATION_STATUS + '\r\n' + scDateString);
	}*/



	// GLOBAL FUNCTIONS
	setText(elementID, string) {
		let el = (typeof elementID === 'string') ? document.getElementById(elementID) : elementID;

		if (!el) {
			console.error('Element not found:', elementID);
			return null;
		}

		if (el.textContent !== string) el.textContent = string;
	}

	el(idString) {
		let el = document.getElementById(idString);

		if (!el) {
			console.error('Element not found:', idString);
			return null;
		}

		return el;
	}

	listen(eventType, element, callbackFunction) {
		if (typeof element === 'string') {
			element = document.getElementById(element);
		}

		if (!(element instanceof HTMLElement)) {
			console.error('Element not found:', element);
			return;
		} else if (typeof callbackFunction !== 'function') {
			console.error('Callback parameter is not a function:', callbackFunction);
			return;
		} else if (typeof eventType !== 'string') {
			console.error('Non-string parameter passed as event type:', eventType);
			return;
		}

		element.addEventListener(eventType, callbackFunction);
	}


	// SHARE LOCATION
	/*shareLocation() {
		const url = location.protocol + '//' + location.host + location.pathname + '#' + getHash();
		navigator.clipboard.writeText(url);

		const msg = UI_Data.el('share-location-message');
		msg.style.transition = '0s ease-out';
		msg.style.opacity = 1;

		setTimeout(() => {
			msg.style.transition = '1s ease-out';
			msg.style.opacity = 0;
		}, 2000)
	}*/


	// FUNCTIONS FOR LOCATION SELECTION WINDOW
	setCustomTime(inputTime, isUnix = false) {
		let newCustomTime = 'now';
		if (isUnix) {
			newCustomTime = Number.parseInt(inputTime);
		} else {
			let inputDate = new Date(inputTime);
			newCustomTime = inputDate.valueOf() / 1000;
		}

		if (Number.isNaN(newCustomTime) || !Number.isFinite(newCustomTime)) {
			newCustomTime = 'now';
		}

		Settings_data.customTime = newCustomTime;

		window.suppressReload = true;
		parent.location.hash = getHash();
		setTimeout(() => {
			window.suppressReload = false;
		}, 1000);
	}

	updateSettingsLocationTimes() {
		let buttons = document.getElementsByClassName('BUTTON-set-location');

		for (let element of buttons) {
			const location = getLocationByName(element.dataset.locationName);

			let string = '';
			if (String(location.LOCAL_TIME) === 'NaN') {
				string = location.ILLUMINATION_STATUS;
			} else {
				string = convertHoursToTimeString(location.LOCAL_TIME / 60 / 60, false, true) + '\r\n' + location.ILLUMINATION_STATUS;
			}

			const timeElement = element.querySelector('.set-location-time');
			UI_Data.setText(timeElement, string);
		}
	}

	/*updateDebugUI_Data() {
		let loc = Settings_data.activeLocation;
		let bod = Settings_data.activeLocation ? Settings_data.activeLocation.PARENT : null;

		UI_Data.setText('db-hash', window.location.hash);

		// CLOCKS
		let unix = Math.floor(getCustomTime().valueOf() / 1000);
		UI_Data.setText('db-unix-time', unix.toLocaleString());
		UI_Data.setText('db-chosen-time', getCustomTime().toUTCString());
		UI_Data.setText('db-gmt-time', new Date().toUTCString());
		UI_Data.setText('db-universe-time', getUniverseTime(true).replace('GMT', 'SET'));

		//CELESTIAL BODY
		if (bod) {
			UI_Data.setText('body-name', bod.NAME);
			UI_Data.setText('body-type', bod.TYPE);
			UI_Data.setText('body-system', bod.PARENT_STAR.NAME);
			UI_Data.setText('body-parent-name', bod.PARENT.NAME);
			UI_Data.setText('body-radius', bod.BODY_RADIUS.toLocaleString());
			UI_Data.setText('day-length', (bod.ROTATION_RATE * 60 * 60).toLocaleString());
			UI_Data.setText('day-length-readable', convertHoursToTimeString(bod.ROTATION_RATE));
			UI_Data.setText('hour-length-readable', convertHoursToTimeString(bod.ROTATION_RATE / 24));
			UI_Data.setText('current-cycle', round(bod.CURRENT_CYCLE(), 3).toLocaleString());
			UI_Data.setText('hour-angle', bod.HOUR_ANGLE().toFixed(3));
			UI_Data.setText('declination', bod.DECLINATION(bod.PARENT_STAR).toFixed(3));
			UI_Data.setText('meridian', bod.STATIC_MERIDIAN().toFixed(3));
			UI_Data.setText('noon-longitude', bod.ROTATING_MERIDIAN().toFixed(3));
		}

		//LOCATION
		UI_Data.setText('db-local-name', loc.NAME);
		UI_Data.setText('db-local-time', convertHoursToTimeString(loc.LOCAL_TIME / 60 / 60));

		let latitude = loc.LATITUDE.toFixed(3);
		if (parseFloat(latitude) < 0) {
			latitude = 'S ' + (parseFloat(latitude) * -1).toFixed(3);
		} else {
			latitude = 'N ' + latitude;
		}
		UI_Data.setText('latitude', latitude);

		let longitude = loc.LONGITUDE.toFixed(3);
		if (parseFloat(longitude) < 0) {
			longitude = 'W ' + (parseFloat(longitude) * -1).toFixed(3);
		} else {
			longitude = 'E ' + longitude;
		}
		UI_Data.setText('longitude', longitude);

		UI_Data.setText('longitude-360', round(loc.LONGITUDE_360, 3));
		UI_Data.setText('elevation', round(loc.ELEVATION * 1000, 1).toLocaleString());
		UI_Data.setText('elevation-degrees', loc.ELEVATION_IN_DEGREES.toFixed(3));
		UI_Data.setText('sunriseset-angle', loc.STARRISE_AND_STARSET_ANGLE.toFixed(3));
		UI_Data.setText('length-of-daylight', convertHoursToTimeString(loc.LENGTH_OF_DAYLIGHT * 24, true, false));
		UI_Data.setText('length-of-night', convertHoursToTimeString((bod.ROTATION_RATE) - (loc.LENGTH_OF_DAYLIGHT * 24), true, false));
		UI_Data.setText('starrise-time', convertHoursToTimeString(loc.LOCAL_STAR_RISE_TIME * 24));
		UI_Data.setText('starset-time', convertHoursToTimeString(loc.LOCAL_STAR_SET_TIME * 24));
		UI_Data.setText('next-starrise-countdown', round(parseFloat(loc.NEXT_STAR_RISE), 6).toFixed(6));
		UI_Data.setText('next-starset-countdown', round(parseFloat(loc.NEXT_STAR_SET), 6).toFixed(6));
		UI_Data.setText('db-illumination-status', loc.ILLUMINATION_STATUS);
		UI_Data.setText('hour-angle-location', loc.HOUR_ANGLE().toFixed(3));
		UI_Data.setText('star-azimuth', loc.STAR_AZIMUTH().toFixed(3));
		UI_Data.setText('star-altitude', loc.STAR_ALTITUDE().toFixed(3));
		UI_Data.setText('max-star-altitude', loc.STAR_MAX_ALTITUDE().toFixed(3));

		let now = getCustomTime();
		now.setMilliseconds(0);
		let next = now.setSeconds(now.getSeconds() + (loc.NEXT_STAR_RISE * 24 * 60 * 60));
		next = new Date(next).toLocaleString();
		let remain = convertHoursToTimeString(loc.NEXT_STAR_RISE * 24, true, false);
		UI_Data.setText('db-next-starrise', (loc.NEXT_STAR_RISE * 24 * 60 * 60).toFixed(0));
		UI_Data.setText('db-next-starrise-countdown', remain);
		UI_Data.setText('db-next-starrise-date', next);

		now = getCustomTime();
		now.setMilliseconds(0);
		next = now.setSeconds(now.getSeconds() + (loc.NEXT_NOON * 24 * 60 * 60));
		next = new Date(next).toLocaleString();
		remain = convertHoursToTimeString(loc.NEXT_NOON * 24, true, false);
		UI_Data.setText('next-noon', (loc.NEXT_NOON * 24 * 60 * 60).toFixed(0));
		UI_Data.setText('next-noon-countdown', remain);
		UI_Data.setText('next-noon-date', next);

		now = getCustomTime();
		now.setMilliseconds(0);
		next = now.setSeconds(now.getSeconds() + (loc.NEXT_STAR_SET * 24 * 60 * 60));
		next = new Date(next).toLocaleString();
		remain = convertHoursToTimeString(loc.NEXT_STAR_SET * 24, true, false);
		UI_Data.setText('db-next-starset', (loc.NEXT_STAR_SET * 24 * 60 * 60).toFixed(0));
		UI_Data.setText('db-next-starset-countdown', remain);
		UI_Data.setText('db-next-starset-date', next);
	}*/


	// ===============
	// MAIN INTERFACE
	// ===============

	setMapLocation(locationName) {
		const location = getLocationByName(locationName);

		if (!location) {
			console.error('Invalid [locationName] parameter passed to [setLocation] function!\nValue passed: ' + locationName);
			return false;
		}

		const previousLocation = Settings_data.activeLocation ?? null;

		Settings_data.activeLocation = location;
		Settings_data.save('activeLocation', Settings_data.activeLocation.NAME);
		if (UI_Data.Settings_data.show) {
			UI_Data.Settings_data.toggle();
			UI_Data.el('location-selection-input').value = '';
			UI_Data.el('location-selection-input').blur();
			this.locationSelectedIndex = -1;
			this.getSelectedButton()?.classList.remove('selected');
			this.getButtons()?.forEach(el => el.classList.remove('hide'));
			UI_Data.el('available-locations-list').scroll(0, 0);
		}

		window.suppressReload = true;
		parent.location.hash = getHashedLocation();
		setTimeout(() => {
			window.suppressReload = false;
		}, 1000);

		return true;
	}

	populateLocationList() {
		let container = document.getElementById('available-locations-list');

		for (let loc of DB.locations) {
			if (loc.PARENT?.TYPE === 'Lagrange Point') continue;
			if (loc.TYPE === 'Asteroid cluster') continue;

			let el = document.createElement('div');
			el.className = 'BUTTON-set-location';
			el.addEventListener('click', function (e) { UI_Data.setMapLocation(loc.NAME); });
			el.dataset.locationName = loc.NAME;

			let elName = document.createElement('p');
			elName.className = 'set-location-name';
			elName.innerHTML = loc.NAME;

			let elBody = document.createElement('p');
			elBody.className = 'set-location-body';
			elBody.innerHTML = loc.PARENT.NAME;

			let elTime = document.createElement('p');
			elTime.className = 'set-location-time';
			elTime.innerHTML = 'XX:XX';

			el.appendChild(elName);
			el.appendChild(elBody);
			el.appendChild(elTime);
			container.appendChild(el);
		}
	}
}

const UI_Data = new UserInterface_data();
export default UI_Data;