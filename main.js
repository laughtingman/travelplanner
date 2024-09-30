const types = [
	{
		id: "train",
		name: "поезд",
		icon: "train",
		category: "route",
	},
	{
		id: "bus",
		name: "автобус",
		icon: "directions_bus",
		category: "route",
	},
	{
		id: "airplane",
		name: "самолёт",
		icon: "flight",
		category: "route",
	},
	{
		id: "boat",
		name: "корабль, паром",
		icon: "directions_boat",
		category: "route",
	},
	{
		id: "bike",
		name: "велосипед, мотоцикл",
		icon: "directions_bike",
		category: "route",
	},
	{
		id: "car",
		name: "машина",
		icon: "directions_car",
		category: "route",
	},
	{
		id: "taxi",
		name: "такси",
		icon: "local_taxi",
		category: "route",
	},
	{
		id: "hotel",
		name: "отель",
		icon: "hotel",
		category: "residence",
	},
	{
		id: "apartments",
		name: "апартаменты",
		icon: "apartment",
		category: "residence",
	},
	{
		id: "cottage",
		name: "коттедж",
		icon: "cottage",
		category: "residence",
	},
	{
		id: "hostel",
		name: "хостел",
		icon: "night_shelter",
		category: "residence",
	},
	{
		id: "houseboat",
		name: "плавучий дом",
		icon: "houseboat",
		category: "residence",
	},
	{
		id: "camping",
		name: "кемпинг",
		icon: "holiday_village",
		category: "residence",
	},
	{
		id: "bungalow",
		name: "бунгало",
		icon: "bungalow",
		category: "residence",
	},
	{
		id: "food",
		name: "еда, кафе, рестораны",
		icon: "restaurant",
		category: "other",
	},
	{
		id: "transport",
		name: "общественный транспорт",
		icon: "tram",
		category: "other",
	},
	{
		id: "museum",
		name: "музеи, выставки, достопримечательности",
		icon: "museum",
		category: "other",
	},
	{
		id: "concert",
		name: "спектакли, концерты, фестивали",
		icon: "theater_comedy",
		category: "other",
	},
	{
		id: "attractions",
		name: "развлечения",
		icon: "attractions",
		category: "other",
	},
	{
		id: "bar",
		name: "бары, пабы, клубы",
		icon: "nightlife",
		category: "other",
	},
	{
		id: "sport",
		name: "спорт, фитнес",
		icon: "sports_baseball",
		category: "other",
	},
	{
		id: "health",
		name: "красота и здоровье",
		icon: "spa",
		category: "other",
	},
	{
		id: "shops",
		name: "покупки, сувениры",
		icon: "local_mall",
		category: "other",
	},
	{
		id: "tour",
		name: "экскурсии",
		icon: "tour",
		category: "other",
	},
	{
		id: "business",
		name: "рабочие дела",
		icon: "business_center",
		category: "other",
	},
	{
		id: "none",
		name: "нет",
		icon: "place",
		category: "none",
	},
];

