import CelestialBody from '../CelestialBody.js';
import DB from './Database.js';
import UI_Data from './UserInterface_data.js';

class Preferences_data {
    constructor() {
        if (Preferences_data.instance) return Preferences_data.instance;
		Preferences_data.instance = this;

		this.use24HourTime = true;
		this.activeLocation = null;
		this.customTime = 'now';
		this.useHdTextures = true;
    }

    load() {
		const savedActiveLocation = String(window.localStorage.getItem('activeLocation'));
		if (window.location.hash === '' && savedActiveLocation !== 'null') {
			const result = UI_Data.setMapLocation(savedActiveLocation);
			if (!result) Settings_data.#setDefaultLocation();

		} else if (window.location.hash === '') {
			Settings_data.#setDefaultLocation();
		}

		const time24 = window.localStorage.getItem('time24');
		if (time24) {
			Settings_data.use24HourTime = (time24 === 'false') ? false : true;
		} else {
			Settings_data.use24HourTime = true;
		}

		const hdTextures = window.localStorage.getItem('hdTextures');
		if (hdTextures) {
			Settings_data.useHdTextures = (hdTextures === 'false') ? false : true;
		} else {
			Settings_data.useHdTextures = true;
		}

		// LOCAL MAP
		const mapPlanetTransparency = window.localStorage.getItem('mapPlanetTransparency');
		const mapGrid = window.localStorage.getItem('mapGrid');
		const mapTerminator = window.localStorage.getItem('mapTerminator');
		const mapOMs = window.localStorage.getItem('mapOMs');
		const mapTimes = window.localStorage.getItem('mapTimes');
		const mapStars = window.localStorage.getItem('mapStars');

		if (mapPlanetTransparency) {
			UI_Data.el('map-Settings_data-planet-transparency').value = parseInt(mapPlanetTransparency);
		}

		if (mapGrid) {
			UI_Data.el('map-Settings_data-show-grid').checked = (mapGrid === 'false') ? false : true;
		}

		if (mapTerminator) {
			UI_Data.el('map-Settings_data-show-terminator').checked = (mapTerminator === 'false') ? false : true;
		}

		if (mapOMs) {
			UI_Data.el('map-Settings_data-show-orbitalmarkers').checked = (mapOMs === 'false') ? false : true;
		}

		if (mapTimes) {
			UI_Data.el('map-Settings_data-show-times').checked = (mapTimes === 'false') ? false : true;
		}

		if (mapStars) {
			UI_Data.el('map-Settings_data-show-starfield').checked = (mapStars === 'false') ? false : true;
		}

		// ATLAS
		const atlasLolli = window.localStorage.getItem('atlasLollipops');
		const atlasWorm = window.localStorage.getItem('atlasWormholes');
		const atlasAffil = window.localStorage.getItem('atlasAffiliation');
		const atlasGrid = window.localStorage.getItem('atlasGrid');

		if (atlasLolli) {
			UI_Data.el('atlas-Settings_data-show-lollipops').checked = (atlasLolli === 'false') ? false : true;
		}

		if (atlasWorm) {
			UI_Data.el('atlas-Settings_data-show-wormholes').checked = (atlasWorm === 'false') ? false : true;
		}

		if (atlasAffil) {
			UI_Data.el('atlas-Settings_data-show-affiliation').checked = (atlasAffil === 'false') ? false : true;
		}

		if (atlasGrid) {
			UI_Data.el('atlas-Settings_data-show-grid').checked = (atlasGrid === 'false') ? false : true;
		}
	}

	#setDefaultLocation() {
		let result = DB.locations.filter(location => {
			return location.NAME === 'Orison';
		});
		Settings_data.activeLocation = result[0];
		Settings_data.save('activeLocation', result[0].NAME);
	}

	save(key, value) {
		window.localStorage.setItem(key, value);
	}

	getCelestialBodyTexturePath(body) {
		if (!(body instanceof CelestialBody)) {
			console.error('Parameter is not of type CelestialBody:', body);
			return null;
		}

		const directory = Settings_data.useHdTextures ? 'bodies-hd' : 'bodies';
		return `textures/${directory}/${body.NAME.toLowerCase()}.webp`;
	}

	getCelestialBodyTexturePaths(body) {
		if (!(body instanceof CelestialBody)) {
			console.error('Parameter is not of type CelestialBody:', body);
			return null;
		}

		const mainTexture = this.getCelestialBodyTexturePath(body);

		const pathReflectCheck = `textures/bodies-reflection/${body.NAME.toLowerCase()}.webp`;
		const reflectionFileExists = this.imageExists(pathReflectCheck);
		const reflectTexture = reflectionFileExists ? pathReflectCheck : 'textures/bodies-reflection/no-reflection.webp';

		return {
			'main': mainTexture,
			'reflection': reflectTexture
		};
	}

	imageExists(image_url) {
		let http = new XMLHttpRequest();
		http.open('HEAD', image_url, false);
		try {
			http.send();
        } catch (e) {

        }
		return http.status != 404;
	}
}

const Settings_data = new Preferences_data_data();
export default Settings_data;