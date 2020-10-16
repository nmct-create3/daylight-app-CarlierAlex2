//const key = "75dde4b3c7msh17f23cdc7ce3a37p1b96cbjsn28b62e715f49";
const key = "c6e6e6c4055b2ff8b28b067cdedb959c";



//#region ===== helper functions  //============================================================================================================================================================
const formatTime = (date) =>{
	const hours = date.getHours();
	const minutes = date.getMinutes();
	return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
};


const parseMilliseconds = (timestamp) =>{
	//Get hours from milliseconds
	const date = convertSecondToDate(timestamp);
	return formatTime(date);
};


const convertSecondToDate = (seconds) =>{
	return new Date(seconds * 1000); //API in seconden => * 1000 voor milli
};


const getBottomPercentage = (percentage)=>{
	return percentage < 50? percentage * 2 : (100 - percentage) * 2; //tot hoogste stand van de zon gaat het naar boven, daarna naar beneden
};


const letItBeNight = () =>{
	//console.log("Enable nightmode");
	document.querySelector('html').classList.add('is-night');
};


const letItBeDay = () =>{
	//console.log("Disable nightmode");
	document.querySelector('html').classList.remove('is-night');
};
//#endregion



//#region ===== 5 TODO: maak updateSun functie  //============================================================================================================================================================
const updateSun = (sun, sunLeft, sunBottom, now) => {
	sun.style.left = `${sunLeft}%`;
	sun.style.bottom = `${sunBottom}%`;

	const currentTimeStamp = formatTime(now);
	sun.setAttribute('data-time', currentTimeStamp);
};
//#endregion



//#region ===== 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.  //============================================================================================================================================================
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
	const sunHTML = document.querySelector('.js-sun');
	const timeHTML = document.querySelector('.js-time-left');

	// Bepaal het aantal minuten dat de zon al op is.
	const now = new Date();
	const minutesNow = (now.getHours() * 60 + now.getMinutes());

	const sunriseDate = convertSecondToDate(sunrise)
	const minutesSunrise = (sunriseDate.getHours() * 60 + sunriseDate.getMinutes());

	let minutesBeenUp = minutesNow - minutesSunrise; //let omdat later updaten
	const minutesLeft = totalMinutes - minutesBeenUp;

	const sunLeft = (minutesBeenUp/totalMinutes) * 100;
	const sunBottom = getBottomPercentage(sunLeft); //tot hoogste stand van de zon gaat het naar boven, daarna naar beneden

	// Zet initiële goede positie zon
	updateSun(sunHTML, sunLeft, sunBottom, now);

	// Voeg de 'is-loaded' class toe aan de body-tag.
	document.body.classList.add('is-loaded');

	// Vul het resterende aantal minuten in.
	let minutesLeftDisplay = Math.floor(minutesLeft);
	if(minutesLeftDisplay < 0)
		minutesLeftDisplay = 0;
	timeHTML.innerHTML = minutesLeftDisplay;

	// Bekijk of de zon niet nog onder of reeds onder is
	if(minutesBeenUp > totalMinutes || minutesBeenUp < 0)
	{
		letItBeNight();
	}

	// Updaten zon elke minuut (wordt pas na 1 minuut gestart)
	const t = setInterval(() => {
		console.log("checkSun");
		if(minutesBeenUp > totalMinutes)
		{
			//clearInterval(t);
			letItBeNight();
		}
		else if(minutesBeenUp < 0)
		{
			letItBeNight();
		}
		else
		{
			letItBeDay();
	
			// Zon updaten via de updateSun functie.
			const now = new Date();
			const left = (100/totalMinutes) * minutesBeenUp;
			const bottom = getBottomPercentage(left);
	
			// Update resterend aantal minuten en verhoog aantal verstreken minuten.
			updateSun(sunHTML, left, bottom, now);
			minutesBeenUp++;
		}	
	}
	,60000);
};
//#endregion



//#region ===== 3 Met de data van de API kunnen we de app opvullen  //============================================================================================================================================================
const showResult = queryResponse => {
	console.log(queryResponse);
	// Geef locatie weer
	const locatieHTML = document.querySelector('.js-location');
	const stad = queryResponse.city.name;
	const country = queryResponse.city.country;
	locatieHTML.innerText = `${stad}, ${country}`;

	// Toon  tijd voor de zonsopkomst en -ondergang
	const sunriseHTML = document.querySelector('.js-sunrise');
	const sunrise = queryResponse.city.sunrise;
	const sunriseText = parseMilliseconds(sunrise);
	sunriseHTML.innerText = sunriseText;

	const sunsetHTML = document.querySelector('.js-sunset');
	const sunset = queryResponse.city.sunset;
	const sunsetText = parseMilliseconds(sunset);
	sunsetHTML.innerText = sunsetText;

	// Geef zon positie en update
	// Geef de periode tussen sunrise en sunset en het tijdstip van sunrise mee
	const timeDifference = ((sunset - sunrise) / 60); //API staat seconden -> /60 voor minuten
	placeSunAndStartMoving(timeDifference, sunrise);
};
//#endregion



//#region ===== 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.  //============================================================================================================================================================
const getAPI = async(lat, lon) => {
	// Eerst bouwen we onze url op
	endpoint = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=nl&cnt=1`;
	// Met de fetch API proberen we de data op te halen.
	const responseData = await fetch(endpoint).then((response) =>
        {
            if(!response.ok)
                throw Error(`Er is een probleem opgetreden: ${response.status}`);
            else
                return response.json();
    
        }
    )
    .catch((error) =>{console.log(`Fout bij het verwerken van json: ${error}`);}
	)
	// Als dat gelukt is, gaan we naar onze showResult functie.
	showResult(responseData);
};
//#endregion



//============================================================================================================================================================
document.addEventListener('DOMContentLoaded', function() {
	// 1 We will query the API with longitude and latitude.
	getAPI(50.8027841, 3.2097454);
});