const app = new Vue({
	el: "#app",
	data() {
		return {
			types: types,
			tab: "cities",
			timezones: [],
			moment: moment,
			money: new Intl.NumberFormat("ru-RU", {
				style: "currency",
				currency: "RUB",
			}),
			cities: [],
			points: [],
			currencies: [
				{
					id: "RUB",
					nominal: 1,
					name: {
						short: "российский рубль",
						full: "(RUB) российский рубль",
					},
					value: 1,
				},
			],
		};
	},
	mounted() {
		moment.locale("ru");
		moment.relativeTimeThreshold("h", 24);
		moment.relativeTimeThreshold("m", 60);
		let timeZones = moment.tz.names();
		let tzs = [];
		for (let i in timeZones) {
			tzs.push({
				value: timeZones[i],
				name: `(GMT${moment.tz(timeZones[i]).format("Z")}) ${timeZones[i]}`,
			});
		}

		this.timezones = tzs.sort((a, b) => (a.name > b.name ? 1 : -1));

		if (localStorage["travel_cities"] != undefined) {
			this.cities = JSON.parse(localStorage["travel_cities"]);
		}

		if (localStorage["travel_points"] != undefined) {
			this.points = JSON.parse(localStorage["travel_points"]);
		}
	},
	updated() {},
	methods: {
		addCity() {
			let city = {
				id: new Date().valueOf(),
				name: "Город без имени",
				timezone: moment.tz.guess(),
				edit: true,
				currency: "RUB",
			};
			this.cities.push(city);
			this.$nextTick(() => {
				this.$refs.cityName[0].select();
			});
		},
		remCity(cityId) {
			if (confirm("Точно удалить город?")) {
				this.cities = this.cities.filter((z) => z.id != cityId);
				for (let point of this.points) {
					if (point.cityStart == cityId) {
						point.cityStart = "";
					}

					if (point.cityEnd == cityId) {
						point.cityEnd = "";
					}
				}
			}
		},
		addPoint(cityId, category, type = "none") {
			this.saveAll();
			let last = this.points[this.points.length - 1];
			let dateStart = "";
			if (last != null) {
				cityId = last.cityEnd != "" ? last.cityEnd : last.cityStart;
				dateStart = last.dateEnd != "" ? last.dateEnd : last.dateStart;
			}

			let point = {
				id: new Date().valueOf(),
				name: "",
				cityStart: cityId,
				cityEnd: "",
				category: category,
				type: type,
				dateStart: dateStart,
				dateEnd: "",
				timeStart: "",
				timeEnd: "",
				price: 0,
				count: 1,
				payed: false,
				currency: "RUB",
				comment: "",
				edit: true,
			};

			this.points.push(point);
		},
		remPoint(pointId) {
			if (confirm("Точно удалить запись?")) {
				this.points = this.points.filter((z) => z.id != pointId);
				this.saveAll();
			}
		},
		saveAll() {
			for (let city of this.cities) {
				city.edit = false;
			}
			for (let point of this.points) {
				point.edit = false;
			}

			this.points = this.points.sort((a, b) => {
				let d1 = a.dateStart + " " + a.timeStart,
					d2 = b.dateStart + " " + b.timeStart,
					tz1 = this.getTimezoneByCity(a.cityStart),
					tz2 = this.getTimezoneByCity(b.cityStart);

				if (a.dateStart == "" && b.dateStart != "") return 1;
				if (a.dateStart != "" && b.dateStart == "") return -1;
				if (a.dateStart == "" && b.dateStart == "") return 0;

				return moment.tz(d1.trim(), tz1) - moment.tz(d2.trim(), tz2);
			});

			localStorage.setItem("travel_cities", JSON.stringify(this.cities));
			localStorage.setItem("travel_points", JSON.stringify(this.points));
		},
		removeAll() {
			if (confirm("Точно удалить ВСЕ записи? Вернуть обратно будет нельзя!")) {
				this.cities = [];
				this.points = [];
				this.saveAll();
			}
		},
		typesByCategory(category) {
			return this.types.filter((z) => z.category == category);
		},
		typeById(typeId) {
			return this.types.find((z) => z.id == typeId);
		},
		getPointTitle(point) {
			let title = "";

			if (point.category == "route") {
				if (point.cityStart != "") {
					title += this.getCityName(point.cityStart);
				} else {
					title += this.getTypeName(point.type);
				}

				if (point.cityEnd != "" && point.cityEnd != point.cityStart) {
					title += " → " + this.getCityName(point.cityEnd);
				}
			} else {
				if (point.name != "") {
					title += point.name;
				} else {
					title += this.getTypeName(point.type);
				}
			}

			return title;
		},

		getPointDates(point) {
			let dates = "";

			if (point.dateStart != "") {
				if (point.timeStart != "") {
					dates += moment(point.dateStart + " " + point.timeStart).format("D MMMM, HH:mm");
				} else {
					dates += moment(point.dateStart).format("D MMMM");
				}
			}

			if (point.dateEnd != "") {
				dates += " – ";
				if (point.timeEnd != "") {
					dates += moment(point.dateEnd + " " + point.timeEnd).format("D MMMM, HH:mm");
				} else {
					dates += moment(point.dateEnd).format("D MMMM");
				}
			}

			return dates;
		},

		getPointPrice(point) {
			let currency = this.currencies.find((z) => z.id == point.currency);
			return this.money.format((point.price * point.count * currency.value) / currency.nominal);
		},

		getPointDuration(point) {
			if (point.dateStart == "" || point.dateEnd == "" || point.timeStart == "" || point.timeEnd == "") return "";

			let tzStart = this.getTimezoneByCity(point.cityStart),
				tzEnd = null;

			if (point.cityEnd != "") {
				tzEnd = this.getTimezoneByCity(point.cityEnd);
			} else {
				tzEnd = tzStart;
			}

			let dateFrom = moment.tz(point.dateStart + " " + point.timeStart, tzStart),
				dateTo = moment.tz(point.dateEnd + " " + point.timeEnd, tzEnd),
				diff = dateTo.diff(dateFrom);

			if (point.category == "route") {
				return (
					humanizeDuration(diff, {
						language: "ru",
					}) + " в пути"
				);
			} else {
				return humanizeDuration(diff, {
					language: "ru",
					units: ["d"],
					round: true,
				});
			}
		},

		getCityName(cityId) {
			return this.cities.find((z) => z.id == cityId).name;
		},

		getCityCurrency(cityId) {
			return this.cities.find((z) => z.id == cityId).currency;
		},

		getTypeName(typeId) {
			return this.types.find((z) => z.id == typeId).name;
		},

		getTimezoneByCity(cityId) {
			if (cityId == "") return moment.tz.guess();
			return this.cities.find((z) => z.id == cityId).timezone;
		},

		showDate(point, end = false) {
			if (point.dateStart == "") return false;
			let first = null;
			if (!end) {
				first = this.points.find((z) => {
					return z.dateStart != "" && moment(z.dateStart).isSame(moment(point.dateStart), "day");
				});
			} else {
				first = this.points.find((z) => {
					return z.dateEnd != "" && moment(z.dateStart).isSame(moment(point.dateEnd), "day");
				});
			}
			return first != null ? first.id == point.id : true;
		},
		getEndings(point) {
			//находим все пункты, у которых есть дата завершения
			let endedPoints = this.points.filter((z) => {
				if (z.dateEnd == "" || z.timeEnd == "") return false;
				let dateStartPoint = this.getStartDate(point),
					dateStartEnding = this.getStartDate(z),
					dateEndEnding = this.getEndDate(z);

				//находим есть ли пункт после этого, но перед завершением
				let lastedPoint = this.points.find((somePoint) => {
					let dateStartSomePint = this.getStartDate(somePoint);
					if (dateStartSomePint != null) {
						return dateStartSomePint > dateStartPoint && dateStartSomePint < dateEndEnding;
					} else {
						return false;
					}
				});

				if (dateStartPoint != null && dateEndEnding != null && dateStartEnding != null) {
					return dateStartPoint < dateEndEnding && dateStartEnding < dateStartPoint && lastedPoint == null;
				} else {
					return false;
				}
			});

			return endedPoints;
		},

		getStartDate(point) {
			if (point.dateStart == "" || point.timeStart == "") return null;
			let tz = this.getTimezoneByCity(point.cityStart);
			return moment.tz(point.dateStart + " " + point.timeStart, tz);
		},

		getEndDate(point) {
			let tz = null;

			if (point.dateEnd == "" || point.timeEnd == "") return null;
			if (point.category == "residence") {
				tz = this.getTimezoneByCity(point.cityStart);
				return moment.tz(point.dateEnd + " " + point.timeEnd, tz);
			} else if (point.category == "route") {
				if (point.cityEnd != "") {
					tz = this.getTimezoneByCity(point.cityEnd);
				} else {
					tz = this.getTimezoneByCity(point.cityStart);
				}
				return moment.tz(point.dateEnd + " " + point.timeEnd, tz);
			}
		},

		getFilteredCurrencies(cityStart, cityEnd) {
			let codes = ["RUB", "EUR", "USD"];
			if (cityStart) {
				codes.push(this.getCityCurrency(cityStart));
			}

			if (cityEnd) {
				codes.push(this.getCityCurrency(cityEnd));
			}

			console.log(cityStart, cityEnd);
			return this.currencies.filter((z) => codes.includes(z.id));
		},
	},
	computed: {
		costs() {
			let spent = 0,
				needPay = 0,
				transport = 0,
				living = 0,
				food = 0,
				other = 0;

			for (let point of this.points) {
				if (point.price > 0) {
					let currency = this.currencies.find((z) => z.id == point.currency);
					if (point.payed) {
						spent += (point.price * point.count * currency.value) / currency.nominal;
					} else {
						needPay += (point.price * point.count * currency.value) / currency.nominal;
					}

					if (point.category == "route" || point.type == "transport") {
						transport += (point.price * point.count * currency.value) / currency.nominal;
					}

					if (point.category == "residence") {
						living += (point.price * point.count * currency.value) / currency.nominal;
					}

					if (point.type == "food") {
						food += (point.price * point.count * currency.value) / currency.nominal;
					}

					if (point.category == "other" && point.type != "food") {
						other += (point.price * point.count * currency.value) / currency.nominal;
					}
				}
			}

			return {
				spent: spent,
				needPay: needPay,
				total: needPay + spent,
				transport: transport,
				living: living,
				food: food,
				other: other,
			};
		},
		pies() {
			let arr = [],
				pi = Math.PI * 100;

			let relativeSize = (this.costs.transport / this.costs.total) * pi,
				startingPoint = 0;

			arr.push({
				relativeSize: relativeSize,
				offset: 0,
				stroke: "#0dcaf0",
			});

			startingPoint += relativeSize;
			(relativeSize = (this.costs.living / this.costs.total) * pi),
				arr.push({
					relativeSize: relativeSize,
					offset: -startingPoint,
					stroke: "#6f42c1",
				});

			startingPoint += relativeSize;
			(relativeSize = (this.costs.food / this.costs.total) * pi),
				arr.push({
					relativeSize: relativeSize,
					offset: -startingPoint,
					stroke: "#d63384",
				});

			startingPoint += relativeSize;
			(relativeSize = (this.costs.other / this.costs.total) * pi),
				arr.push({
					relativeSize: relativeSize,
					offset: -startingPoint,
					stroke: "#20c997",
				});

			return arr;
		},
	},
});

