'use strict';

/**
 * Implementace publisher-subscriber patternu
 * @class PubSub
 */
function PubSub () {
	this._topics = {};
	this._subUid = -1;
}

/**
 * Metoda pro vyvolani udalosti.
 * @param  {String} topic Nazev vyvolavane udalosti.
 * @param  {Any} args  		Data spojena s udalosti.
 * @return {Boolean}      Priznak udavajici, zda notifikace posluchacu probehla uspesne.
 */
PubSub.prototype.publish = function (topic, args) {
	var topics = this._topics;

	if (!topics[topic]) {
		return false;
	}

	// obsluhy spustim asynchronne v pristim event loopu (aby funkce nejdrive vratila navratovou hodnotu)
	setImmediate(function () {
		var subscribers = topics[topic],
			len = subscribers ? subscribers.length : 0;

		while (len--) {
			subscribers[len].func(topic, args);
		}
	});

	return true;	
};

/**
 * Registrace posluchace dane udalosti.
 * @param  {String} topic  Nazev udalosti, na kterou chceme reagovat.
 * @param  {Function} func Funkce, ktera se zavola, pokud dana udalost nastane. 
 * @return {String}        Identifikator posluchace slouzici pro odveseni posluchace.
 */
PubSub.prototype.subscribe = function (topic, func) {
	var topics = this._topics;

	if (!topics[topic]) {
		topics[topic] = [];
	}

	var token = (++this._subUid).toString();

	topics[topic].push({
		token: token,
		func: func
	});

	return token;
};

/**
 * Odveseni posluchace.
 * @param  {String} token 	Identifikator posluchace, ktery se ma odvesit.
 * @return {String|Boolean}	Identifikator posluchace, ktery byl ovesen nebo false v pripade, zezadny posluchac odvesen nebyl.
 */
PubSub.prototype.unsubscribe = function (token) {
	var topics = this._topics;

	for (var m in topics) {
		if (topics[m]) {
			for (var i = 0, j = topics[m].length; i < j; i++) {
				if (topics[m][i].token === token) {
					topics[m].splice(i, 1);
					return token;
				}
			}
		}
	}

	return false;
};

module.exports = PubSub;