//получаем курсы валют от ЦБ или берем из кэша

const getJSON = async (url) => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(response.statusText);
	const data = await response.json();
	return data;
};

function getCurrencyName(code) {
	let m = new Intl.NumberFormat("ru-RU", {
		style: "currency",
		currency: code,
		currencyDisplay: "name",
		maximumSignificantDigits: 1,
	});

	let name = m.format(1).replace("1 ", "");

	return {
		full: "(" + code + ") " + name,
		short: name,
	};
}

function loadCurrencies() {
	console.log("cbr request");
	getJSON("https://www.cbr-xml-daily.ru/daily_json.js")
		.then((data) => {
			for (let key in data.Valute) {
				let valute = data.Valute[key];
				let currency = {
					id: valute.CharCode,
					nominal: valute.Nominal,
					name: getCurrencyName(valute.CharCode),
					value: valute.Value,
				};
				app.currencies.push(currency);
				localStorage.setItem("cbr_currencies", JSON.stringify(app.currencies));
				localStorage.setItem("cbr_currencies_update", data.PreviousDate);
			}
		})
		.catch((error) => {
			console.error(error);
		});
}

if (localStorage["cbr_currencies_update"] != undefined) {
	if (moment(localStorage["cbr_currencies_update"]).isSame(moment(), "day")) {
		app.currencies = JSON.parse(localStorage["cbr_currencies"]);
	} else {
		loadCurrencies();
	}
} else {
	loadCurrencies();
}
